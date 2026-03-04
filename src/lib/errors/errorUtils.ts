//굳이 타입을 types로 옮기지 않은 이유는, 이 함수는 에러 핸들링 미들웨어에서만 사용되고, 다른 곳에서는 사용되지 않기 때문
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
