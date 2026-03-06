import { UnauthorizedError } from './customErrors';
import type { AuthenticateOptions } from '../../types/authenticate.type';

interface SyntaxJsonError extends SyntaxError {
  status?: number;
  body?: unknown;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isSyntaxJsonError(err: unknown): err is SyntaxJsonError {
  if (!(err instanceof SyntaxError)) return false;
  if (!isObject(err)) return false;
  return typeof err.status === 'number' && 'body' in err;
}

export function makeUnauthorizedError(
  options?: AuthenticateOptions,
  message?: string,
) {
  if (options?.useDefaultMessage) {
    return new UnauthorizedError();
  }

  return new UnauthorizedError(message);
}
