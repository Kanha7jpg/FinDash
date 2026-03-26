import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type {
  CreatePortfolioPayload,
  CreatePortfolioTransactionPayload,
  PortfolioDetail,
  PortfolioSummary,
  PortfolioTransaction
} from '@/types';

export async function getPortfolios(): Promise<PortfolioSummary[]> {
  const { data } = await apiClient.get<{ portfolios: PortfolioSummary[] }>(API_ENDPOINTS.portfolios.base);
  return data.portfolios;
}

export async function createPortfolio(payload: CreatePortfolioPayload): Promise<PortfolioSummary> {
  const { data } = await apiClient.post<{ portfolio: PortfolioSummary }>(API_ENDPOINTS.portfolios.base, payload);
  return data.portfolio;
}

export async function deletePortfolio(portfolioId: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.portfolios.byId(portfolioId));
}

export async function getPortfolioDetail(portfolioId: string): Promise<PortfolioDetail> {
  const { data } = await apiClient.get<{ portfolio: PortfolioDetail }>(API_ENDPOINTS.portfolios.byId(portfolioId));
  return data.portfolio;
}

export async function createPortfolioTransaction(
  portfolioId: string,
  payload: CreatePortfolioTransactionPayload
): Promise<PortfolioTransaction> {
  const { data } = await apiClient.post<{ transaction: PortfolioTransaction }>(
    API_ENDPOINTS.portfolios.transactions(portfolioId),
    payload
  );

  return data.transaction;
}
