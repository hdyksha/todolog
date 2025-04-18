import { z } from 'zod';

// エラーコード定義
export enum ErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

// APIエラーの基本クラス
export class ApiError extends Error {
  statusCode: number;
  code: ErrorCode;
  details?: any;

  constructor(message: string, statusCode: number, code: ErrorCode, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  // レスポンス用のオブジェクトを生成
  toResponse() {
    const response: any = {
      error: {
        code: this.code,
        message: this.message,
      },
    };

    if (this.details) {
      response.error.details = this.details;
    }

    return response;
  }
}

// 400 Bad Request
export class BadRequestError extends ApiError {
  constructor(message = 'リクエストが不正です', details?: any) {
    super(message, 400, ErrorCode.BAD_REQUEST, details);
  }
}

// 404 Not Found
export class NotFoundError extends ApiError {
  constructor(message = 'リソースが見つかりません', details?: any) {
    super(message, 404, ErrorCode.NOT_FOUND, details);
  }
}

// 500 Internal Server Error
export class InternalServerError extends ApiError {
  constructor(message = '内部サーバーエラーが発生しました', details?: any) {
    super(message, 500, ErrorCode.INTERNAL_SERVER_ERROR, details);
  }
}

// バリデーションエラー
export class ValidationError extends ApiError {
  constructor(zodError: z.ZodError) {
    const details = zodError.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
    }));
    
    super('入力値が不正です', 400, ErrorCode.VALIDATION_ERROR, details);
  }
}
