/**
 * エラーハンドリングのためのユーティリティ関数
 */
import { Response } from 'express';
import { logger } from './logger.js';
import { ApiError } from './error.js';

/**
 * エラーメッセージを標準化する
 * @param error エラーオブジェクト
 * @param defaultMessage デフォルトのエラーメッセージ
 * @returns 標準化されたエラーメッセージ
 */
export const standardizeErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }
  if (typeof error === 'string') {
    return error;
  }
  return defaultMessage;
};

/**
 * API操作中のエラーを処理する
 * @param error エラーオブジェクト
 * @param res Expressのレスポンスオブジェクト
 * @param operation 実行中の操作の説明
 */
export const handleApiError = (error: unknown, res: Response, operation: string): void => {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      error: {
        code: error.name,
        message: error.message,
      }
    });
  } else {
    const message = standardizeErrorMessage(error, '不明なエラー');
    logger.error(`${operation}に失敗しました: ${message}`, {
      operation,
      error: error instanceof Error ? error.stack : String(error)
    });
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: `${operation}に失敗しました: ${message}`,
      }
    });
  }
};

/**
 * 非同期関数のエラーをキャッチして処理する高階関数
 * @param fn 非同期関数
 * @returns エラーハンドリングを含む非同期関数
 */
export const asyncHandler = <T extends (...args: any[]) => Promise<any>>(fn: T) => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      const [, res, next] = args;
      if (next && typeof next === 'function') {
        next(error);
      } else if (res && typeof res.status === 'function') {
        handleApiError(error, res, 'API操作');
      } else {
        throw error;
      }
    }
  }) as T;
};
