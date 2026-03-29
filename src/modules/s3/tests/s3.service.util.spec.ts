import { S3Client } from '@aws-sdk/client-s3';
import { BadRequestError } from '../../../lib/errors/customErrors';
import {
  createS3Client,
  createS3ObjectKey,
  createS3ObjectUrl,
  requireS3Bucket,
  requireS3Region,
  requireUploadFile,
  resolveS3ImageUrl,
} from '../utils/s3.service.util';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
}));

describe('s3.service.util 유닛 테스트', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('requireUploadFile은 파일이 없으면 BadRequestError를 던진다', () => {
    expect(() => requireUploadFile(undefined)).toThrow(BadRequestError);
  });

  test('createS3Client는 필수 env로 S3Client를 생성한다', () => {
    process.env.AWS_REGION = 'ap-northeast-2';
    process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';

    createS3Client();

    expect(S3Client).toHaveBeenCalledWith({
      region: 'ap-northeast-2',
      credentials: {
        accessKeyId: 'test-access-key',
        secretAccessKey: 'test-secret-key',
      },
    });
  });

  test('requireS3Bucket은 버킷 env가 없으면 BadRequestError를 던진다', () => {
    delete process.env.AWS_S3_BUCKET_NAME;
    expect(() => requireS3Bucket()).toThrow(BadRequestError);
  });

  test('requireS3Region은 리전 env가 없으면 BadRequestError를 던진다', () => {
    delete process.env.AWS_REGION;
    expect(() => requireS3Region()).toThrow(BadRequestError);
  });

  test('createS3ObjectKey는 prefix를 포함하고 파일 공백을 하이픈으로 바꾼다', () => {
    process.env.AWS_S3_PREFIX = 'uploads';
    const key = createS3ObjectKey('test image.png');

    expect(key.startsWith('uploads/')).toBe(true);
    expect(key.endsWith('-test-image.png')).toBe(true);
  });

  test('createS3ObjectUrl은 S3 정적 URL을 생성한다', () => {
    const url = createS3ObjectUrl('my-bucket', 'ap-northeast-2', 'codiit/a.png');
    expect(url).toBe(
      'https://my-bucket.s3.ap-northeast-2.amazonaws.com/codiit/a.png',
    );
  });

  test('resolveS3ImageUrl은 imageKey가 있으면 S3 URL을 우선 반환한다', async () => {
    process.env.AWS_S3_BUCKET_NAME = 'my-bucket';
    process.env.AWS_REGION = 'ap-northeast-2';

    const url = await resolveS3ImageUrl(
      'https://legacy.example.com/a.png',
      'codiit/new.png',
      '/images/default.png',
    );

    expect(url).toBe(
      'https://my-bucket.s3.ap-northeast-2.amazonaws.com/codiit/new.png',
    );
  });

  test('resolveS3ImageUrl은 imageUrl이 http/https 또는 루트 경로면 그대로 반환한다', async () => {
    const httpUrl = await resolveS3ImageUrl(
      'https://cdn.example.com/a.png',
      null,
      '/images/default.png',
    );
    const rootPath = await resolveS3ImageUrl(
      '/images/local.png',
      null,
      '/images/default.png',
    );

    expect(httpUrl).toBe('https://cdn.example.com/a.png');
    expect(rootPath).toBe('/images/local.png');
  });

  test('resolveS3ImageUrl은 유효한 값이 없으면 fallbackUrl을 반환한다', async () => {
    const url = await resolveS3ImageUrl('not-valid-url', null, '/images/default.png');
    expect(url).toBe('/images/default.png');
  });
});
