import { NextFunction, Request, Response } from 'express';

function parseAllowedOrigins() {
  return (process.env.CORS_ORIGIN ?? '*')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function resolveAllowedOrigin(req: Request) {
  const requestOrigin = req.headers.origin;
  const allowedOrigins = parseAllowedOrigins();

  if (allowedOrigins.includes('*')) {
    return requestOrigin ?? '*';
  }

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return allowedOrigins[0] ?? '*';
}

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigin = resolveAllowedOrigin(req);

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
