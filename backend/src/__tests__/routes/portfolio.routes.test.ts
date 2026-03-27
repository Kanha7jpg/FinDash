import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import request from 'supertest';

const getPortfoliosMock: jest.Mock = jest.fn();
const createPortfolioMock: jest.Mock = jest.fn();
const deletePortfolioMock: jest.Mock = jest.fn();
const getPortfolioDetailMock: jest.Mock = jest.fn();
const createPortfolioTransactionMock: jest.Mock = jest.fn();

jest.unstable_mockModule('../../middleware/auth.js', () => ({
  authMiddleware: (req: { user?: { id: string; email: string } }, _res: unknown, next: () => void) => {
    req.user = { id: 'user_1', email: 'investor@example.com' };
    next();
  }
}));

jest.unstable_mockModule('../../services/portfolioService.js', () => ({
  getPortfolios: getPortfoliosMock,
  createPortfolio: createPortfolioMock,
  deletePortfolio: deletePortfolioMock,
  getPortfolioDetail: getPortfolioDetailMock,
  createPortfolioTransaction: createPortfolioTransactionMock
}));

const { app } = await import('../../app.js');

describe('Portfolio API routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/portfolios returns user portfolios', async () => {
    (getPortfoliosMock as any).mockResolvedValue([
      {
        id: 'pf_1',
        name: 'Core Portfolio',
        description: null,
        baseCurrency: 'USD',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        holdingsCount: 4,
        transactionsCount: 12
      }
    ]);

    const response = await request(app).get('/api/portfolios').set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.portfolios).toHaveLength(1);
    expect(response.body.portfolios[0].name).toBe('Core Portfolio');
    expect(getPortfoliosMock).toHaveBeenCalledWith('user_1');
  });

  it('POST /api/portfolios validates payload and returns 422 for empty name', async () => {
    const response = await request(app).post('/api/portfolios').set('Authorization', 'Bearer token').send({
      name: ''
    });

    expect(response.status).toBe(422);
    expect(response.body.message).toBe('Validation failed');
    expect(createPortfolioMock).not.toHaveBeenCalled();
  });

  it('GET /api/portfolios/:portfolioId validates params and rejects non-cuid ids', async () => {
    const response = await request(app).get('/api/portfolios/not-a-cuid').set('Authorization', 'Bearer token');

    expect(response.status).toBe(422);
    expect(response.body.message).toBe('Validation failed');
    expect(getPortfolioDetailMock).not.toHaveBeenCalled();
  });
});
