import winston from 'winston';
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

// カスタムログフォーマットの作成
const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let metaStr = '';
  if (Object.keys(metadata).length > 0) {
    metaStr = JSON.stringify(metadata);
  }
  return `${timestamp} [${level}]: ${message} ${metaStr}`;
});

// ロガーの設定
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
      ),
    }),
    // 本番環境ではファイルにも出力
    ...(env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({ filename: 'error.log', level: 'error' }),
          new winston.transports.File({ filename: 'combined.log' }),
        ]
      : []),
  ],
});

// リクエストロギングミドルウェア
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // リクエスト開始時のログ（デバッグレベル）
  if (env.LOG_LEVEL === 'debug') {
    logger.debug({
      message: `リクエスト開始: ${req.method} ${req.url}`,
      method: req.method,
      url: req.url,
      query: req.query,
      ip: req.ip,
    });
  }
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger.log(level, {
      message: `${req.method} ${req.url} ${res.statusCode} ${duration}ms`,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });
  
  next();
};
