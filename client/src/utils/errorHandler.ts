import { ApiError } from '../types';

/**
 * APIエラーを表すカスタムエラークラス
 */
export class ApiErrorClass extends Error {
  status: number;
  errors?: Record<string, string[]>;
  
  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

/**
 * APIレスポンスを処理し、エラーがあれば例外をスローする
 * @param response Fetchレスポンス
 * @returns レスポンスのJSONデータ
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `API error: ${response.status}`;
    let errors: Record<string, string[]> | undefined;
    
    try {
      const errorData = await response.json() as ApiError;
      errorMessage = errorData.message || errorMessage;
      errors = errorData.errors;
    } catch (e) {
      // JSONパースエラーは無視
    }
    
    throw new ApiErrorClass(errorMessage, response.status, errors);
  }
  
  return response.json() as Promise<T>;
}

/**
 * エラーメッセージを取得する
 * @param error エラーオブジェクト
 * @returns ユーザーフレンドリーなエラーメッセージ
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiErrorClass) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
}

/**
 * ネットワークエラーかどうかを判定する
 * @param error エラーオブジェクト
 * @returns ネットワークエラーかどうか
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && 
    (error.message.includes('Failed to fetch') || 
     error.message.includes('Network request failed'));
}

/**
 * 認証エラーかどうかを判定する
 * @param error エラーオブジェクト
 * @returns 認証エラーかどうか
 */
export function isAuthError(error: unknown): boolean {
  return error instanceof ApiErrorClass && 
    (error.status === 401 || error.status === 403);
}

/**
 * バリデーションエラーかどうかを判定する
 * @param error エラーオブジェクト
 * @returns バリデーションエラーかどうか
 */
export function isValidationError(error: unknown): boolean {
  return error instanceof ApiErrorClass && 
    error.status === 422 && 
    !!error.errors;
}

/**
 * バリデーションエラーからフィールドごとのエラーメッセージを取得する
 * @param error エラーオブジェクト
 * @returns フィールドごとのエラーメッセージ
 */
export function getValidationErrors(error: unknown): Record<string, string> {
  if (!isValidationError(error) || !(error instanceof ApiErrorClass)) {
    return {};
  }
  
  const result: Record<string, string> = {};
  
  for (const [field, messages] of Object.entries(error.errors || {})) {
    result[field] = messages[0] || '';
  }
  
  return result;
}
