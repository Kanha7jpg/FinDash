import { create } from 'zustand';
import { getCountrySectionData, getMarketOverviewCards, getMarkets, searchStocks } from '@/api/market';
const INDEX_SYMBOLS = ['SPY', 'QQQ', 'DIA', 'EWJ'];
const COUNTRY_SYMBOLS = {
    USA: ['AAPL', 'MSFT', 'NVDA', 'AMZN'],
    Japan: ['SONY', 'TM', 'MUFG', 'NTDOY'],
    India: ['INFY', 'WIT', 'IBN', 'HDB'],
    Germany: ['SAP', 'DTEGY', 'BAYRY', 'VWAGY']
};
function buildTrendingStocks(countrySections) {
    return countrySections
        .flatMap((section) => section.stocks)
        .sort((left, right) => Math.abs(right.changePercent) - Math.abs(left.changePercent))
        .slice(0, 8);
}
async function loadMarketBundle() {
    const [indices, markets, sections] = await Promise.all([
        getMarketOverviewCards(INDEX_SYMBOLS),
        getMarkets(),
        Promise.all(Object.entries(COUNTRY_SYMBOLS).map(([country, symbols]) => getCountrySectionData(country, symbols)))
    ]);
    return {
        indices,
        markets,
        sections,
        trending: buildTrendingStocks(sections)
    };
}
export const useMarketStore = create((set, get) => ({
    marketIndices: [],
    markets: [],
    countrySections: [],
    trendingStocks: [],
    searchModalOpen: false,
    searchQuery: '',
    searchResults: [],
    isLoading: false,
    searchLoading: false,
    error: null,
    initialized: false,
    loadDashboard: async () => {
        if (get().initialized) {
            return;
        }
        set({ isLoading: true, error: null });
        try {
            const { indices, markets, sections, trending } = await loadMarketBundle();
            set({
                marketIndices: indices,
                markets,
                countrySections: sections,
                trendingStocks: trending,
                isLoading: false,
                initialized: true,
                error: null
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to load dashboard';
            set({ isLoading: false, error: message });
        }
    },
    refreshDashboard: async () => {
        set({ isLoading: true, error: null });
        try {
            const { indices, markets, sections, trending } = await loadMarketBundle();
            set({
                marketIndices: indices,
                markets,
                countrySections: sections,
                trendingStocks: trending,
                isLoading: false,
                initialized: true,
                error: null
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to refresh dashboard';
            set({ isLoading: false, error: message });
        }
    },
    openSearchModal: () => set({ searchModalOpen: true }),
    closeSearchModal: () => set({ searchModalOpen: false, searchQuery: '', searchResults: [] }),
    setSearchQuery: (value) => set({ searchQuery: value }),
    runStockSearch: async (query) => {
        const normalized = query.trim();
        if (!normalized) {
            set({ searchResults: [], searchLoading: false });
            return;
        }
        set({ searchLoading: true });
        try {
            const results = await searchStocks(normalized, 12);
            set({ searchResults: results, searchLoading: false });
        }
        catch {
            set({ searchResults: [], searchLoading: false });
        }
    }
}));
