import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import request from 'supertest';

const getMarketsMock: jest.Mock = jest.fn();
const searchStocksMock: jest.Mock = jest.fn();
const getQuoteMock: jest.Mock = jest.fn();
const getChartMock: jest.Mock = jest.fn();
const getNewsMock: jest.Mock = jest.fn();

jest.unstable_mockModule('../../services/stockService.js', () => ({
  stockService: {
    getMarkets: getMarketsMock,
    searchStocks: searchStocksMock,
    getQuote: getQuoteMock,
    getChart: getChartMock,
    getNews: getNewsMock
  }
}));

const { app } = await import('../../app.js');

describe('Stock API routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/stocks/search returns normalized results payload', async () => {
    (searchStocksMock as any).mockResolvedValue([
      {
        symbol: 'AAPL',
        description: 'Apple Inc.',
        exchange: 'NASDAQ'
      }
    ]);

    const response = await request(app).get('/api/stocks/search?q=apple&limit=10');

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.results[0].symbol).toBe('AAPL');
    expect(searchStocksMock).toHaveBeenCalledWith('apple', { limit: 10, exchange: undefined });
  });

  it('GET /api/stocks/search enforces query validation', async () => {
    const response = await request(app).get('/api/stocks/search');

    expect(response.status).toBe(422);
    expect(response.body.message).toBe('Validation failed');
    expect(searchStocksMock).not.toHaveBeenCalled();
  });

  it('GET /api/stocks/:symbol returns quote data', async () => {
    (getQuoteMock as any).mockResolvedValue({
      provider: 'finnhub',
      symbol: 'AAPL',
      price: 195.7,
      change: 1.2,
      changePercent: 0.61,
      previousClose: 194.5,
      timestamp: '2026-03-27T12:00:00.000Z'
    });

    const response = await request(app).get('/api/stocks/AAPL');

    expect(response.status).toBe(200);
    expect(response.body.quote.symbol).toBe('AAPL');
    expect(getQuoteMock).toHaveBeenCalledWith('AAPL', undefined);
  });
});
