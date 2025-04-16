import { useState, useCallback } from 'react';

// エラータイプの定義
export enum ErrorType {
  NETWORK = 'network',
  SERVER = 'server',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown',
}

// エラー情報の型定義
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  code?: string;
  details?: string;
  timestamp: Date;
  retry?: () => Promise<void>;
}

// エラーハンドラーのオプション
interface ErrorHandlerOptions {
  // 自動的にエラーをクリアする時間（ミリ秒）。0以下の場合は自動クリアしない
  autoClearTimeout?: number;
}

/**
 * エラーハンドリングのためのカスタムフック
 */
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // エラーをクリアする
  const clearError = useCallback(() => {
    setError(null);
    setIsRetrying(false);
  }, []);

  // エラーを処理する
  const handleError = useCallback(
    (err: unknown, retryFn?: () => Promise<void>) => {
      let errorInfo: ErrorInfo;

      // エラーの種類に応じた処理
      if (err instanceof Error) {
        if (err.message.includes('network') || err.message.includes('fetch')) {
          errorInfo = {
            type: ErrorType.NETWORK,
            message: 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
            details: err.message,
            timestamp: new Date(),
            retry: retryFn,
          };
        } else if (err.message.includes('404')) {
          errorInfo = {
            type: ErrorType.NOT_FOUND,
            message: 'リソースが見つかりませんでした。',
            details: err.message,
            timestamp: new Date(),
          };
        } else if (err.message.includes('403') || err.message.includes('401')) {
          errorInfo = {
            type: ErrorType.PERMISSION,
            message: 'アクセス権限がありません。',
            details: err.message,
            timestamp: new Date(),
          };
        } else if (err.message.includes('validation')) {
          errorInfo = {
            type: ErrorType.VALIDATION,
            message: '入力データが正しくありません。',
            details: err.message,
            timestamp: new Date(),
          };
        } else if (err.message.includes('500')) {
          errorInfo = {
            type: ErrorType.SERVER,
            message: 'サーバーエラーが発生しました。しばらく経ってからもう一度お試しください。',
            details: err.message,
            timestamp: new Date(),
            retry: retryFn,
          };
        } else {
          errorInfo = {
            type: ErrorType.UNKNOWN,
            message: 'エラーが発生しました。',
            details: err.message,
            timestamp: new Date(),
            retry: retryFn,
          };
        }
      } else {
        // Error オブジェクトでない場合
        errorInfo = {
          type: ErrorType.UNKNOWN,
          message: 'エラーが発生しました。',
          details: String(err),
          timestamp: new Date(),
          retry: retryFn,
        };
      }

      setError(errorInfo);

      // 自動クリアのタイマーを設定
      if (options.autoClearTimeout && options.autoClearTimeout > 0) {
        setTimeout(() => {
          clearError();
        }, options.autoClearTimeout);
      }
    },
    [clearError, options.autoClearTimeout]
  );

  // リトライ処理
  const retryOperation = useCallback(async () => {
    if (!error?.retry) return;

    setIsRetrying(true);
    try {
      await error.retry();
      clearError();
    } catch (err) {
      // リトライ失敗時は元のエラーを保持し、リトライ状態のみ解除
      setIsRetrying(false);
    }
  }, [error, clearError]);

  return {
    error,
    isRetrying,
    handleError,
    clearError,
    retryOperation,
  };
}

/**
 * エラーメッセージを取得する関数
 * @param error エラー情報
 * @returns ユーザーフレンドリーなエラーメッセージ
 */
export function getErrorMessage(error: ErrorInfo): string {
  return error.message;
}

/**
 * エラーの詳細情報を取得する関数
 * @param error エラー情報
 * @returns エラーの詳細情報
 */
export function getErrorDetails(error: ErrorInfo): string {
  return error.details || '';
}

/**
 * エラーがリトライ可能かどうかを判定する関数
 * @param error エラー情報
 * @returns リトライ可能な場合は true
 */
export function isRetryableError(error: ErrorInfo): boolean {
  return error.type === ErrorType.NETWORK || error.type === ErrorType.SERVER || !!error.retry;
}

/**
 * 指数バックオフを使用したリトライ関数
 * @param operation 実行する操作
 * @param maxRetries 最大リトライ回数
 * @param baseDelay 基本遅延時間（ミリ秒）
 * @returns 操作の結果
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let retries = 0;

  while (true) {
    try {
      return await operation();
    } catch (err) {
      if (retries >= maxRetries) {
        throw err;
      }

      // 指数バックオフ: baseDelay * 2^retries + ランダム値
      const delay = baseDelay * Math.pow(2, retries) + Math.random() * 1000;
      retries++;

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
