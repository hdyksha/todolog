import { Request, Response } from 'express';
import { FileService } from '../services/fileService.js';
import { logger } from '../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

/**
 * ディレクトリ操作を管理するコントローラークラス
 */
export class DirectoryController {
  private fileService: FileService;

  /**
   * DirectoryControllerのコンストラクタ
   * @param fileService ファイルサービスのインスタンス
   */
  constructor(fileService: FileService) {
    this.fileService = fileService;
  }

  /**
   * 利用可能なディレクトリ一覧を取得する
   * @param req リクエスト
   * @param res レスポンス
   */
  async listDirectories(req: Request, res: Response): Promise<void> {
    try {
      // デフォルトのディレクトリリスト
      const defaultDirectories = [
        { path: './data', label: 'デフォルト (./data)' },
        { path: path.join(os.homedir(), 'todolog'), label: 'ホームディレクトリ (~/todolog)' },
        { path: path.join(os.tmpdir(), 'todolog'), label: '一時ディレクトリ' },
      ];

      // 現在のデータディレクトリ
      const currentDataDir = this.fileService.getDataDir();
      
      // カスタムディレクトリがデフォルトリストに含まれていない場合は追加
      const isCustomDir = !defaultDirectories.some(dir => dir.path === currentDataDir);
      
      const directories = isCustomDir 
        ? [...defaultDirectories, { path: currentDataDir, label: 'カスタム' }]
        : defaultDirectories;
      
      // 各ディレクトリの存在確認と書き込み権限チェック
      const directoriesWithStatus = await Promise.all(
        directories.map(async (dir) => {
          try {
            // ディレクトリが存在しない場合は作成を試みる
            await fs.mkdir(dir.path, { recursive: true });
            
            // 書き込み権限をチェック
            const testFilePath = path.join(dir.path, '.write_test');
            await fs.writeFile(testFilePath, '');
            await fs.unlink(testFilePath);
            
            return {
              ...dir,
              exists: true,
              writable: true
            };
          } catch (error) {
            return {
              ...dir,
              exists: await this.directoryExists(dir.path),
              writable: false,
              error: (error as Error).message
            };
          }
        })
      );
      
      res.json(directoriesWithStatus);
    } catch (error) {
      logger.error('ディレクトリ一覧の取得に失敗しました', { error: (error as Error).message });
      res.status(500).json({ error: 'ディレクトリ一覧の取得に失敗しました' });
    }
  }

  /**
   * ディレクトリが存在するかどうかを確認する
   * @param dirPath ディレクトリパス
   * @returns 存在する場合はtrue、存在しない場合はfalse
   */
  private async directoryExists(dirPath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(dirPath);
      return stats.isDirectory();
    } catch (error) {
      return false;
    }
  }
}
