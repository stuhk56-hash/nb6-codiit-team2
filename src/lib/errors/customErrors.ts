export class BaseError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends BaseError {
  constructor(message = '존재하지 않습니다.') {
    super(message, 404);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message = '인증이 필요합니다.') {
    super(message, 401);
  }
}

export class BadRequestError extends BaseError {
  constructor(message = '잘못된 요청입니다.') {
    super(message, 400);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message = '권한이 없습니다.') {
    super(message, 403);
  }
}

export class ConflictError extends BaseError {
  constructor(message = '이미 존재합니다.') {
    super(message, 409);
  }
}

export class UploadTooLargeError extends BaseError {
  constructor(message = '업로드 가능한 최대 파일 용량을 초과했습니다.') {
    super(message, 413);
  }
}
