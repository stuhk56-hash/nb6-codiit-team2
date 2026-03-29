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
import { toS3UploadResult } from './utils/s3.mapper';

export class S3Service {
  async uploadFile(file?: Express.Multer.File): Promise<S3UploadResult> {
    const uploadedFile = requireUploadFile(file);
    const bucket = requireS3Bucket();
    const region = requireS3Region();
    const key = createS3ObjectKey(uploadedFile.originalname);

    const client = createS3Client();

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: uploadedFile.buffer,
        ContentType: uploadedFile.mimetype,
      }),
    );

    return toS3UploadResult(createS3ObjectUrl(bucket, region, key), key);
  }
}

export const s3Service = new S3Service();
