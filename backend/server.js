import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { pathToFileURL } from 'node:url';

import connectDB from './config/db.js';
import { notFound, errorMiddleware } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import getJwtSecret from './utils/jwtSecret.js';

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/students', studentRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CareerConnect backend is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to CareerConnect API'
  });
});

app.use(notFound);
app.use(errorMiddleware);

export const startServer = async () => {
  try {
    getJwtSecret();
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`CareerConnect backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer();
}

export default app;
