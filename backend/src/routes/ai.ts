import { Router } from 'express';
import { z } from 'zod';
import {
  getMarketSentimentController,
  getPortfolioAnalysisController,
  getStockAnalysisController
} from '../controllers/aiController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateParams } from '../middleware/validation.js';

const stockSymbolParamsSchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(1)
    .max(15)
    .regex(/^[A-Za-z0-9.-]+$/)
    .transform((value) => value.toUpperCase())
});

const portfolioParamsSchema = z.object({
  id: z.string().cuid()
});

export const aiRouter = Router();

aiRouter.get('/ai/stock-analysis/:symbol', authMiddleware, validateParams(stockSymbolParamsSchema), getStockAnalysisController);
aiRouter.get('/ai/portfolio-analysis/:id', authMiddleware, validateParams(portfolioParamsSchema), getPortfolioAnalysisController);
aiRouter.get('/ai/market-sentiment', authMiddleware, getMarketSentimentController);
