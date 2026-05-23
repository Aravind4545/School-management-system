import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cron from 'node-cron';
import authRoutes from './routes/authRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import mockRoutes from './routes/mockRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rotateMockSets } from './services/mockService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'));

app.get('/api/health', (_, res) => res.json({ status: 'ok', name: 'AP Inter & EAMCET Portal API' }));

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/mock', mockRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(errorHandler);

cron.schedule('0 0 */3 * *', async () => {
  try {
    await rotateMockSets();
    console.log('Mock test rotation completed');
  } catch (e) {
    console.error('Mock rotation failed:', e.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
