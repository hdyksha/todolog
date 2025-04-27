/**
 * APIエラーを処理するためのユーティリティ関数
 */

/**
 * エラーオブジェクトからエラーメッセージを抽出する
 * @param error - エラーオブジェクト
 * @param defaultMessage - デフォルトのエラーメッセージ
 * @returns エラーメッセージ
 */
export const getErrorMessage = (error: unknown, defaultMessage = '不明なエラーが発生しました'): string => {
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return defaultMessage;
};

/**
 * APIエラーを処理する
 * @param error - エラーオブジェクト
 * @param operation - 実行していた操作の説明
 * @returns エラーメッセージ
 */
export const handleApiError = (error: unknown, operation: string): Error => {
  const message = getErrorMessage(error, `${operation}に失敗しました`);
  console.error(`${operation}に失敗しました:`, error);
  return new Error(message);
};

/**
 * IDを含むAPIエラーを処理する
 * @param error - エラーオブジェクト
 * @param operation - 実行していた操作の説明
 * @param id - 関連するID
 * @returns エラーオブジェクト
 */
export const handleApiErrorWithId = (error: unknown, operation: string, id: string) => {
  return {
    id,
    error: handleApiError(error, operation)
  };
};

/**
 * エラーをコンソールに記録する
 * @param error - エラーオブジェクト
 * @param context - エラーのコンテキスト
 */
export const logError = (error: unknown, context: string): void => {
  console.error(`[${context}]`, error);
};
