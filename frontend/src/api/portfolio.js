import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
export async function getPortfolios() {
    const { data } = await apiClient.get(API_ENDPOINTS.portfolios.base);
    return data.portfolios;
}
export async function createPortfolio(payload) {
    const { data } = await apiClient.post(API_ENDPOINTS.portfolios.base, payload);
    return data.portfolio;
}
export async function deletePortfolio(portfolioId) {
    await apiClient.delete(API_ENDPOINTS.portfolios.byId(portfolioId));
}
export async function getPortfolioDetail(portfolioId) {
    const { data } = await apiClient.get(API_ENDPOINTS.portfolios.byId(portfolioId));
    return data.portfolio;
}
export async function createPortfolioTransaction(portfolioId, payload) {
    const { data } = await apiClient.post(API_ENDPOINTS.portfolios.transactions(portfolioId), payload);
    return data.transaction;
}
