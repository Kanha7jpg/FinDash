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
  }
} as const;
