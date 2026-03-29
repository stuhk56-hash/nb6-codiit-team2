import { PutObjectCommand } from '@aws-sdk/client-s3';
import { S3Service } from '../s3.service';
import * as s3ServiceUtil from '../utils/s3.service.util';

jest.mock('@aws-sdk/client-s3', () => ({
  PutObjectCommand: jest.fn((input: unknown) => ({ input })),
}));

jest.mock('../utils/s3.service.util', () => ({
  requireUploadFile: jest.fn(),
  requireS3Bucket: jest.fn(),
  requireS3Region: jest.fn(),
  createS3ObjectKey: jest.fn(),
  createS3ObjectUrl: jest.fn(),
  createS3Client: jest.fn(),
}));

describe('s3.service 유닛 테스트', () => {
  const service = new S3Service();

  const mockedUtil = s3ServiceUtil as jest.Mocked<typeof s3ServiceUtil>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uploadFile은 S3에 업로드 후 업로드 결과를 반환한다', async () => {
    const send = jest.fn().mockResolvedValue(undefined);
    const file = {
      originalname: 'test image.png',
      buffer: Buffer.from('fake-image'),
      mimetype: 'image/png',
    } as Express.Multer.File;

    mockedUtil.requireUploadFile.mockReturnValue(file);
    mockedUtil.requireS3Bucket.mockReturnValue('my-bucket');
    mockedUtil.requireS3Region.mockReturnValue('ap-northeast-2');
    mockedUtil.createS3ObjectKey.mockReturnValue('codiit/object-key.png');
    mockedUtil.createS3ObjectUrl.mockReturnValue(
      'https://my-bucket.s3.ap-northeast-2.amazonaws.com/codiit/object-key.png',
    );
    mockedUtil.createS3Client.mockReturnValue({ send } as any);

    const result = await service.uploadFile(file);

    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: 'my-bucket',
      Key: 'codiit/object-key.png',
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    expect(send).toHaveBeenCalledTimes(1);
    expect(mockedUtil.createS3ObjectUrl).toHaveBeenCalledWith(
      'my-bucket',
      'ap-northeast-2',
      'codiit/object-key.png',
    );
    expect(result).toEqual({
      message: '업로드 성공',
      url: 'https://my-bucket.s3.ap-northeast-2.amazonaws.com/codiit/object-key.png',
      key: 'codiit/object-key.png',
    });
  });

  test('uploadFile은 S3 업로드 실패를 그대로 전파한다', async () => {
    const sendError = new Error('s3 send failed');
    const send = jest.fn().mockRejectedValue(sendError);
    const file = {
      originalname: 'test.png',
      buffer: Buffer.from('fake-image'),
      mimetype: 'image/png',
    } as Express.Multer.File;

    mockedUtil.requireUploadFile.mockReturnValue(file);
    mockedUtil.requireS3Bucket.mockReturnValue('my-bucket');
    mockedUtil.requireS3Region.mockReturnValue('ap-northeast-2');
    mockedUtil.createS3ObjectKey.mockReturnValue('codiit/object-key.png');
    mockedUtil.createS3Client.mockReturnValue({ send } as any);

    await expect(service.uploadFile(file)).rejects.toThrow('s3 send failed');
  });
});
