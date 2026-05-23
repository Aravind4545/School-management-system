import pool from '../config/db.js';
import { hasGoldBadge } from './quizService.js';

const SECTION_COUNTS = { physics: 40, chemistry: 40, mathematics: 80 };

export async function getActiveMock() {
  const [rows] = await pool.query(
    `SELECT * FROM mock_tests WHERE is_active = 1 AND archived = 0 ORDER BY id DESC LIMIT 1`
  );
  return rows[0] || null;
}

export async function checkMockAccess(studentId) {
  const unlocked = await hasGoldBadge(studentId);
  const mock = await getActiveMock();
  return { unlocked, mock };
}

export async function startMock(studentId) {
  const unlocked = await hasGoldBadge(studentId);
  if (!unlocked) throw Object.assign(new Error('Gold badge required for mock test'), { status: 403 });

  const mock = await getActiveMock();
  if (!mock) throw Object.assign(new Error('No active mock test'), { status: 404 });

  const [existing] = await pool.query(
    `SELECT id FROM mock_attempts WHERE student_id = :studentId AND mock_test_id = :mockTestId AND status = 'in_progress' LIMIT 1`,
    { studentId, mockTestId: mock.id }
  );
  if (existing.length) return getMockAttemptDetails(existing[0].id, studentId);

  let [questions] = await pool.query(
    `SELECT mtq.question_id, mtq.section, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d
     FROM mock_test_questions mtq
     JOIN quiz_questions q ON q.id = mtq.question_id
     WHERE mtq.mock_test_id = :mockTestId ORDER BY mtq.sort_order`,
    { mockTestId: mock.id }
  );

  if (questions.length < 160) {
    questions = await generateMockQuestions(mock.id);
  }

  const [result] = await pool.query(
    `INSERT INTO mock_attempts (student_id, mock_test_id) VALUES (:studentId, :mockTestId)`,
    { studentId, mockTestId: mock.id }
  );
  const attemptId = result.insertId;

  for (const q of questions) {
    await pool.query(
      `INSERT INTO mock_attempt_answers (attempt_id, question_id) VALUES (:attemptId, :questionId)`,
      { attemptId, questionId: q.question_id || q.id }
    );
  }

  return {
    attemptId,
    mockTestId: mock.id,
    title: mock.title,
    setCode: mock.set_code,
    questions: questions.map((q, i) => ({
      id: q.question_id || q.id,
      section: q.section,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      number: i + 1,
    })),
    timeLimitSec: 180 * 60,
  };
}

async function generateMockQuestions(mockTestId) {
  const allQuestions = [];
  for (const [section, count] of Object.entries(SECTION_COUNTS)) {
    const [rows] = await pool.query(
      `SELECT id, subject, question_text, option_a, option_b, option_c, option_d
       FROM quiz_questions WHERE subject = :section AND is_active = 1 ORDER BY RANDOM() LIMIT :count`,
      { section, count }
    );
    let order = allQuestions.length;
    for (const q of rows) {
      await pool.query(
        `INSERT OR IGNORE INTO mock_test_questions (mock_test_id, question_id, section, sort_order)
         VALUES (:mockTestId, :questionId, :section, :sortOrder)`,
        { mockTestId, questionId: q.id, section, sortOrder: order++ }
      );
      allQuestions.push({ ...q, question_id: q.id, section });
    }
  }
  return allQuestions;
}

export async function getMockAttemptDetails(attemptId, studentId) {
  const [attempts] = await pool.query(
    `SELECT ma.*, mt.title, mt.set_code FROM mock_attempts ma
     JOIN mock_tests mt ON mt.id = ma.mock_test_id
     WHERE ma.id = :attemptId AND ma.student_id = :studentId`,
    { attemptId, studentId }
  );
  if (!attempts.length) throw Object.assign(new Error('Attempt not found'), { status: 404 });

  const [questions] = await pool.query(
    `SELECT q.id, mtq.section, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, a.selected_option
     FROM mock_attempt_answers a
     JOIN quiz_questions q ON q.id = a.question_id
     JOIN mock_test_questions mtq ON mtq.question_id = q.id AND mtq.mock_test_id = :mockTestId
     WHERE a.attempt_id = :attemptId ORDER BY mtq.sort_order`,
    { attemptId, mockTestId: attempts[0].mock_test_id }
  );

  return {
    attemptId: attempts[0].id,
    title: attempts[0].title,
    setCode: attempts[0].set_code,
    status: attempts[0].status,
    violations: attempts[0].violations,
    questions: questions.map((q, i) => ({ ...q, number: i + 1 })),
    timeLimitSec: 180 * 60,
  };
}

export async function saveMockAnswer(attemptId, studentId, questionId, selectedOption) {
  const [attempts] = await pool.query(
    `SELECT id, status FROM mock_attempts WHERE id = :attemptId AND student_id = :studentId`,
    { attemptId, studentId }
  );
  if (!attempts.length || attempts[0].status !== 'in_progress') {
    throw Object.assign(new Error('Invalid attempt'), { status: 400 });
  }
  await pool.query(
    `UPDATE mock_attempt_answers SET selected_option = :selectedOption, answered_at = NOW()
     WHERE attempt_id = :attemptId AND question_id = :questionId`,
    { attemptId, questionId, selectedOption }
  );
  return { saved: true };
}

export async function recordMockViolation(attemptId, studentId) {
  await pool.query(
    `UPDATE mock_attempts SET violations = violations + 1 WHERE id = :attemptId AND student_id = :studentId`,
    { attemptId, studentId }
  );
  const [rows] = await pool.query(`SELECT violations FROM mock_attempts WHERE id = :attemptId`, { attemptId });
  return rows[0]?.violations || 0;
}

export async function submitMock(attemptId, studentId, timeSpentSec = 0, autoSubmit = false) {
  const [attempts] = await pool.query(
    `SELECT ma.*, mt.id as mock_test_id FROM mock_attempts ma
     JOIN mock_tests mt ON mt.id = ma.mock_test_id
     WHERE ma.id = :attemptId AND ma.student_id = :studentId`,
    { attemptId, studentId }
  );
  if (!attempts.length) throw Object.assign(new Error('Attempt not found'), { status: 404 });
  const attempt = attempts[0];
  if (attempt.status !== 'in_progress') return getMockResult(attemptId, studentId);

  const [answers] = await pool.query(
    `SELECT a.id, a.question_id, a.selected_option, q.correct_option, q.subject
     FROM mock_attempt_answers a JOIN quiz_questions q ON q.id = a.question_id
     WHERE a.attempt_id = :attemptId`,
    { attemptId }
  );

  let score = 0;
  const sectionScores = { physics: 0, chemistry: 0, mathematics: 0 };
  const sectionTotals = { physics: 0, chemistry: 0, mathematics: 0 };

  for (const ans of answers) {
    const correct = ans.selected_option === ans.correct_option;
    if (correct) score++;
    const subj = ans.subject;
    if (sectionTotals[subj] !== undefined) {
      sectionTotals[subj]++;
      if (correct) sectionScores[subj]++;
    }
    await pool.query(`UPDATE mock_attempt_answers SET is_correct = :c WHERE id = :id`, {
      id: ans.id,
      c: correct ? 1 : 0,
    });
  }

  const status = autoSubmit ? 'auto_submitted' : 'submitted';
  const maxMarks = answers.length;
  const accuracy = maxMarks ? ((score / maxMarks) * 100).toFixed(2) : 0;

  await pool.query(
    `UPDATE mock_attempts SET score = :score, physics_score = :ps, chemistry_score = :cs,
     mathematics_score = :ms, time_spent_sec = :time, status = :status, submitted_at = NOW() WHERE id = :id`,
    {
      id: attemptId,
      score,
      ps: sectionScores.physics,
      cs: sectionScores.chemistry,
      ms: sectionScores.mathematics,
      time: timeSpentSec,
      status,
    }
  );

  await pool.query(
    `INSERT INTO student_results (student_id, attempt_type, attempt_id, total_marks, max_marks, accuracy, subject_analysis_json, time_analysis_json)
     VALUES (:studentId, 'mock', :attemptId, :score, :maxMarks, :accuracy, :subj, :time)`,
    {
      studentId,
      attemptId,
      score,
      maxMarks,
      accuracy,
      subj: JSON.stringify({ sectionScores, sectionTotals }),
      time: JSON.stringify({ timeSpentSec }),
    }
  );

  await computeMockRankings(attempt.mock_test_id, attemptId);

  return {
    score,
    total: maxMarks,
    accuracy: parseFloat(accuracy),
    sectionScores,
    sectionTotals,
    status,
  };
}

export async function getMockResult(attemptId, studentId) {
  const [rows] = await pool.query(
    `SELECT ma.*, sr.accuracy, sr.subject_analysis_json FROM mock_attempts ma
     LEFT JOIN student_results sr ON sr.attempt_id = ma.id AND sr.attempt_type = 'mock'
     WHERE ma.id = :attemptId AND ma.student_id = :studentId`,
    { attemptId, studentId }
  );
  if (!rows.length) throw Object.assign(new Error('Result not found'), { status: 404 });
  const a = rows[0];
  const [rank] = await pool.query(
    `SELECT overall_rank, percentile FROM rankings WHERE attempt_id = :attemptId AND attempt_type = 'mock' AND student_id = :studentId`,
    { attemptId, studentId }
  );
  return {
    score: a.score,
    physicsScore: a.physics_score,
    chemistryScore: a.chemistry_score,
    mathematicsScore: a.mathematics_score,
    accuracy: a.accuracy,
    subjectStats: a.subject_analysis_json ? JSON.parse(a.subject_analysis_json) : {},
    rank: rank[0] || null,
    status: a.status,
  };
}

async function computeMockRankings(mockTestId, attemptId) {
  const [results] = await pool.query(
    `SELECT sr.student_id, sr.total_marks FROM student_results sr
     JOIN mock_attempts ma ON ma.id = sr.attempt_id
     WHERE sr.attempt_type = 'mock' AND ma.mock_test_id = :mockTestId
     ORDER BY sr.total_marks DESC`,
    { mockTestId }
  );
  const total = results.length;
  for (let i = 0; i < results.length; i++) {
    const percentile = total > 1 ? (((total - i - 1) / (total - 1)) * 100).toFixed(2) : 100;
    await pool.query(
      `INSERT INTO rankings (student_id, attempt_type, reference_id, attempt_id, overall_rank, percentile, total_participants)
       VALUES (:studentId, 'mock', :refId, :attemptId, :rank, :pct, :total)
       ON CONFLICT(attempt_type, reference_id, student_id) DO UPDATE SET
         overall_rank = excluded.overall_rank, percentile = excluded.percentile,
         total_participants = excluded.total_participants, attempt_id = excluded.attempt_id`,
      {
        studentId: results[i].student_id,
        refId: mockTestId,
        attemptId: attemptId,
        rank: i + 1,
        pct: percentile,
        total,
      }
    );
  }
}

export async function rotateMockSets() {
  const sets = ['A', 'B', 'C'];
  const dayIndex = Math.floor(Date.now() / (3 * 24 * 60 * 60 * 1000)) % 3;
  const activeSet = sets[dayIndex];

  await pool.query(`UPDATE mock_tests SET is_active = 0, archived = 1 WHERE set_code != :activeSet`, { activeSet });

  const [existing] = await pool.query(`SELECT id FROM mock_tests WHERE set_code = :activeSet AND archived = 0 LIMIT 1`, {
    activeSet,
  });

  if (existing.length) {
    await pool.query(`UPDATE mock_tests SET is_active = 1 WHERE id = :id`, { id: existing[0].id });
    return existing[0];
  }

  const today = new Date();
  const ends = new Date(today);
  ends.setDate(ends.getDate() + 3);

  const [result] = await pool.query(
    `INSERT INTO mock_tests (set_code, title, starts_at, ends_at, is_active) VALUES (:setCode, :title, :start, :end, 1)`,
    {
      setCode: activeSet,
      title: `EAMCET Mock Test Set ${activeSet}`,
      start: today.toISOString().slice(0, 10),
      end: ends.toISOString().slice(0, 10),
    }
  );
  await generateMockQuestions(result.insertId);
  return { id: result.insertId, set_code: activeSet };
}
