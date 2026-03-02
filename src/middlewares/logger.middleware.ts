import type { NextFunction, Request, Response } from 'express';
import { logger } from '../errors/logger.js';

export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { method, originalUrl } = req;
  const userAgent = req.get('user-agent') || '';

  res.on('finish', () => {
    const { statusCode } = res;
    const contentLength = res.get('content-length') || '0';
    logger.info(`${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent}`);
  });

  next();
};
