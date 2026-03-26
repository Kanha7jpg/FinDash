import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
export async function getWatchlists() {
    const { data } = await apiClient.get(API_ENDPOINTS.watchlists.base);
    return data.watchlists;
}
export async function createWatchlist(payload) {
    const { data } = await apiClient.post(API_ENDPOINTS.watchlists.base, payload);
    return data.watchlist;
}
export async function deleteWatchlist(watchlistId) {
    await apiClient.delete(API_ENDPOINTS.watchlists.byId(watchlistId));
}
export async function addStockToWatchlist(watchlistId, payload) {
    const { data } = await apiClient.post(API_ENDPOINTS.watchlists.stocks(watchlistId), payload);
    return data.watchlist;
}
export async function removeStockFromWatchlist(watchlistId, symbol) {
    const { data } = await apiClient.delete(API_ENDPOINTS.watchlists.stockBySymbol(watchlistId, symbol));
    return data.watchlist;
}
export async function updateWatchlistStockNotes(watchlistId, symbol, payload) {
    const { data } = await apiClient.patch(API_ENDPOINTS.watchlists.stockBySymbol(watchlistId, symbol), payload);
    return data.watchlist;
}
