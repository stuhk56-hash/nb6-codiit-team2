import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import supertest from 'supertest';
import { PrismaClient, User } from '@prisma/client';
import {
  defaultNotFoundHandler,
  globalErrorHandler,
} from '../../../middlewares/errorHandler';
import { corsMiddleware } from '../../../middlewares/cors';
import { setupRoutes } from '../../../app.module';
import { hashPassword } from '../../../lib/constants/password';
import { REFRESH_TOKEN_COOKIE_KEY } from '../utils/auth.util';

// Helper to bootstrap the app in a test environment
const bootstrapTestApp = (): Express => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(corsMiddleware);
  app.use(cookieParser());
  setupRoutes(app); // Use the same route setup
  app.use(defaultNotFoundHandler);
  app.use(globalErrorHandler);
  return app;
};

describe('Auth Module (E2E)', () => {
  let app: Express;
  let request: ReturnType<typeof supertest>;
  const prisma = new PrismaClient();
  let user: User;

  beforeAll(() => {
    app = bootstrapTestApp();
    request = supertest(app);
  });

  beforeEach(async () => {
    // Clean database
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    // Seed a user
    user = await prisma.user.create({
      data: {
        email: 'e2e.test@example.com',
        name: 'E2E User',
        type: 'BUYER',
        passwordHash: await hashPassword('password123'),
      },
    });
  });

  afterAll(async () => {
    // Final cleanup
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    it('유효한 정보로 로그인하면 201 상태코드와 토큰, 쿠키를 반환한다', async () => {
      const res = await request
        .post('/api/auth/login')
        .send({ email: 'e2e.test@example.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe('e2e.test@example.com');
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeUndefined();

      // Check cookie
      const refreshTokenCookie = res.headers['set-cookie'][0];
      expect(refreshTokenCookie).toContain(`${REFRESH_TOKEN_COOKIE_KEY}=`);
      expect(refreshTokenCookie).toContain('HttpOnly');
      expect(refreshTokenCookie).toContain('Path=/');

      // Check DB
      const dbToken = await prisma.refreshToken.findFirst({
        where: { userId: user.id },
      });
      expect(dbToken).toBeDefined();
    });

    it('잘못된 비밀번호로 로그인하면 401 상태코드를 반환한다', async () => {
      const res = await request
        .post('/api/auth/login')
        .send({ email: 'e2e.test@example.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('유효한 리프레시 쿠키로 요청하면 200 상태코드와 새 액세스 토큰을 반환한다', async () => {
      // 1. Login to get the refresh token cookie
      const loginRes = await request
        .post('/api/auth/login')
        .send({ email: 'e2e.test@example.com', password: 'password123' });

      const refreshTokenCookie = loginRes.headers['set-cookie'][0];

      // 2. Use the cookie to refresh
      const refreshRes = await request
        .post('/api/auth/refresh')
        .set('Cookie', refreshTokenCookie);

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.accessToken).toBeDefined();
    });

    it('리프레시 쿠키 없이 요청하면 401 상태코드를 반환한다', async () => {
      const res = await request.post('/api/auth/refresh');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('로그인 상태에서 로그아웃하면 200 상태코드와 쿠키 초기화를 반환한다', async () => {
      // 1. Login to get the refresh token cookie
      const loginRes = await request
        .post('/api/auth/login')
        .send({ email: 'e2e.test@example.com', password: 'password123' });

      const refreshTokenCookie = loginRes.headers['set-cookie'][0];
      const dbTokenBefore = await prisma.refreshToken.findFirst({
        where: { userId: user.id },
      });
      expect(dbTokenBefore?.revokedAt).toBeNull();

      // 2. Logout with the cookie
      const logoutRes = await request
        .post('/api/auth/logout')
        .set('Cookie', refreshTokenCookie);

      expect(logoutRes.status).toBe(200);

      // Check that cookie is cleared
      const clearedCookie = logoutRes.headers['set-cookie'][0];
      expect(clearedCookie).toContain(`${REFRESH_TOKEN_COOKIE_KEY}=;`);
      expect(clearedCookie).toContain('Expires=');

      // Check DB that token is revoked
      const dbTokenAfter = await prisma.refreshToken.findFirst({
        where: { userId: user.id },
      });
      expect(dbTokenAfter?.revokedAt).not.toBeNull();
    });
  });
});
