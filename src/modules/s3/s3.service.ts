import { PutObjectCommand } from '@aws-sdk/client-s3';
import type { S3UploadResult } from './types/s3.type';
import {
  createS3Client,
  createS3ObjectKey,
  createS3ObjectUrl,
  requireS3Bucket,
  requireS3Region,
  requireUploadFile,
} from './utils/s3.service.util';

export class S3Service {
  async uploadFile(file?: Express.Multer.File): Promise<S3UploadResult> {
    const uploadFile = requireUploadFile(file);
    const bucket = requireS3Bucket();
    const region = requireS3Region();
    const key = createS3ObjectKey(uploadFile.originalname);

    const client = createS3Client();

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: uploadFile.buffer,
        ContentType: uploadFile.mimetype,
      }),
    );

    return {
      message: '업로드 성공',
      url: createS3ObjectUrl(bucket, region, key),
      key,
    };
  }
}

export const s3Service = new S3Service();
