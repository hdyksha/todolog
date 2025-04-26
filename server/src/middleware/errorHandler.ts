import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { logger } from '../utils/logger.js';
import { ApiError, InternalServerError, ValidationError } from '../utils/error.js';
import { ZodError } from 'zod';
import { standardizeErrorMessage } from '../utils/errorUtils.js';

// 404エラーハンドラー
export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn(`リソースが見つかりません: ${req.originalUrl}`);
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `リソースが見つかりません: ${req.originalUrl}`,
    },
  });
};

// グローバルエラーハンドラー
export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // エラーの種類に基づいて適切なレスポンスを返す
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  
  if (statusCode >= 500) {
    // サーバーエラーの場合は詳細なログを記録
    logger.error({
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  } else {
    // クライアントエラーの場合は警告レベルでログを記録
    logger.warn({
      message: err.message,
      path: req.path,
      method: req.method,
    });
  }

  // Zodのバリデーションエラーを処理
  if (err instanceof ZodError) {
    const validationError = new ValidationError(err.message);
    return res.status(validationError.statusCode).json({
      error: {
        code: validationError.name,
        message: validationError.message
      }
    });
  }

  // APIエラーを処理
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.name,
        message: err.message
      }
    });
  }

  // その他のエラーは500 Internal Server Errorとして処理
  const serverError = new InternalServerError(
    process.env.NODE_ENV === 'production' 
      ? '内部サーバーエラーが発生しました' 
      : standardizeErrorMessage(err, '内部サーバーエラーが発生しました')
  );
  
  res.status(serverError.statusCode).json({
    error: {
      code: serverError.name,
      message: serverError.message,
      // 開発環境でのみスタックトレースを含める
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    }
  });
};
