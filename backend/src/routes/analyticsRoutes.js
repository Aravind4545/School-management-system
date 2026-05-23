import { Router } from 'express';
import { getLeaderboardHandler, getWeekly, getMyResults } from '../controllers/analyticsController.js';
import { authenticate, requireStudent } from '../middleware/auth.js';

const router = Router();

router.get('/leaderboard', getLeaderboardHandler);
router.get('/weekly', authenticate, requireStudent, getWeekly);
router.get('/my-results', authenticate, requireStudent, getMyResults);

export default router;
