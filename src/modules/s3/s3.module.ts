import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import { uploadFile } from './s3.controller';
import { s3Upload } from './s3.upload';

export const s3Router = Router();

s3Router.post(
  '/upload',
  authenticate(),
  s3Upload,
  withAsync(uploadFile),
);
