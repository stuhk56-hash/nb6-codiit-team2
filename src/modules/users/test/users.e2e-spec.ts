import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRole } from '../src/users/enums/user-role.enum';
import { USER_CONSTANTS } from '../src/users/constants/user.constant';

describe('UsersController (E2E)', () => {
  let app: INestApplication;
  let createdUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // 실제 환경과 동일하게 ValidationPipe 적용
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // 1. [공통/회원가입] 테스트
  describe('/users/signup (POST)', () => {
    it('새로운 바이어 유저를 성공적으로 생성해야 한다', async () => {
      const signUpDto = {
        name: '김유저',
        email: 'test_e2e@example.com',
        password: 'password123',
        type: UserRole.BUYER,
      };

      const response = await request(app.getHttpServer())
        .post('/users/signup')
        .send(signUpDto)
        .expect(201);

      expect(response.body.email).toBe(signUpDto.email);
      expect(response.body.grade.name).toBe('green'); // 기본 등급 확인
      createdUserId = response.body.id; // 다음 테스트를 위해 ID 저장
    });

    it('중복된 이메일로 가입 시 409 에러를 반환해야 한다 (피그마 에러 페이지)', async () => {
      await request(app.getHttpServer())
        .post('/users/signup')
        .send({
          name: '중복유저',
          email: 'test_e2e@example.com',
          password: 'password123',
          type: UserRole.BUYER,
        })
        .expect(409);
    });
  });

  // 2. [공통/프로필 조회] 테스트
  describe('/users/:id (GET)', () => {
    it('생성된 유저의 프로필 정보를 정확히 반환해야 한다', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(200);

      expect(response.body.id).toBe(createdUserId);
      expect(response.body).toHaveProperty('points');
      expect(response.body.grade).toBeDefined();
    });
  });

  // 3. [공통/이미지 업로드] 테스트
  describe('/users/:id/image (PATCH)', () => {
    it('프로필 이미지를 업로드하고 URL을 반환해야 한다', async () => {
      // 실제 파일을 전송하는 시뮬레이션
      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}/image`)
        .attach('file', Buffer.from('fake-image'), 'profile.png') // 가짜 파일 첨부
        .expect(200);

      expect(response.body.url).toContain('profile.png');
    });
  });

  // 4. [권한/가드] 셀러 대시보드 접근 테스트
  describe('/users/:id/seller-dashboard (GET)', () => {
    it('바이어 유저가 셀러 대시보드 접근 시 403 에러를 던져야 한다 (RolesGuard 작동)', async () => {
      // 가드 로직에서 req.user를 확인하므로, 실제로는 토큰 인증이 선행되어야 함
      // 여기서는 가드에 걸려 Forbidden이 나는지 확인
      await request(app.getHttpServer())
        .get(`/users/${createdUserId}/seller-dashboard`)
        .expect(403);
    });
  });
});
