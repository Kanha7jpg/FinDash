import type { Response } from 'express';
import {
  createPortfolio,
  createPortfolioTransaction,
  deletePortfolio,
  getPortfolioDetail,
  getPortfolios
} from '../services/portfolioService.js';
import type { AuthenticatedRequest } from '../types/index.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

type PortfolioParams = {
  portfolioId: string;
};

type CreatePortfolioBody = {
  name: string;
  description?: string;
  baseCurrency?: string;
};

type CreateTransactionBody = {
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  fee?: number;
  currency?: string;
  executedAt: string;
};

function getUserId(req: AuthenticatedRequest): string {
  if (!req.user?.id) {
    throw new AppError(401, 'Unauthorized');
  }

  return req.user.id;
}

export const getPortfoliosController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const portfolios = await getPortfolios(getUserId(req));
  res.status(200).json({ portfolios });
});

export const createPortfolioController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as CreatePortfolioBody;
  const portfolio = await createPortfolio(getUserId(req), body);
  res.status(201).json({ portfolio });
});

export const deletePortfolioController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const params = (req as AuthenticatedRequest & { validatedParams: PortfolioParams }).validatedParams;
  await deletePortfolio(getUserId(req), params.portfolioId);
  res.status(200).json({ message: 'Portfolio deleted' });
});

export const getPortfolioDetailController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const params = (req as AuthenticatedRequest & { validatedParams: PortfolioParams }).validatedParams;
  const portfolio = await getPortfolioDetail(getUserId(req), params.portfolioId);
  res.status(200).json({ portfolio });
});

export const createPortfolioTransactionController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const params = (req as AuthenticatedRequest & { validatedParams: PortfolioParams }).validatedParams;
  const body = req.body as CreateTransactionBody;
  const transaction = await createPortfolioTransaction(getUserId(req), params.portfolioId, body);
  res.status(201).json({ transaction });
});
