import { Router } from 'express';
import { authRouter } from './auth.js';
import { marketsRouter } from './markets.js';
import { portfoliosRouter } from './portfolios.js';
import { watchlistsRouter } from './watchlists.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/', marketsRouter);
apiRouter.use('/', portfoliosRouter);
apiRouter.use('/', watchlistsRouter);
