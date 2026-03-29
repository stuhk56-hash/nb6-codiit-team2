import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserGradeId } from '../src/users/enums/user-grade.enum';

describe('MetadataController (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // 1. 등급 전체 목록 조회 테스트 (피그마 UI 데이터 소스)
  describe('/metadata/grades (GET)', () => {
    it('초기화된 모든 등급 목록을 반환해야 한다', async () => {
      const response = await request(app.getHttpServer())
        .get('/metadata/grades')
        .expect(200);

      // 응답 데이터 구조 검증
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(4); // green, silver, gold, vip

      const greenGrade = response.body.find((g) => g.id === UserGradeId.GREEN);
      expect(greenGrade).toBeDefined();
      expect(greenGrade).toHaveProperty('rateLabel'); // Mapper를 거친 필드 확인
    });
  });

  // 2. 특정 등급 상세 조회 테스트
  describe('/metadata/grades/:id (GET)', () => {
    it('ID에 해당하는 등급 정보를 반환해야 한다', async () => {
      const response = await request(app.getHttpServer())
        .get(`/metadata/grades/${UserGradeId.GOLD}`)
        .expect(200);

      expect(response.body.id).toBe(UserGradeId.GOLD);
      expect(response.body.rate).toBe(5);
    });

    it('존재하지 않는 ID 조회 시 404 에러를 반환해야 한다', async () => {
      await request(app.getHttpServer())
        .get('/metadata/grades/invalid_id')
        .expect(404);
    });
  });

  // 3. 등급 정보 수정 테스트 (관리자 전용 시나리오)
  describe('/metadata/grades/:id (PATCH)', () => {
    it('등급의 적립률을 성공적으로 수정해야 한다', async () => {
      const updateDto = { rate: 15 }; // 10% -> 15% 상향

      const response = await request(app.getHttpServer())
        .patch(`/metadata/grades/${UserGradeId.VIP}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.rate).toBe(15);
    });

    it('잘못된 데이터(음수 적립률) 전송 시 400 에러를 반환해야 한다 (Validation)', async () => {
      await request(app.getHttpServer())
        .patch(`/metadata/grades/${UserGradeId.GREEN}`)
        .send({ rate: -5 }) // DTO에서 막아야 함
        .expect(400);
    });
  });
});
