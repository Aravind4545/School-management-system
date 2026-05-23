import { Router } from 'express';
import { getPapers, getImportantBits, downloadFile } from '../controllers/contentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/papers', authenticate, getPapers);
router.get('/important', authenticate, getImportantBits);
router.get('/files/:id/download', authenticate, downloadFile);

export default router;
