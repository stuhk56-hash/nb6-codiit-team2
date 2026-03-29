import request from 'supertest';
import { prisma } from '../../../lib/constants/prismaClient';
import { clearS3TestData, createTestApp } from './s3.test-util';

describe('S3 API 통합 테스트', () => {
  const app = createTestApp();

  beforeEach(async () => {
    await clearS3TestData();
  });

  afterAll(async () => {
    await clearS3TestData();
    await prisma.$disconnect();
  });

  describe('공개 S3 API 통합 테스트', () => {
    describe('POST /api/s3/upload', () => {
      test('로그인 없이 업로드 요청하면 401을 반환한다', async () => {
        const res = await request(app)
          .post('/api/s3/upload')
          .attach('image', Buffer.from('fake-image'), 'test.png');

        expect(res.status).toBe(401);
      });
    });
  });
});
