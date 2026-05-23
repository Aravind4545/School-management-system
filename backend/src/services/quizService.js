import pool from '../config/db.js';

const THRESHOLDS = { easy: 8, intermediate: 12, hard: 16 };
const BADGE_MAP = { easy: 'bronze', intermediate: 'silver', hard: 'gold' };

export async function startQuiz(studentId, level) {
  const [existing] = await pool.query(
    `SELECT id FROM quiz_attempts WHERE student_id = :studentId AND level = :level AND status = 'in_progress' LIMIT 1`,
    { studentId, level }
  );
  if (existing.length) {
    return getAttemptDetails(existing[0].id, studentId);
  }

  const [questions] = await pool.query(
    `SELECT id, subject, question_text, option_a, option_b, option_c, option_d
     FROM quiz_questions WHERE difficulty = :level AND is_active = 1 ORDER BY RANDOM() LIMIT 25`,
    { level }
  );
  if (questions.length < 25) {
    throw Object.assign(new Error('Not enough questions in database for this level'), { status: 400 });
  }

  const [result] = await pool.query(
    `INSERT INTO quiz_attempts (student_id, level, total_questions) VALUES (:studentId, :level, 25)`,
    { studentId, level }
  );
  const attemptId = result.insertId;

  for (const q of questions) {
    await pool.query(
      `INSERT INTO quiz_attempt_answers (attempt_id, question_id) VALUES (:attemptId, :questionId)`,
      { attemptId, questionId: q.id }
    );
  }

  return { attemptId, level, questions, timeLimitSec: 45 * 60 };
}

export async function getAttemptDetails(attemptId, studentId) {
  const [attempts] = await pool.query(
    `SELECT * FROM quiz_attempts WHERE id = :attemptId AND student_id = :studentId`,
    { attemptId, studentId }
  );
  if (!attempts.length) throw Object.assign(new Error('Attempt not found'), { status: 404 });
  const attempt = attempts[0];

  const [questions] = await pool.query(
    `SELECT q.id, q.subject, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, a.selected_option
     FROM quiz_attempt_answers a
     JOIN quiz_questions q ON q.id = a.question_id
     WHERE a.attempt_id = :attemptId ORDER BY a.id`,
    { attemptId }
  );

  return {
    attemptId: attempt.id,
    level: attempt.level,
    status: attempt.status,
    violations: attempt.violations,
    questions,
    timeLimitSec: 45 * 60,
  };
}

export async function saveAnswer(attemptId, studentId, questionId, selectedOption) {
  const [attempts] = await pool.query(
    `SELECT id, status FROM quiz_attempts WHERE id = :attemptId AND student_id = :studentId`,
    { attemptId, studentId }
  );
  if (!attempts.length || attempts[0].status !== 'in_progress') {
    throw Object.assign(new Error('Invalid attempt'), { status: 400 });
  }

  await pool.query(
    `UPDATE quiz_attempt_answers SET selected_option = :selectedOption, answered_at = NOW()
     WHERE attempt_id = :attemptId AND question_id = :questionId`,
    { attemptId, questionId, selectedOption }
  );
  return { saved: true };
}

export async function recordViolation(attemptId, studentId) {
  await pool.query(
    `UPDATE quiz_attempts SET violations = violations + 1 WHERE id = :attemptId AND student_id = :studentId`,
    { attemptId, studentId }
  );
  const [rows] = await pool.query(`SELECT violations FROM quiz_attempts WHERE id = :attemptId`, { attemptId });
  return rows[0]?.violations || 0;
}

export async function submitQuiz(attemptId, studentId, timeSpentSec = 0, autoSubmit = false) {
  const [attempts] = await pool.query(
    `SELECT * FROM quiz_attempts WHERE id = :attemptId AND student_id = :studentId`,
    { attemptId, studentId }
  );
  if (!attempts.length) throw Object.assign(new Error('Attempt not found'), { status: 404 });
  const attempt = attempts[0];
  if (attempt.status !== 'in_progress') {
    return getQuizResult(attemptId, studentId);
  }

  const [answers] = await pool.query(
    `SELECT a.id, a.question_id, a.selected_option, q.correct_option, q.subject
     FROM quiz_attempt_answers a
     JOIN quiz_questions q ON q.id = a.question_id
     WHERE a.attempt_id = :attemptId`,
    { attemptId }
  );

  let score = 0;
  const subjectStats = {};
  for (const ans of answers) {
    const correct = ans.selected_option === ans.correct_option;
    if (correct) score++;
    await pool.query(
      `UPDATE quiz_attempt_answers SET is_correct = :isCorrect WHERE id = :id`,
      { id: ans.id, isCorrect: correct ? 1 : 0 }
    );
    if (!subjectStats[ans.subject]) subjectStats[ans.subject] = { correct: 0, total: 0 };
    subjectStats[ans.subject].total++;
    if (correct) subjectStats[ans.subject].correct++;
  }

  const status = autoSubmit ? 'auto_submitted' : 'submitted';
  await pool.query(
    `UPDATE quiz_attempts SET score = :score, time_spent_sec = :timeSpentSec, status = :status, submitted_at = NOW()
     WHERE id = :attemptId`,
    { attemptId, score, timeSpentSec, status }
  );

  const accuracy = ((score / 25) * 100).toFixed(2);
  await pool.query(
    `INSERT INTO student_results (student_id, attempt_type, attempt_id, total_marks, max_marks, accuracy, subject_analysis_json, time_analysis_json)
     VALUES (:studentId, 'quiz', :attemptId, :score, 25, :accuracy, :subjectJson, :timeJson)`,
    {
      studentId,
      attemptId,
      score,
      accuracy,
      subjectJson: JSON.stringify(subjectStats),
      timeJson: JSON.stringify({ timeSpentSec }),
    }
  );

  const threshold = THRESHOLDS[attempt.level];
  let badgeEarned = null;
  if (score >= threshold) {
    badgeEarned = BADGE_MAP[attempt.level];
    await pool.query(
      `INSERT INTO badges (student_id, level, badge_type) VALUES (:studentId, :level, :badgeType)
       ON CONFLICT(student_id, level) DO UPDATE SET badge_type = excluded.badge_type, earned_at = datetime('now')`,
      { studentId, level: attempt.level, badgeType: badgeEarned }
    );
  }

  await computeQuizRankings(attemptId);

  return {
    score,
    total: 25,
    accuracy: parseFloat(accuracy),
    badgeEarned,
    level: attempt.level,
    subjectStats,
    status,
  };
}

export async function getQuizResult(attemptId, studentId) {
  const [attempts] = await pool.query(
    `SELECT qa.*, sr.accuracy, sr.subject_analysis_json FROM quiz_attempts qa
     LEFT JOIN student_results sr ON sr.attempt_id = qa.id AND sr.attempt_type = 'quiz'
     WHERE qa.id = :attemptId AND qa.student_id = :studentId`,
    { attemptId, studentId }
  );
  if (!attempts.length) throw Object.assign(new Error('Result not found'), { status: 404 });
  const a = attempts[0];
  const [rank] = await pool.query(
    `SELECT overall_rank, percentile FROM rankings WHERE attempt_id = :attemptId AND attempt_type = 'quiz' AND student_id = :studentId`,
    { attemptId, studentId }
  );
  const [badge] = await pool.query(
    `SELECT badge_type FROM badges WHERE student_id = :studentId AND level = :level`,
    { studentId, level: a.level }
  );
  return {
    score: a.score,
    total: a.total_questions,
    accuracy: a.accuracy,
    level: a.level,
    status: a.status,
    subjectStats: a.subject_analysis_json ? JSON.parse(a.subject_analysis_json) : {},
    rank: rank[0] || null,
    badge: badge[0]?.badge_type || null,
  };
}

async function computeQuizRankings(attemptId) {
  const [results] = await pool.query(
    `SELECT student_id, total_marks FROM student_results WHERE attempt_type = 'quiz' AND attempt_id IN (
       SELECT id FROM quiz_attempts WHERE level = (SELECT level FROM quiz_attempts WHERE id = :attemptId)
     ) ORDER BY total_marks DESC`,
    { attemptId }
  );
  const total = results.length;
  for (let i = 0; i < results.length; i++) {
    const percentile = total > 1 ? (((total - i - 1) / (total - 1)) * 100).toFixed(2) : 100;
    await pool.query(
      `INSERT INTO rankings (student_id, attempt_type, reference_id, attempt_id, overall_rank, percentile, total_participants)
       VALUES (:studentId, 'quiz', :attemptId, :attemptId, :rank, :percentile, :total)
       ON CONFLICT(attempt_type, reference_id, student_id) DO UPDATE SET
         overall_rank = excluded.overall_rank, percentile = excluded.percentile,
         total_participants = excluded.total_participants, attempt_id = excluded.attempt_id`,
      {
        studentId: results[i].student_id,
        attemptId,
        rank: i + 1,
        percentile,
        total,
      }
    );
  }
}

export async function hasGoldBadge(studentId) {
  const [rows] = await pool.query(
    `SELECT id FROM badges WHERE student_id = :studentId AND badge_type = 'gold' LIMIT 1`,
    { studentId }
  );
  return rows.length > 0;
}
