import { create } from 'zustand';
import {
  addStockToWatchlist,
  createWatchlist,
  deleteWatchlist,
  getWatchlists,
  removeStockFromWatchlist,
  updateWatchlistStockNotes
} from '@/api/watchlists';
import type { AddWatchlistStockPayload, CreateWatchlistPayload, Watchlist } from '@/types';

type WatchlistState = {
  watchlists: Watchlist[];
  selectedWatchlistId: string | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  loadWatchlists: () => Promise<void>;
  setSelectedWatchlist: (watchlistId: string) => void;
  createNewWatchlist: (payload: CreateWatchlistPayload) => Promise<void>;
  deleteExistingWatchlist: (watchlistId: string) => Promise<void>;
  addStock: (watchlistId: string, payload: AddWatchlistStockPayload) => Promise<void>;
  removeStock: (watchlistId: string, symbol: string) => Promise<void>;
  updateStockNotes: (watchlistId: string, symbol: string, notes?: string) => Promise<void>;
  clearError: () => void;
};

function updateWatchlistInCollection(collection: Watchlist[], updated: Watchlist): Watchlist[] {
  return collection.map((watchlist) => (watchlist.id === updated.id ? updated : watchlist));
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  watchlists: [],
  selectedWatchlistId: null,
  loading: false,
  saving: false,
  error: null,
  loadWatchlists: async () => {
    set({ loading: true, error: null });

    try {
      const watchlists = await getWatchlists();
      const selected = get().selectedWatchlistId;
      const selectedStillExists = selected && watchlists.some((watchlist) => watchlist.id === selected);

      set({
        watchlists,
        selectedWatchlistId: selectedStillExists ? selected : watchlists[0]?.id || null,
        loading: false,
        error: null
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load watchlists';
      set({ loading: false, error: message });
    }
  },
  setSelectedWatchlist: (watchlistId) => set({ selectedWatchlistId: watchlistId }),
  createNewWatchlist: async (payload) => {
    set({ saving: true, error: null });

    try {
      const watchlist = await createWatchlist(payload);
      set((state) => ({
        watchlists: [...state.watchlists, watchlist],
        selectedWatchlistId: watchlist.id,
        saving: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create watchlist';
      set({ saving: false, error: message });
      throw error;
    }
  },
  deleteExistingWatchlist: async (watchlistId) => {
    set({ saving: true, error: null });

    try {
      await deleteWatchlist(watchlistId);
      set((state) => {
        const remaining = state.watchlists.filter((watchlist) => watchlist.id !== watchlistId);
        return {
          watchlists: remaining,
          selectedWatchlistId: remaining[0]?.id || null,
          saving: false
        };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete watchlist';
      set({ saving: false, error: message });
      throw error;
    }
  },
  addStock: async (watchlistId, payload) => {
    set({ saving: true, error: null });

    try {
      const updated = await addStockToWatchlist(watchlistId, payload);
      set((state) => ({
        watchlists: updateWatchlistInCollection(state.watchlists, updated),
        saving: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to add stock';
      set({ saving: false, error: message });
      throw error;
    }
  },
  removeStock: async (watchlistId, symbol) => {
    set({ saving: true, error: null });

    try {
      const updated = await removeStockFromWatchlist(watchlistId, symbol);
      set((state) => ({
        watchlists: updateWatchlistInCollection(state.watchlists, updated),
        saving: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to remove stock';
      set({ saving: false, error: message });
      throw error;
    }
  },
  updateStockNotes: async (watchlistId, symbol, notes) => {
    set({ saving: true, error: null });

    try {
      const updated = await updateWatchlistStockNotes(watchlistId, symbol, { notes });
      set((state) => ({
        watchlists: updateWatchlistInCollection(state.watchlists, updated),
        saving: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update notes';
      set({ saving: false, error: message });
      throw error;
    }
  },
  clearError: () => set({ error: null })
}));
