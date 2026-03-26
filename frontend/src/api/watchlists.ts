import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type {
  AddWatchlistStockPayload,
  CreateWatchlistPayload,
  UpdateWatchlistStockPayload,
  Watchlist
} from '@/types';

export async function getWatchlists(): Promise<Watchlist[]> {
  const { data } = await apiClient.get<{ watchlists: Watchlist[] }>(API_ENDPOINTS.watchlists.base);
  return data.watchlists;
}

export async function createWatchlist(payload: CreateWatchlistPayload): Promise<Watchlist> {
  const { data } = await apiClient.post<{ watchlist: Watchlist }>(API_ENDPOINTS.watchlists.base, payload);
  return data.watchlist;
}

export async function deleteWatchlist(watchlistId: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.watchlists.byId(watchlistId));
}

export async function addStockToWatchlist(watchlistId: string, payload: AddWatchlistStockPayload): Promise<Watchlist> {
  const { data } = await apiClient.post<{ watchlist: Watchlist }>(API_ENDPOINTS.watchlists.stocks(watchlistId), payload);
  return data.watchlist;
}

export async function removeStockFromWatchlist(watchlistId: string, symbol: string): Promise<Watchlist> {
  const { data } = await apiClient.delete<{ watchlist: Watchlist }>(API_ENDPOINTS.watchlists.stockBySymbol(watchlistId, symbol));
  return data.watchlist;
}

export async function updateWatchlistStockNotes(
  watchlistId: string,
  symbol: string,
  payload: UpdateWatchlistStockPayload
): Promise<Watchlist> {
  const { data } = await apiClient.patch<{ watchlist: Watchlist }>(API_ENDPOINTS.watchlists.stockBySymbol(watchlistId, symbol), payload);
  return data.watchlist;
}
