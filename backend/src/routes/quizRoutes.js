import { Router } from 'express';
import {
  startQuiz,
  getAttempt,
  saveAnswer,
  submitQuiz,
  getResult,
  getBadges,
  recordViolation,
} from '../controllers/quizController.js';
import { authenticate, requireStudent } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireStudent);
router.get('/badges', getBadges);
router.post('/start', startQuiz);
router.get('/:attemptId', getAttempt);
router.patch('/:attemptId/answer', saveAnswer);
router.post('/:attemptId/violation', recordViolation);
router.post('/:attemptId/submit', submitQuiz);
router.get('/:attemptId/result', getResult);

export default router;
