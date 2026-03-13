import type { AuthenticatedRequest } from '../../../middlewares/authenticate';

export type S3UploadRequest = AuthenticatedRequest & {
  file?: Express.Multer.File;
};

export type S3UploadResult = {
  message: string;
  url: string;
  key: string;
};
