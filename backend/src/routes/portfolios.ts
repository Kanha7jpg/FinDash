import { Router } from 'express';
import { z } from 'zod';
import {
  createPortfolioController,
  createPortfolioTransactionController,
  deletePortfolioController,
  getPortfolioDetailController,
  getPortfoliosController
} from '../controllers/portfolioController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validation.js';

const portfolioParamsSchema = z.object({
  portfolioId: z.string().cuid()
});

const createPortfolioSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(300).optional(),
  baseCurrency: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase())
    .optional()
});

const createTransactionSchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(1)
    .max(15)
    .regex(/^[A-Za-z0-9.-]+$/)
    .transform((value) => value.toUpperCase()),
  type: z.enum(['BUY', 'SELL']),
  quantity: z.coerce.number().positive(),
  price: z.coerce.number().positive(),
  fee: z.coerce.number().min(0).optional(),
  currency: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase())
    .optional(),
  executedAt: z.string().datetime()
});

export const portfoliosRouter = Router();

portfoliosRouter.use(authMiddleware);

portfoliosRouter.get('/portfolios', getPortfoliosController);
portfoliosRouter.post('/portfolios', validateBody(createPortfolioSchema), createPortfolioController);
portfoliosRouter.get('/portfolios/:portfolioId', validateParams(portfolioParamsSchema), getPortfolioDetailController);
portfoliosRouter.delete('/portfolios/:portfolioId', validateParams(portfolioParamsSchema), deletePortfolioController);
portfoliosRouter.post(
  '/portfolios/:portfolioId/transactions',
  validateParams(portfolioParamsSchema),
  validateBody(createTransactionSchema),
  createPortfolioTransactionController
);
