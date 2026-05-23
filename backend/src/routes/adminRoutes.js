import { Router } from 'express';
import {
  uploadPaper,
  addQuestion,
  getStudents,
  createStudent,
  getAnalytics,
  scheduleMock,
  getAdminLeaderboard,
  upload,
} from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireAdmin);
router.post('/papers/upload', upload.single('file'), uploadPaper);
router.post('/questions', addQuestion);
router.get('/students', getStudents);
router.post('/students', createStudent);
router.get('/analytics', getAnalytics);
router.post('/mock/schedule', scheduleMock);
router.get('/leaderboard', getAdminLeaderboard);

export default router;
