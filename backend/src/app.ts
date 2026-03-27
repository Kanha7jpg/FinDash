import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { env } from './config/environment.js';
import { requestLogger } from './middleware/requestLogger.js';
import { monitoringMiddleware } from './middleware/monitoring.js';

export const app = express();

app.use(requestLogger);

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(monitoringMiddleware);

app.use('/api', apiRouter);
app.use(errorHandler);
