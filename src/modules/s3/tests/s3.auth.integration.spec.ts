import request from 'supertest';
import { BadRequestError } from '../../../lib/errors/customErrors';
import { prisma } from '../../../lib/constants/prismaClient';
import { s3Service } from '../s3.service';
import {
  authHeader,
  clearS3TestData,
  createTestApp,
  createUser,
} from './s3.test-util';

jest.mock('../s3.service', () => ({
  s3Service: {
    uploadFile: jest.fn(),
  },
}));

describe('S3 API 통합 테스트', () => {
  const app = createTestApp();
  const mockedS3Service = s3Service as jest.Mocked<typeof s3Service>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await clearS3TestData();
  });

  afterAll(async () => {
    await clearS3TestData();
    await prisma.$disconnect();
  });

  describe('인증이 필요한 S3 API 통합 테스트', () => {
    describe('POST /api/s3/upload', () => {
      test('판매자 토큰으로 파일 업로드하면 201과 업로드 결과를 반환한다', async () => {
        const seller = await createUser('SELLER');
        mockedS3Service.uploadFile.mockResolvedValue({
          message: '업로드 성공',
          url: 'https://bucket.s3.ap-northeast-2.amazonaws.com/codiit/test.png',
          key: 'codiit/test.png',
        });

        const res = await request(app)
          .post('/api/s3/upload')
          .set(authHeader(seller.id))
          .attach('image', Buffer.from('fake-image'), 'test image.png');

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('업로드 성공');
        expect(res.body.key).toBe('codiit/test.png');
        expect(mockedS3Service.uploadFile).toHaveBeenCalledTimes(1);
      });

      test('파일 없이 업로드 요청하면 400을 반환한다', async () => {
        const seller = await createUser('SELLER');
        mockedS3Service.uploadFile.mockRejectedValue(
          new BadRequestError('잘못된 요청입니다.'),
        );

        const res = await request(app)
          .post('/api/s3/upload')
          .set(authHeader(seller.id));

        expect(res.status).toBe(400);
      });

      test('파일 크기가 제한을 초과하면 413을 반환한다', async () => {
        const seller = await createUser('SELLER');
        const oversizedFile = Buffer.alloc(6 * 1024 * 1024, 1);

        const res = await request(app)
          .post('/api/s3/upload')
          .set(authHeader(seller.id))
          .attach('image', oversizedFile, 'oversized.png');

        expect(res.status).toBe(413);
        expect(res.body.message).toBe(
          '업로드 가능한 최대 파일 용량을 초과했습니다.',
        );
        expect(mockedS3Service.uploadFile).not.toHaveBeenCalled();
      });
    });
  });
});
