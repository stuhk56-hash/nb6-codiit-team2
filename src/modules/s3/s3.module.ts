import multer from 'multer';
import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import { uploadFile } from './s3.controller';

const upload = multer();

export const s3Router = Router();

s3Router.post(
  '/upload',
  authenticate(),
  upload.single('image'),
  withAsync(uploadFile),
);
