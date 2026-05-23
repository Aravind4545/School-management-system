import { Router } from 'express';
import {
  getAccess,
  startMock,
  getAttempt,
  saveAnswer,
  submitMock,
  getResult,
  recordViolation,
} from '../controllers/mockController.js';
import { authenticate, requireStudent } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireStudent);
router.get('/access', getAccess);
router.post('/start', startMock);
router.get('/:attemptId', getAttempt);
router.patch('/:attemptId/answer', saveAnswer);
router.post('/:attemptId/violation', recordViolation);
router.post('/:attemptId/submit', submitMock);
router.get('/:attemptId/result', getResult);

export default router;
