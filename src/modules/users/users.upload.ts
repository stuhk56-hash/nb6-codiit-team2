import { NextFunction, Request, Response } from 'express';

type UploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

const noopUpload: UploadMiddleware = (
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  next();
};

let usersUpload: UploadMiddleware = noopUpload;

try {
  // `multer` is optional in some local environments.
  // If it is installed, image upload works as expected.
  // If not, API still runs and skips multipart parsing.
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const multer = require('multer');
  usersUpload = multer().single('image');
} catch {
  usersUpload = noopUpload;
}

export { usersUpload };
