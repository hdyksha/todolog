import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * 404エラーハンドラー
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    error: 'リソースが見つかりません',
    path: req.path
  });
};

/**
 * グローバルエラーハンドラー
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('サーバーエラーが発生しました', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(500).json({
    error: 'サーバーエラーが発生しました',
    message: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
};
