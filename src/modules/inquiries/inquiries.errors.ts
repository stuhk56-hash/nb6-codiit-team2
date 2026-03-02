export class InquiryError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

export class InquiryValidationError extends InquiryError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class InquiryUnauthorizedError extends InquiryError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class InquiryForbiddenError extends InquiryError {
  constructor(message: string) {
    super(message, 403);
  }
}

export class InquiryNotFoundError extends InquiryError {
  constructor(message: string) {
    super(message, 404);
  }
}
