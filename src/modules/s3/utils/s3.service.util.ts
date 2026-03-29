import { randomUUID } from 'crypto';
import { S3Client } from '@aws-sdk/client-s3';
import { BadRequestError } from '../../../lib/errors/customErrors';

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new BadRequestError();
  }

  return value;
}

export function requireUploadFile(file?: Express.Multer.File) {
  if (!file) {
    throw new BadRequestError();
  }

  return file;
}

export function createS3Client() {
  const region = requireEnv('AWS_REGION');
  const accessKeyId = requireEnv('AWS_ACCESS_KEY_ID');
  const secretAccessKey = requireEnv('AWS_SECRET_ACCESS_KEY');

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export function createS3ObjectKey(fileName: string) {
  const prefix = process.env.AWS_S3_PREFIX ?? 'codiit';
  const safeName = fileName.replace(/\s+/g, '-');
  return `${prefix}/${Date.now()}-${randomUUID()}-${safeName}`;
}

export function createS3ObjectUrl(bucket: string, region: string, key: string) {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export function requireS3Bucket() {
  return requireEnv('AWS_S3_BUCKET_NAME');
}

export function requireS3Region() {
  return requireEnv('AWS_REGION');
}

function isHttpUrl(value: string) {
  return value.startsWith('http://') || value.startsWith('https://');
}

function isRootPath(value: string) {
  return value.startsWith('/');
}

export function resolveS3ImageUrl(
  imageUrl: string | null | undefined,
  imageKey: string | null | undefined,
  fallbackUrl: string,
) {
  if (imageKey) {
    const bucket = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    if (bucket && region) {
      return createS3ObjectUrl(bucket, region, imageKey);
    }
  }

  if (typeof imageUrl === 'string') {
    const trimmed = imageUrl.trim();
    if (trimmed && (isHttpUrl(trimmed) || isRootPath(trimmed))) {
      return trimmed;
    }
  }

  return fallbackUrl;
}
