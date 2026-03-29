import type { S3UploadResult } from '../types/s3.type';

export function toS3UploadResult(url: string, key: string): S3UploadResult {
  return {
    message: '업로드 성공',
    url,
    key,
  };
}
