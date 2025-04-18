import rateLimit from 'express-rate-limit';
import { Express } from 'express';
import { logger } from '../utils/logger.js';

/**
 * レート制限のミドルウェアを設定する
 * @param app Expressアプリケーション
 */
export function setupRateLimiter(app: Express): void {
  // テスト環境ではレート制限を無効化
  if (process.env.NODE_ENV === 'test') {
    logger.info('テスト環境のためレート制限を無効化しています');
    return;
  }

  logger.info('レート制限ミドルウェアを設定しています');

  // API全体のレート制限
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分
    max: 100, // 15分あたり100リクエストまで
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`レート制限を超過しました: ${req.ip}`);
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'リクエスト数が制限を超えました。しばらく経ってから再試行してください。',
      });
    },
  });

  // 書き込み操作（POST, PUT, DELETE）に対するより厳しいレート制限
  const writeOperationsLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1時間
    max: 50, // 1時間あたり50リクエストまで
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`書き込み操作のレート制限を超過しました: ${req.ip}`);
      res.status(429).json({
        error: 'Too Many Requests',
        message: '書き込み操作のリクエスト数が制限を超えました。しばらく経ってから再試行してください。',
      });
    },
    // POST, PUT, DELETEメソッドのみに適用
    skip: (req) => !['POST', 'PUT', 'DELETE'].includes(req.method),
  });

  // APIルートにレート制限を適用
  app.use('/api/', apiLimiter);
  app.use('/api/', writeOperationsLimiter);
}
