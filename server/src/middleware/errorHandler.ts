import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

// 404エラーハンドラー
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `リソースが見つかりません: ${req.originalUrl}`,
  });
};

// グローバルエラーハンドラー
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? '内部サーバーエラーが発生しました' 
      : err.message,
  });
};
