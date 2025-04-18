import helmet from 'helmet';
import { Express } from 'express';
import { logger } from '../utils/logger.js';

/**
 * セキュリティ関連のミドルウェアを設定する
 * @param app Expressアプリケーション
 */
export function setupSecurity(app: Express): void {
  logger.info('セキュリティミドルウェアを設定しています');
  
  // Helmetの基本設定
  app.use(
    helmet({
      // Content Security Policy
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"], // 開発環境用に緩和
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      // X-XSS-Protection
      xssFilter: true,
      // X-Content-Type-Options
      noSniff: true,
      // X-Frame-Options
      frameguard: {
        action: 'deny',
      },
      // Strict-Transport-Security
      hsts: {
        maxAge: 31536000, // 1年
        includeSubDomains: true,
        preload: true,
      },
      // Referrer-Policy
      referrerPolicy: {
        policy: 'same-origin',
      },
    })
  );

  // 開発環境ではCSPを緩和
  if (process.env.NODE_ENV === 'development') {
    app.use(
      helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'", 'ws:', 'wss:'], // WebSocketのサポート
        },
      })
    );
  }
}
