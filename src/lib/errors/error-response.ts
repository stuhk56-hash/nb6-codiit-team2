import { ErrorResponse } from '../../types/error.type';

function getErrorName(statusCode: number) {
  if (statusCode === 400) return 'Bad Request';
  if (statusCode === 401) return 'Unauthorized';
  if (statusCode === 403) return 'Forbidden';
  if (statusCode === 404) return 'Not Found';
  if (statusCode === 409) return 'Conflict';
  if (statusCode === 413) return 'Payload Too Large';
  return 'Internal Server Error';
}

export function makeErrorResponse(statusCode: number, message: string): ErrorResponse {
  return {
    message,
    error: getErrorName(statusCode),
    statusCode,
  };
}
