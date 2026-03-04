import type { NextFunction, Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { StructError } from 'superstruct';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../lib/errors/customErrors';
import { makeErrorResponse } from '../lib/errors/error-response';
import { isSyntaxJsonError } from '../lib/errors/errorUtils';

export function defaultNotFoundHandler(_: Request, res: Response, __: NextFunction) {
  return res.status(404).send(makeErrorResponse(404, '존재하지 않습니다'));
}

export function globalErrorHandler(err: unknown, _: Request, res: Response, __: NextFunction) {
  if (err instanceof StructError) {
    return res.status(400).send({
      message: '잘못된 요청입니다',
      error: 'Bad Request',
      statusCode: 400,
      issues: err.failures().map((failure) => ({
        path: failure.path.join('.'),
        message: failure.message,
        value: failure.value,
      })),
    });
  }

  if (err instanceof BadRequestError || isSyntaxJsonError(err)) {
    return res.status(400).send(makeErrorResponse(400, '잘못된 요청입니다'));
  }

  if (err instanceof UnauthorizedError) {
    return res.status(401).send(makeErrorResponse(401, err.message));
  }

  if (err instanceof ForbiddenError) {
    return res.status(403).send(makeErrorResponse(403, err.message));
  }

  if (err instanceof ConflictError) {
    return res.status(409).send(makeErrorResponse(409, err.message));
  }

  if (err instanceof NotFoundError) {
    return res.status(404).send(makeErrorResponse(404, err.message));
  }

  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      return res.status(404).send(makeErrorResponse(404, '존재하지 않습니다'));
    }

    if (err.code === 'P2002') {
      return res.status(400).send(makeErrorResponse(400, '잘못된 요청입니다'));
    }

    return res.status(500).send(makeErrorResponse(500, '데이터 처리 중 오류가 발생했습니다'));
  }

  console.error(err);
  return res.status(500).send(makeErrorResponse(500, '데이터 처리 중 오류가 발생했습니다'));
}
