import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import pool from '../config/db.js';
import { rotateMockSets } from '../services/mockService.js';
import { getLeaderboard, getWeeklyProgress } from '../services/rankService.js';

const storage = multer.diskStorage({
  destination: process.env.UPLOAD_DIR || './uploads',
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
export const upload = multer({ storage });

export const uploadPaper = async (req, res, next) => {
  try {
    const { module, category, subject, year, title } = req.body;
    const filePath = req.file ? `/uploads/${req.file.filename}` : req.body.file_path;
    const [result] = await pool.query(
      `INSERT INTO previous_papers (module, category, subject, year, title, file_path, uploaded_by)
       VALUES (:module, :category, :subject, :year, :title, :filePath, :adminId)`,
      {
        module,
        category,
        subject: subject || null,
        year: year || null,
        title,
        filePath,
        adminId: req.user.id,
      }
    );
    res.status(201).json({ id: result.insertId, message: 'Paper uploaded' });
  } catch (err) {
    next(err);
  }
};

export const addQuestion = async (req, res, next) => {
  try {
    const { subject, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation } =
      req.body;
    const [result] = await pool.query(
      `INSERT INTO quiz_questions (subject, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
       VALUES (:subject, :difficulty, :question_text, :option_a, :option_b, :option_c, :option_d, :correct_option, :explanation)`,
      { subject, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation }
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    next(err);
  }
};

export const getStudents = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, pin, name, college, is_active, must_change_password, created_at FROM students ORDER BY id DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const { pin, name, college } = req.body;
    const hash = await bcrypt.hash(pin, 12);
    const [result] = await pool.query(
      `INSERT INTO students (pin, password_hash, name, college, must_change_password) VALUES (:pin, :hash, :name, :college, 1)`,
      { pin, hash, name, college }
    );
    res.status(201).json({ id: result.insertId, pin, message: 'Student created. First password = PIN' });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(400).json({ message: 'PIN already exists' });
    next(err);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const [students] = await pool.query(`SELECT COUNT(*) as count FROM students`);
    const [attempts] = await pool.query(`SELECT COUNT(*) as count FROM quiz_attempts WHERE status != 'in_progress'`);
    const [mocks] = await pool.query(`SELECT COUNT(*) as count FROM mock_attempts WHERE status != 'in_progress'`);
    const [badgeRows] = await pool.query(`SELECT badge_type, COUNT(*) as count FROM badges GROUP BY badge_type`);
    res.json({
      totalStudents: students[0]?.count ?? 0,
      quizAttempts: attempts[0]?.count ?? 0,
      mockAttempts: mocks[0]?.count ?? 0,
      badges: badgeRows,
    });
  } catch (err) {
    next(err);
  }
};

export const scheduleMock = async (req, res, next) => {
  try {
    const mock = await rotateMockSets();
    res.json({ message: 'Mock rotation applied', mock });
  } catch (err) {
    next(err);
  }
};

export const getAdminLeaderboard = async (req, res, next) => {
  try {
    const data = await getLeaderboard(req.query.type || 'mock');
    res.json(data);
  } catch (err) {
    next(err);
  }
};
