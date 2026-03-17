import request from 'supertest';
import { prisma } from '../../../lib/constants/prismaClient';
import {
  clearStoreTestData,
  createSeller,
  createStore,
  createTestApp,
} from './stores.test-util';

describe('스토어 API 통합 테스트', () => {
  const app = createTestApp();

  beforeEach(async () => {
    await clearStoreTestData();
  });

  afterAll(async () => {
    await clearStoreTestData();
    await prisma.$disconnect();
  });

  describe('인증이 필요하지 않은 스토어 API 통합 테스트', () => {
    describe('GET /api/stores/:storeId (공개 상세 조회)', () => {
      test('ID로 스토어 상세를 반환한다', async () => {
        const seller = await createSeller();
        const store = await createStore(seller.id, '상세 스토어');

        const res = await request(app).get(`/api/stores/${store.id}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(store.id);
        expect(res.body.name).toBe('상세 스토어');
        expect(res.body).toHaveProperty('favoriteCount');
      });

      test('존재하지 않는 id면 404를 반환한다', async () => {
        const res = await request(app).get('/api/stores/not-exists-id');
        expect(res.status).toBe(404);
      });
    });
  });
});
