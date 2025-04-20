import { Request, Response } from 'express';
import { SettingsService } from '../services/settingsService.js';
import { UpdateSettingsInput } from '../models/settings.model.js';
import { logger } from '../utils/logger.js';

/**
 * 設定を管理するコントローラークラス
 */
export class SettingsController {
  private settingsService: SettingsService;

  /**
   * SettingsControllerのコンストラクタ
   * @param settingsService 設定サービスのインスタンス
   */
  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  /**
   * 現在の設定を取得する
   * @param req リクエスト
   * @param res レスポンス
   */
  async getSettings(req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.settingsService.getSettings();
      res.json(settings);
    } catch (error) {
      logger.error('設定の取得に失敗しました', { error: (error as Error).message });
      res.status(500).json({ error: '設定の取得に失敗しました' });
    }
  }

  /**
   * 設定を更新する
   * @param req リクエスト
   * @param res レスポンス
   */
  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const updateData = req.body as UpdateSettingsInput;
      const updatedSettings = await this.settingsService.updateSettings(updateData);
      res.json(updatedSettings);
    } catch (error) {
      logger.error('設定の更新に失敗しました', { error: (error as Error).message });
      res.status(400).json({ error: `設定の更新に失敗しました: ${(error as Error).message}` });
    }
  }

  /**
   * 設定をデフォルトにリセットする
   * @param req リクエスト
   * @param res レスポンス
   */
  async resetSettings(req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.settingsService.resetSettings();
      res.json(settings);
    } catch (error) {
      logger.error('設定のリセットに失敗しました', { error: (error as Error).message });
      res.status(500).json({ error: '設定のリセットに失敗しました' });
    }
  }

  /**
   * データディレクトリを設定する
   * @param req リクエスト
   * @param res レスポンス
   */
  async setDataDir(req: Request, res: Response): Promise<void> {
    try {
      const { dataDir } = req.body;
      
      if (!dataDir || typeof dataDir !== 'string') {
        res.status(400).json({ error: 'データディレクトリが指定されていません' });
        return;
      }
      
      await this.settingsService.setDataDir(dataDir);
      const settings = await this.settingsService.getSettings();
      logger.info('データディレクトリを設定しました', settings);
      res.json(settings);
    } catch (error) {
      logger.error('データディレクトリの設定に失敗しました', { error: (error as Error).message });
      res.status(400).json({ error: `データディレクトリの設定に失敗しました: ${(error as Error).message}` });
    }
  }

  /**
   * 現在のタスクファイルを設定する
   * @param req リクエスト
   * @param res レスポンス
   */
  async setCurrentTaskFile(req: Request, res: Response): Promise<void> {
    try {
      const { filename } = req.body;
      
      if (!filename || typeof filename !== 'string') {
        res.status(400).json({ error: 'ファイル名が指定されていません' });
        return;
      }
      
      await this.settingsService.setCurrentTaskFile(filename);
      const settings = await this.settingsService.getSettings();
      logger.info('タスクファイルを設定しました', settings);
      res.json(settings);
    } catch (error) {
      logger.error('タスクファイルの設定に失敗しました', { error: (error as Error).message });
      res.status(400).json({ error: `タスクファイルの設定に失敗しました: ${(error as Error).message}` });
    }
  }

  /**
   * 最近使用したタスクファイルのリストを取得する
   * @param req リクエスト
   * @param res レスポンス
   */
  async getRecentTaskFiles(req: Request, res: Response): Promise<void> {
    try {
      const recentFiles = await this.settingsService.getRecentTaskFiles();
      logger.info('最近使用したタスクファイルのリストを取得しました', { recentFiles });
      res.json(recentFiles);
    } catch (error) {
      logger.error('最近使用したタスクファイルのリストの取得に失敗しました', { error: (error as Error).message });
      res.status(500).json({ error: '最近使用したタスクファイルのリストの取得に失敗しました' });
    }
  }
}
