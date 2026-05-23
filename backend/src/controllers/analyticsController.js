import { getLeaderboard, getWeeklyProgress } from '../services/rankService.js';
import pool from '../config/db.js';

export const getLeaderboardHandler = async (req, res, next) => {
  try {
    const data = await getLeaderboard(req.query.type || 'mock', 20);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getWeekly = async (req, res, next) => {
  try {
    const data = await getWeeklyProgress(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getMyResults = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM student_results WHERE student_id = :id ORDER BY created_at DESC LIMIT 20`,
      { id: req.user.id }
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
