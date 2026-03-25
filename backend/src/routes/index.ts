import { Router } from 'express';
import { authRouter } from './auth.js';
import { marketsRouter } from './markets.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/', marketsRouter);
