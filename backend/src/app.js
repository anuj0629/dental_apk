import path from 'path';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.routes.js';
import { usersRouter } from './routes/users.routes.js';
import { analysisRouter } from './routes/analysis.routes.js';
import { historyRouter } from './routes/history.routes.js';
import { dashboardRouter } from './routes/dashboard.routes.js';
import { clinicalRouter } from './routes/clinical.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true
  })
);
app.use(express.json());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300
  })
);

app.use('/uploads', express.static(path.join(process.cwd(), env.uploadDir)));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'dental-ai-backend' });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/history', historyRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api', clinicalRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);
