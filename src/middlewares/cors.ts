import { NextFunction, Request, Response } from 'express';

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigin = process.env.CORS_ORIGIN ?? '*';

  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send();
    return;
  }

  next();
};
