import * as quizService from '../services/quizService.js';

export const startQuiz = async (req, res, next) => {
  try {
    const data = await quizService.startQuiz(req.user.id, req.body.level);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getAttempt = async (req, res, next) => {
  try {
    const data = await quizService.getAttemptDetails(req.params.attemptId, req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const saveAnswer = async (req, res, next) => {
  try {
    const data = await quizService.saveAnswer(
      req.params.attemptId,
      req.user.id,
      req.body.questionId,
      req.body.selectedOption
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const recordViolation = async (req, res, next) => {
  try {
    const violations = await quizService.recordViolation(req.params.attemptId, req.user.id);
    if (violations >= 3) {
      const result = await quizService.submitQuiz(req.params.attemptId, req.user.id, req.body.timeSpentSec || 0, true);
      return res.json({ violations, autoSubmitted: true, result });
    }
    res.json({ violations, autoSubmitted: false });
  } catch (err) {
    next(err);
  }
};

export const submitQuiz = async (req, res, next) => {
  try {
    const result = await quizService.submitQuiz(
      req.params.attemptId,
      req.user.id,
      req.body.timeSpentSec || 0,
      req.body.autoSubmit || false
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getResult = async (req, res, next) => {
  try {
    const result = await quizService.getQuizResult(req.params.attemptId, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getBadges = async (req, res, next) => {
  try {
    const pool = (await import('../config/db.js')).default;
    const [rows] = await pool.query(`SELECT level, badge_type, earned_at FROM badges WHERE student_id = :id`, {
      id: req.user.id,
    });
    const hasGold = await quizService.hasGoldBadge(req.user.id);
    res.json({ badges: rows, hasGoldAccess: hasGold });
  } catch (err) {
    next(err);
  }
};
