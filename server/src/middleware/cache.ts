import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

// キャッシュ無効化のためのタイムスタンプ
// タスクが更新されるたびに更新される
let taskDataTimestamp = Date.now();

/**
 * タスクデータのタイムスタンプを更新する
 * タスクの作成、更新、削除時に呼び出される
 */
export function updateTaskDataTimestamp(): void {
  taskDataTimestamp = Date.now();
  logger.debug(`タスクデータのタイムスタンプを更新しました: ${taskDataTimestamp}`);
}

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
      // タスク関連のエンドポイントの場合、タイムスタンプを含めてETagを生成
      const isTaskEndpoint = req.path.includes('/tasks') || req.path.includes('/categories');
      const etag = isTaskEndpoint 
        ? generateETagWithTimestamp(body, taskDataTimestamp)
        : generateETag(body);
      
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
      res.setHeader('Cache-Control', 'no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
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
 * 更新操作後にキャッシュを無効化するミドルウェア
 */
export function noCacheAfterMutation(req: Request, res: Response, next: NextFunction) {
  res.setHeader('Cache-Control', 'no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  logger.debug('更新操作のためキャッシュを無効化しています');
  next();
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

/**
 * タイムスタンプを含めてETagを生成する
 * @param obj ETagを生成するオブジェクト
 * @param timestamp タイムスタンプ
 * @returns ETag文字列
 */
function generateETagWithTimestamp(obj: any, timestamp: number): string {
  const str = JSON.stringify(obj) + timestamp;
  return crypto.createHash('md5').update(str).digest('hex');
}
