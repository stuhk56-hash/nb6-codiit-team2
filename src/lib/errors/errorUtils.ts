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
