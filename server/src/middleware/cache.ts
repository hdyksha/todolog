import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * ETagを生成するミドルウェア
 */
export function etagMiddleware(req: Request, res: Response, next: NextFunction) {
  // 元のjsonメソッドを保存
  const originalJson = res.json;

  // jsonメソッドをオーバーライド
  res.json = function(body) {
    // 元のjsonメソッドを呼び出す前にETagを設定
    if (body) {
      const etag = generateETag(body);
      res.setHeader('ETag', etag);
      
      // If-None-Matchヘッダーがあり、ETagと一致する場合は304を返す
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch === etag) {
        logger.debug('ETagが一致したため304を返します');
        res.status(304).end();
        return res;
      }
    }
    
    // 元のjsonメソッドを呼び出す
    return originalJson.call(this, body);
  };
  
  next();
}

/**
 * キャッシュヘッダーを設定するミドルウェア
 * @param maxAge キャッシュの最大有効期間（秒）
 */
export function cacheControl(maxAge: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    // 開発環境ではキャッシュを無効化
    if (process.env.NODE_ENV === 'development') {
      res.setHeader('Cache-Control', 'no-store');
      logger.debug('開発環境のためキャッシュを無効化しています');
    } else {
      // 本番環境では指定された時間だけキャッシュを有効化
      res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
      logger.debug(`キャッシュを設定しました: max-age=${maxAge}`);
    }
    next();
  };
}

/**
 * オブジェクトからETagを生成する
 * @param obj ETagを生成するオブジェクト
 * @returns ETag文字列
 */
function generateETag(obj: any): string {
  const str = JSON.stringify(obj);
  return crypto.createHash('md5').update(str).digest('hex');
}
