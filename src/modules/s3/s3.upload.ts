import multer from 'multer';
import type { RequestHandler } from 'express';
import { MulterError } from 'multer';
import { BadRequestError, UploadTooLargeError } from '../../lib/errors/customErrors';

const DEFAULT_S3_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

function getS3UploadMaxBytes() {
  const parsed = Number(
    process.env.S3_UPLOAD_MAX_BYTES ?? DEFAULT_S3_UPLOAD_MAX_BYTES,
  );

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_S3_UPLOAD_MAX_BYTES;
  }

  return Math.floor(parsed);
}

const upload = multer({
  limits: {
    fileSize: getS3UploadMaxBytes(),
  },
});

export const s3Upload: RequestHandler = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new UploadTooLargeError());
      }

      return next(new BadRequestError('잘못된 업로드 요청입니다.'));
    }

    if (err) {
      return next(err);
    }

    return next();
  });
};
