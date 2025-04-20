/**
 * サーバー側の設定の型定義
 */
export interface ServerSettings {
  storage: {
    dataDir: string;
    currentTaskFile: string;
    recentTaskFiles: string[];
  };
  app: {
    maxTasksPerPage: number;
    maxBackups: number;
  };
}

/**
 * クライアント側の設定の型定義
 */
export interface ClientSettings {
  showArchive: boolean;
  autoExpandArchive: boolean;
  showArchiveStats: boolean;
  defaultView: 'list' | 'board';
  defaultSort: 'dueDate' | 'priority' | 'createdAt';
  defaultFilter: 'all' | 'active' | 'completed';
  itemsPerPage: number;
}

/**
 * 設定更新用の型定義
 */
export type UpdateServerSettings = Partial<{
  storage: Partial<ServerSettings['storage']>;
  app: Partial<ServerSettings['app']>;
}>;

/**
 * タスクファイル情報の型定義
 */
export interface TaskFile {
  filename: string;
  path: string;
  lastModified?: string;
  taskCount?: number;
}
