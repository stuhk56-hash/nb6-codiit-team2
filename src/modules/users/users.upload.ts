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
  const multer = require('multer');
  usersUpload = multer().single('image');
} catch {
  usersUpload = noopUpload;
}

export { usersUpload };
