import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import request from 'supertest';

const registerMock: jest.Mock = jest.fn();
const loginMock: jest.Mock = jest.fn();
const refreshMock: jest.Mock = jest.fn();
const logoutMock: jest.Mock = jest.fn();
const meMock: jest.Mock = jest.fn();

jest.unstable_mockModule('../../services/authService.js', () => ({
  register: registerMock,
  login: loginMock,
  refresh: refreshMock,
  logout: logoutMock,
  me: meMock
}));

const { app } = await import('../../app.js');

describe('Auth API routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/auth/register returns 201 and access token payload', async () => {
    (registerMock as any).mockResolvedValue({
      user: {
        id: 'user_1',
        email: 'investor@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace'
      },
      tokens: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      }
    });

    const response = await request(app).post('/api/auth/register').send({
      email: 'investor@example.com',
      password: 'Password123!',
      firstName: 'Ada',
      lastName: 'Lovelace'
    });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe('investor@example.com');
    expect(response.body.tokens.accessToken).toBe('access-token');
    expect(response.headers['set-cookie']).toBeDefined();
    expect(registerMock).toHaveBeenCalledTimes(1);
  });

  it('POST /api/auth/login rejects invalid body at validation layer', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'investor@example.com',
      password: 'short'
    });

    expect(response.status).toBe(422);
    expect(response.body.message).toBe('Validation failed');
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('GET /api/auth/me returns 401 when authorization header is missing', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
    expect(meMock).not.toHaveBeenCalled();
  });
});
