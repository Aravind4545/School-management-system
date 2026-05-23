import pool from '../config/db.js';

export async function getLeaderboard(type = 'mock', limit = 20) {
  if (type === 'mock') {
    const [mock] = await pool.query(`SELECT id FROM mock_tests WHERE is_active = 1 LIMIT 1`);
    if (!mock.length) return [];
    const [rows] = await pool.query(
      `SELECT s.name, s.pin, sr.total_marks, r.overall_rank, r.percentile
       FROM rankings r
       JOIN students s ON s.id = r.student_id
       JOIN student_results sr ON sr.attempt_id = r.attempt_id AND sr.attempt_type = 'mock'
       WHERE r.attempt_type = 'mock' AND r.reference_id = :mockId
       ORDER BY r.overall_rank ASC LIMIT :limit`,
      { mockId: mock[0].id, limit }
    );
    return rows;
  }

  const [rows] = await pool.query(
    `SELECT s.name, s.pin, sr.total_marks, r.overall_rank, r.percentile
     FROM rankings r
     JOIN students s ON s.id = r.student_id
     JOIN student_results sr ON sr.attempt_id = r.attempt_id AND sr.attempt_type = 'quiz'
     WHERE r.attempt_type = 'quiz'
     ORDER BY sr.total_marks DESC LIMIT :limit`,
    { limit }
  );
  return rows;
}

export async function getWeeklyProgress(studentId) {
  const [rows] = await pool.query(
    `SELECT DATE(created_at) as date, attempt_type, total_marks, max_marks, accuracy
     FROM student_results WHERE student_id = :studentId
     AND created_at >= datetime('now', '-8 weeks')
     ORDER BY created_at ASC`,
    { studentId }
  );
  const weekly = {};
  for (const r of rows) {
    const week = new Date(r.date).toISOString().slice(0, 10);
    if (!weekly[week]) weekly[week] = { quiz: [], mock: [] };
    weekly[week][r.attempt_type].push({
      marks: r.total_marks,
      max: r.max_marks,
      accuracy: parseFloat(r.accuracy),
    });
  }
  return Object.entries(weekly).map(([week, data]) => ({
    week,
    avgAccuracy:
      [...data.quiz, ...data.mock].reduce((s, x) => s + x.accuracy, 0) /
        Math.max([...data.quiz, ...data.mock].length, 1) || 0,
    attempts: data.quiz.length + data.mock.length,
  }));
}
