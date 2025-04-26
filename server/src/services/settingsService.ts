import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { AppSettings, defaultSettings, UpdateSettingsInput, AppSettingsSchema } from '../models/settings.model.js';
import { logger } from '../utils/logger.js';

/**
 * アプリケーション設定を管理するサービスクラス
 */
export class SettingsService {
  private settingsDir: string;
  private settingsFile: string;
  private settings: AppSettings;
  private initialized: boolean = false;
  private lastModifiedTime: number = 0; // 設定ファイルの最終更新時刻

  /**
   * SettingsServiceのコンストラクタ
   * @param settingsDir 設定ディレクトリのパス（デフォルトは~/.todolog）
   * @param settingsFile 設定ファイル名（デフォルトはsettings.json）
   */
  constructor(settingsDir?: string, settingsFile?: string) {
    // 引数 > 環境変数 > デフォルト値 の優先順位
    this.settingsDir = settingsDir || 
                       process.env.SETTINGS_DIR || 
                       path.join(os.homedir(), '.todolog');
    this.settingsFile = settingsFile || 
                        process.env.SETTINGS_FILE || 
                        'settings.json';
    this.settings = { ...defaultSettings };
    
    logger.debug(`設定ディレクトリ: ${this.settingsDir}, 設定ファイル: ${this.settingsFile}`);
  }

  /**
   * 設定サービスを初期化し、設定を読み込む
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      await this.ensureSettingsDir();
      await this.loadSettings();
      this.initialized = true;
    } catch (error) {
      logger.error('設定の初期化に失敗しました', { error: (error as Error).message });
      // 初期化に失敗してもデフォルト設定を使用して続行
      this.settings = { ...defaultSettings };
      this.initialized = true;
    }
  }

  /**
   * 設定が最新であることを確認し、必要に応じて再読み込みする
   */
  private async ensureLatestSettings(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
      return;
    }

    // ファイルの最終更新時刻を確認
    const filePath = this.getSettingsFilePath();
    try {
      const stats = await fs.stat(filePath);
      const fileModifiedTime = stats.mtimeMs;
      
      // ファイルが更新されていれば再読み込み
      if (fileModifiedTime > this.lastModifiedTime) {
        logger.debug('設定ファイルが更新されたため再読み込みします');
        await this.loadSettings();
      }
    } catch (error) {
      logger.warn('設定ファイルの状態確認に失敗しました', { error: (error as Error).message });
    }
  }

  /**
   * 設定ディレクトリが存在することを確認し、なければ作成する
   */
  private async ensureSettingsDir(): Promise<void> {
    try {
      await fs.access(this.settingsDir);
    } catch (error) {
      logger.info(`設定ディレクトリを作成します: ${this.settingsDir}`);
      await fs.mkdir(this.settingsDir, { recursive: true });
    }
  }

  /**
   * 設定ファイルのフルパスを取得する
   * @returns 設定ファイルのフルパス
   */
  private getSettingsFilePath(): string {
    return path.join(this.settingsDir, this.settingsFile);
  }

  /**
   * 設定ファイルからデータを読み込む
   */
  private async loadSettings(): Promise<void> {
    const filePath = this.getSettingsFilePath();
    
    try {
      await fs.access(filePath);
      const data = await fs.readFile(filePath, 'utf8');
      const parsedData = JSON.parse(data);
      
      // スキーマ検証を行い、不足しているフィールドはデフォルト値で補完
      this.settings = AppSettingsSchema.parse({
        ...defaultSettings,
        ...parsedData
      });
      
      try {
        // ファイルの最終更新時刻を取得
        const stats = await fs.stat(filePath);
        this.lastModifiedTime = stats.mtimeMs;
      } catch (error) {
        // ファイルの状態取得に失敗した場合は警告を出すだけ
        logger.warn('ファイルの状態取得に失敗しました', { error: (error as Error).message });
      }
      
      logger.info('設定を読み込みました', { currentTaskFile: this.settings.storage.currentTaskFile });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.info('設定ファイルが存在しないため、デフォルト設定を使用します');
        this.settings = { ...defaultSettings };
        await this.saveSettings();
      } else {
        logger.error('設定ファイルの読み込みに失敗しました', { error: (error as Error).message });
        throw error;
      }
    }
  }

  /**
   * 設定をファイルに保存する
   */
  private async saveSettings(): Promise<void> {
    await this.ensureSettingsDir();
    const filePath = this.getSettingsFilePath();
    
    try {
      await fs.writeFile(filePath, JSON.stringify(this.settings, null, 2), 'utf8');
      
      try {
        // 保存後に最終更新時刻を更新
        const stats = await fs.stat(filePath);
        this.lastModifiedTime = stats.mtimeMs;
      } catch (error) {
        // ファイルの状態取得に失敗した場合は警告を出すだけ
        logger.warn('ファイルの状態取得に失敗しました', { error: (error as Error).message });
      }
      
      logger.debug('設定を保存しました');
    } catch (error) {
      logger.error('設定の保存に失敗しました', { error: (error as Error).message });
      throw new Error(`設定の保存に失敗しました: ${(error as Error).message}`);
    }
  }

  /**
   * 現在の設定を取得する
   * @returns 現在の設定
   */
  async getSettings(): Promise<AppSettings> {
    await this.ensureLatestSettings();
    return { ...this.settings };
  }

  /**
   * 設定を更新する
   * @param updateData 更新するデータ
   * @returns 更新後の設定
   */
  async updateSettings(updateData: UpdateSettingsInput): Promise<AppSettings> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // 深いマージを行う
    if (updateData.storage) {
      this.settings.storage = {
        ...this.settings.storage,
        ...updateData.storage
      };
    }
    
    if (updateData.app) {
      this.settings.app = {
        ...this.settings.app,
        ...updateData.app
      };
    }
    
    // スキーマ検証
    try {
      this.settings = AppSettingsSchema.parse(this.settings);
    } catch (error) {
      logger.error('設定の検証に失敗しました', { error: (error as Error).message });
      throw new Error(`設定の検証に失敗しました: ${(error as Error).message}`);
    }
    
    await this.saveSettings();
    return { ...this.settings };
  }

  /**
   * 設定をデフォルトにリセットする
   * @returns リセット後の設定
   */
  async resetSettings(): Promise<AppSettings> {
    this.settings = { ...defaultSettings };
    await this.saveSettings();
    return { ...this.settings };
  }

  /**
   * 最近使用したタスクファイルのリストに追加する
   * @param filename タスクファイル名
   */
  async addRecentTaskFile(filename: string): Promise<void> {
    await this.ensureLatestSettings();
    
    // 既に存在する場合は削除して先頭に追加
    const recentFiles = this.settings.storage.recentTaskFiles.filter(f => f !== filename);
    recentFiles.unshift(filename);
    
    // 最大10件まで保持
    this.settings.storage.recentTaskFiles = recentFiles.slice(0, 10);
    
    await this.saveSettings();
  }

  /**
   * 現在のタスクファイルを設定する
   * @param filename タスクファイル名
   */
  async setCurrentTaskFile(filename: string): Promise<void> {
    await this.ensureLatestSettings();
    
    logger.info(`タスクファイルを変更します: ${this.settings.storage.currentTaskFile} -> ${filename}`);
    this.settings.storage.currentTaskFile = filename;
    await this.addRecentTaskFile(filename);
    await this.saveSettings();
  }

  /**
   * 現在のデータディレクトリを取得する
   * @returns データディレクトリのパス
   */
  async getDataDir(): Promise<string> {
    await this.ensureLatestSettings();
    return this.settings.storage.dataDir;
  }

  /**
   * データディレクトリを設定する
   * @param dirPath データディレクトリのパス
   */
  async setDataDir(dirPath: string): Promise<void> {
    await this.ensureLatestSettings();
    
    // パスの正規化
    const normalizedPath = path.normalize(dirPath);
    
    // ディレクトリの存在確認
    try {
      await fs.access(normalizedPath);
    } catch (error) {
      // ディレクトリが存在しない場合は作成
      try {
        await fs.mkdir(normalizedPath, { recursive: true });
      } catch (mkdirError) {
        logger.error('データディレクトリの作成に失敗しました', { error: (mkdirError as Error).message });
        throw new Error(`データディレクトリの作成に失敗しました: ${(mkdirError as Error).message}`);
      }
    }
    
    this.settings.storage.dataDir = normalizedPath;
    await this.saveSettings();
  }

  /**
   * 現在のタスクファイル名を取得する（常に最新の設定を返す）
   * @returns タスクファイル名
   */
  async getCurrentTaskFile(): Promise<string> {
    await this.ensureLatestSettings();
    logger.debug(`現在のタスクファイル: ${this.settings.storage.currentTaskFile}`);
    return this.settings.storage.currentTaskFile;
  }

  /**
   * 最近使用したタスクファイルのリストを取得する
   * @returns タスクファイル名のリスト
   */
  async getRecentTaskFiles(): Promise<string[]> {
    await this.ensureLatestSettings();
    return [...this.settings.storage.recentTaskFiles];
  }
}
