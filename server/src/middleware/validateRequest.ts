import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { logger } from '../utils/logger.js';

interface ValidateRequestOptions {
  params?: AnyZodObject;
  query?: AnyZodObject;
  body?: AnyZodObject;
}

/**
 * リクエストのバリデーションを行うミドルウェア
 * @param schemas バリデーションスキーマ
 */
export const validateRequest = (schemas: ValidateRequestOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // パラメータのバリデーション
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }

      // クエリのバリデーション
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }

      // ボディのバリデーション
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // バリデーションエラーの整形
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        logger.warn('リクエストバリデーションエラー', { errors: formattedErrors });
        
        return res.status(400).json({
          status: 'error',
          message: 'バリデーションエラー',
          errors: formattedErrors,
        });
      }

      // その他のエラー
      logger.error('リクエスト処理中にエラーが発生しました', { error: (error as Error).message });
      return res.status(500).json({
        status: 'error',
        message: '内部サーバーエラー',
      });
    }
  };
};
