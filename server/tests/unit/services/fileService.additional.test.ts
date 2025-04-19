import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileService } from '../../../src/services/fileService.js';
import path from 'path';

// fsモジュールのモック
vi.mock('fs/promises', () => {
  return {
    access: vi.fn(),
    mkdir: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    copyFile: vi.fn(),
    readdir: vi.fn(),
  };
});

vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
}));

// fs/promisesのインポート
import * as fs from 'fs/promises';

describe('FileService追加テスト', () => {
  let fileService: FileService;
  const testDataDir = './test-data';

  beforeEach(() => {
    fileService = new FileService(testDataDir);
    vi.clearAllMocks();
  });

  describe('createBackup', () => {
    it('バックアップを作成するべき', async () => {
      // モックの設定
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.copyFile).mockResolvedValue(undefined);
      
      const filename = 'tasks.json';
      const result = await fileService.createBackup(filename);
      
      // タイムスタンプを含むバックアップファイル名が返されることを確認
      expect(result).toMatch(/^tasks\.json\.\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}.*\.bak$/);
      expect(fs.copyFile).toHaveBeenCalled();
    });

    it('ソースファイルが存在しない場合はエラーを投げるべき', async () => {
      // モックの設定
      const error = new Error('File not found');
      (error as NodeJS.ErrnoException).code = 'ENOENT';
      vi.mocked(fs.access).mockRejectedValue(error);
      
      await expect(fileService.createBackup('tasks.json')).rejects.toThrow('バックアップ対象のファイルが存在しません');
    });
  });

  describe('listBackups', () => {
    it('バックアップファイルの一覧を返すべき', async () => {
      // モックの設定
      const mockFiles = [
        'tasks.json',
        'tasks.json.2025-04-18.bak',
        'tasks.json.2025-04-19.bak',
        'other-file.txt'
      ];
      vi.mocked(fs.readdir).mockResolvedValue(mockFiles as any);
      
      const result = await fileService.listBackups('tasks.json');
      
      expect(result).toEqual([
        'tasks.json.2025-04-18.bak',
        'tasks.json.2025-04-19.bak'
      ]);
      expect(fs.readdir).toHaveBeenCalled();
    });

    it('ディレクトリの読み取りに失敗した場合はエラーを投げるべき', async () => {
      // モックの設定
      vi.mocked(fs.readdir).mockRejectedValue(new Error('Failed to read directory'));
      
      await expect(fileService.listBackups('tasks.json')).rejects.toThrow('バックアップ一覧の取得に失敗しました');
    });
  });
});
