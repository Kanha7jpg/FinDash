import { create } from 'zustand';
import {
  createPortfolio,
  createPortfolioTransaction,
  deletePortfolio,
  getPortfolioDetail,
  getPortfolios
} from '@/api/portfolio';
import type {
  CreatePortfolioPayload,
  CreatePortfolioTransactionPayload,
  PortfolioDetail,
  PortfolioSummary
} from '@/types';

type PortfolioStoreState = {
  portfolios: PortfolioSummary[];
  selectedPortfolioId: string | null;
  detail: PortfolioDetail | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  loadPortfolios: () => Promise<void>;
  selectPortfolio: (portfolioId: string) => Promise<void>;
  createNewPortfolio: (payload: CreatePortfolioPayload) => Promise<void>;
  deleteExistingPortfolio: (portfolioId: string) => Promise<void>;
  addTransaction: (portfolioId: string, payload: CreatePortfolioTransactionPayload) => Promise<void>;
  refreshSelectedDetail: () => Promise<void>;
  clearError: () => void;
};

export const usePortfolioStore = create<PortfolioStoreState>((set, get) => ({
  portfolios: [],
  selectedPortfolioId: null,
  detail: null,
  loading: false,
  saving: false,
  error: null,
  loadPortfolios: async () => {
    set({ loading: true, error: null });

    try {
      const portfolios = await getPortfolios();
      const existingSelection = get().selectedPortfolioId;
      const selectedPortfolioId =
        existingSelection && portfolios.some((portfolio) => portfolio.id === existingSelection)
          ? existingSelection
          : portfolios[0]?.id || null;

      set({ portfolios, selectedPortfolioId, loading: false });

      if (selectedPortfolioId) {
        const detail = await getPortfolioDetail(selectedPortfolioId);
        set({ detail });
      } else {
        set({ detail: null });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load portfolios';
      set({ loading: false, error: message });
    }
  },
  selectPortfolio: async (portfolioId) => {
    set({ selectedPortfolioId: portfolioId, loading: true, error: null });

    try {
      const detail = await getPortfolioDetail(portfolioId);
      set({ detail, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load portfolio detail';
      set({ loading: false, error: message });
    }
  },
  createNewPortfolio: async (payload) => {
    set({ saving: true, error: null });

    try {
      const created = await createPortfolio(payload);
      set((state) => ({
        portfolios: [...state.portfolios, created],
        selectedPortfolioId: created.id,
        saving: false
      }));

      const detail = await getPortfolioDetail(created.id);
      set({ detail });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create portfolio';
      set({ saving: false, error: message });
      throw error;
    }
  },
  deleteExistingPortfolio: async (portfolioId) => {
    set({ saving: true, error: null });

    try {
      await deletePortfolio(portfolioId);
      const remaining = get().portfolios.filter((portfolio) => portfolio.id !== portfolioId);
      const nextSelectedId = remaining[0]?.id || null;

      set({
        portfolios: remaining,
        selectedPortfolioId: nextSelectedId,
        detail: null,
        saving: false
      });

      if (nextSelectedId) {
        const detail = await getPortfolioDetail(nextSelectedId);
        set({ detail });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete portfolio';
      set({ saving: false, error: message });
      throw error;
    }
  },
  addTransaction: async (portfolioId, payload) => {
    set({ saving: true, error: null });

    try {
      await createPortfolioTransaction(portfolioId, payload);
      const [portfolios, detail] = await Promise.all([getPortfolios(), getPortfolioDetail(portfolioId)]);
      set({ portfolios, detail, saving: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to add transaction';
      set({ saving: false, error: message });
      throw error;
    }
  },
  refreshSelectedDetail: async () => {
    const selectedPortfolioId = get().selectedPortfolioId;

    if (!selectedPortfolioId) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const detail = await getPortfolioDetail(selectedPortfolioId);
      set({ detail, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to refresh portfolio detail';
      set({ loading: false, error: message });
    }
  },
  clearError: () => set({ error: null })
}));
