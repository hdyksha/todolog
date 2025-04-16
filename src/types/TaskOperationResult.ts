/**
 * タスク操作の結果を表す型
 */
export interface TaskOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
