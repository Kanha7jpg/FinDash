import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
export async function getMarkets() {
    const { data } = await apiClient.get(API_ENDPOINTS.market.markets);
    return data.markets;
}
export async function searchStocks(query, limit = 10, exchange) {
    const { data } = await apiClient.get(API_ENDPOINTS.market.search, {
        params: {
            q: query,
            limit,
            exchange
        }
    });
    return data.results;
}
export async function getStockQuote(symbol) {
    const { data } = await apiClient.get(API_ENDPOINTS.market.quote(symbol));
    return data.quote;
}
export async function getStockChart(symbol, resolution = 'D', limit = 60) {
    const { data } = await apiClient.get(API_ENDPOINTS.market.chart(symbol), {
        params: {
            resolution,
            limit
        }
    });
    return data.points;
}
export async function getStockNews(symbol, limit = 5) {
    const { data } = await apiClient.get(API_ENDPOINTS.market.news(symbol), {
        params: {
            limit
        }
    });
    return data.news;
}
export async function getMarketOverviewCards(symbols) {
    const quotes = await Promise.all(symbols.map((symbol) => getStockQuote(symbol)));
    return quotes.map((quote) => ({
        symbol: quote.symbol,
        name: quote.symbol,
        value: quote.price,
        change: quote.change,
        changePercent: quote.changePercent
    }));
}
export async function getCountrySectionData(country, symbols) {
    const quotes = await Promise.all(symbols.map((symbol) => getStockQuote(symbol)));
    return {
        country,
        stocks: quotes.map((quote) => ({
            symbol: quote.symbol,
            name: quote.symbol,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent
        }))
    };
}
