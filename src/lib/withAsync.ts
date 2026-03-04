import { RequestHandler } from 'express';

type AsyncHandler = RequestHandler;

export function withAsync(handler: AsyncHandler): RequestHandler {
  return async function wrapped(req, res, next) {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
