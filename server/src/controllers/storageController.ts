import { Request, Response } from 'express';
import { FileService } from '../services/fileService.js';
import { SettingsService } from '../services/settingsService.js';
import { logger } from '../utils/logger.js';
import path from 'path';

/**
 * ストレージ操作を管理するコントローラークラス
 */
export class StorageController {
  private fileService: FileService;
  private settingsService: SettingsService;

  /**
   * StorageControllerのコンストラクタ
   * @param fileService ファイルサービスのインスタンス
   * @param settingsService 設定サービスのインスタンス
   */
  constructor(fileService: FileService, settingsService: SettingsService) {
    this.fileService = fileService;
    this.settingsService = settingsService;
  }

  /**
   * 指定されたディレクトリ内のファイル一覧を取得する
   * @param req リクエスト
   * @param res レスポンス
   */
  async listFiles(req: Request, res: Response): Promise<void> {
    try {
      const extension = req.query.extension as string | undefined;
      const files = await this.fileService.listFiles(extension);
      res.json(files);
    } catch (error) {
      logger.error('ファイル一覧の取得に失敗しました', { error: (error as Error).message });
      res.status(500).json({ error: 'ファイル一覧の取得に失敗しました' });
    }
  }

  /**
   * 新しいタスクファイルを作成する
   * @param req リクエスト
   * @param res レスポンス
   */
  async createTaskFile(req: Request, res: Response): Promise<void> {
    try {
      const { filename } = req.body;
      
      if (!filename || typeof filename !== 'string') {
        res.status(400).json({ error: 'ファイル名が指定されていません' });
        return;
      }
      
      // ファイル名のバリデーション
      if (!this.isValidFilename(filename)) {
        res.status(400).json({ error: 'ファイル名に無効な文字が含まれています' });
        return;
      }
      
      // 拡張子の確認と追加
      const normalizedFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
      
      // 空のタスク配列を書き込む
      await this.fileService.writeFile(normalizedFilename, []);
      
      // 現在のタスクファイルとして設定
      await this.settingsService.setCurrentTaskFile(normalizedFilename);
      
      res.status(201).json({ 
        filename: normalizedFilename,
        message: `タスクファイル ${normalizedFilename} を作成しました`
      });
    } catch (error) {
      logger.error('タスクファイルの作成に失敗しました', { error: (error as Error).message });
      res.status(500).json({ error: 'タスクファイルの作成に失敗しました' });
    }
  }

  /**
   * ファイル名が有効かどうかを検証する
   * @param filename ファイル名
   * @returns 有効な場合はtrue、無効な場合はfalse
   */
  private isValidFilename(filename: string): boolean {
    // ファイル名に使用できない文字や、ディレクトリトラバーサルを防止
    const invalidChars = /[<>:"/\\|?*\x00-\x1F]/;
    const hasInvalidChars = invalidChars.test(filename);
    
    // パス区切り文字を含まないこと
    const containsPathSeparator = filename.includes(path.sep);
    
    // 相対パスを含まないこと
    const containsRelativePath = filename.includes('..') || filename === '.' || filename === '..';
    
    return !hasInvalidChars && !containsPathSeparator && !containsRelativePath;
  }
}
