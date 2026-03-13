import type { Response } from 'express';
import { requireAuthUser } from '../../lib/request/auth-user';
import { s3Service } from './s3.service';
import type { S3UploadRequest } from './types/s3.type';

export async function uploadFile(req: S3UploadRequest, res: Response) {
  requireAuthUser(req);
  const result = await s3Service.uploadFile(req.file);
  res.status(201).send(result);
}
