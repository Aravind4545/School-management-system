import { Router } from 'express';
import { body } from 'express-validator';
import { studentLogin, adminLogin, changePassword, getMe } from '../controllers/authController.js';
import { authenticate, requireStudent } from '../middleware/auth.js';

const router = Router();

router.post('/login', [body('pin').notEmpty(), body('password').notEmpty()], studentLogin);
router.post('/admin/login', [body('email').isEmail(), body('password').notEmpty()], adminLogin);
router.post('/change-password', authenticate, requireStudent, changePassword);
router.get('/me', authenticate, getMe);

export default router;
