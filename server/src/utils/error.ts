/**
 * API エラークラス
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

/**
 * 404 Not Found エラー
 */
export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * 400 Bad Request エラー
 */
export class BadRequestError extends ApiError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'BadRequestError';
  }
}

/**
 * 401 Unauthorized エラー
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * 403 Forbidden エラー
 */
export class ForbiddenError extends ApiError {
  constructor(message: string) {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * 409 Conflict エラー
 */
export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * 422 Unprocessable Entity エラー
 */
export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 422);
    this.name = 'ValidationError';
  }
}

/**
 * 429 Too Many Requests エラー
 */
export class TooManyRequestsError extends ApiError {
  constructor(message: string) {
    super(message, 429);
    this.name = 'TooManyRequestsError';
  }
}

/**
 * 500 Internal Server Error エラー
 */
export class InternalServerError extends ApiError {
  constructor(message: string) {
    super(message, 500);
    this.name = 'InternalServerError';
  }
}
