export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    me: '/auth/me',
    logout: '/auth/logout'
  },
  market: {
    markets: '/markets',
    search: '/stocks/search',
    quote: (symbol: string) => `/stocks/${encodeURIComponent(symbol)}`,
    chart: (symbol: string) => `/stocks/${encodeURIComponent(symbol)}/chart`,
    news: (symbol: string) => `/stocks/${encodeURIComponent(symbol)}/news`
  },
  watchlists: {
    base: '/watchlists',
    byId: (watchlistId: string) => `/watchlists/${encodeURIComponent(watchlistId)}`,
    stocks: (watchlistId: string) => `/watchlists/${encodeURIComponent(watchlistId)}/stocks`,
    stockBySymbol: (watchlistId: string, symbol: string) =>
      `/watchlists/${encodeURIComponent(watchlistId)}/stocks/${encodeURIComponent(symbol)}`
  },
  portfolios: {
    base: '/portfolios',
    byId: (portfolioId: string) => `/portfolios/${encodeURIComponent(portfolioId)}`,
    transactions: (portfolioId: string) => `/portfolios/${encodeURIComponent(portfolioId)}/transactions`
  }
} as const;
