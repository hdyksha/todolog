import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

/**
 * ファイル操作を担当するサービスクラス
 */
export class FileService {
  private dataDir: string;

  /**
   * FileServiceのコンストラクタ
   * @param dataDir データディレクトリのパス（デフォルトは環境変数またはdata/）
   */
  constructor(dataDir?: string) {
    this.dataDir = dataDir || process.env.DATA_DIR || './data';
    this.ensureDataDir().catch(err => {
      logger.error('データディレクトリの作成に失敗しました', { error: err.message });
    });
  }

  /**
   * データディレクトリを設定する
   * @param dirPath 新しいデータディレクトリのパス
   */
  async setDataDir(dirPath: string): Promise<void> {
    this.dataDir = dirPath;
    await this.ensureDataDir();
    logger.info(`データディレクトリを変更しました: ${dirPath}`);
  }

  /**
   * 現在のデータディレクトリを取得する
   * @returns データディレクトリのパス
   */
  getDataDir(): string {
    return this.dataDir;
  }

  /**
   * データディレクトリが存在することを確認し、なければ作成する
   */
  private async ensureDataDir(): Promise<void> {
    try {
      await fs.access(this.dataDir);
    } catch (error) {
      logger.info(`データディレクトリを作成します: ${this.dataDir}`);
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  /**
   * ファイルからデータを読み込む
   * @param filename ファイル名
   * @param defaultValue ファイルが存在しない場合のデフォルト値
   * @returns 読み込んだデータ
   */
  async readFile<T>(filename: string, defaultValue: T): Promise<T> {
    await this.ensureDataDir();
    const filePath = path.join(this.dataDir, filename);
    
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.info(`ファイルが存在しないためデフォルト値を返します: ${filename}`);
        return defaultValue;
      }
      logger.error(`ファイルの読み込みに失敗しました: ${filename}`, { error: (error as Error).message });
      throw new Error(`ファイルの読み込みに失敗しました: ${(error as Error).message}`);
    }
  }

  /**
   * データをファイルに書き込む
   * @param filename ファイル名
   * @param data 書き込むデータ
   */
  async writeFile<T>(filename: string, data: T): Promise<void> {
    await this.ensureDataDir();
    const filePath = path.join(this.dataDir, filename);
    
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      logger.debug(`ファイルに書き込みました: ${filename}`);
    } catch (error) {
      logger.error(`ファイルの書き込みに失敗しました: ${filename}`, { error: (error as Error).message });
      throw new Error(`ファイルの書き込みに失敗しました: ${(error as Error).message}`);
    }
  }

  /**
   * データのバックアップを作成する
   * @param filename バックアップするファイル名
   */
  async createBackup(filename: string): Promise<string> {
    await this.ensureDataDir();
    const sourceFilePath = path.join(this.dataDir, filename);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `${filename}.${timestamp}.bak`;
    const backupFilePath = path.join(this.dataDir, backupFilename);
    
    try {
      // ソースファイルが存在するか確認
      await fs.access(sourceFilePath);
      
      // バックアップを作成
      await fs.copyFile(sourceFilePath, backupFilePath);
      logger.info(`バックアップを作成しました: ${backupFilename}`);
      
      return backupFilename;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.warn(`バックアップ対象のファイルが存在しません: ${filename}`);
        throw new Error(`バックアップ対象のファイルが存在しません: ${filename}`);
      }
      logger.error(`バックアップの作成に失敗しました: ${filename}`, { error: (error as Error).message });
      throw new Error(`バックアップの作成に失敗しました: ${(error as Error).message}`);
    }
  }

  /**
   * バックアップからデータを復元する
   * @param backupFilename バックアップファイル名
   * @param targetFilename 復元先のファイル名
   */
  async restoreFromBackup(backupFilename: string, targetFilename: string): Promise<void> {
    await this.ensureDataDir();
    const backupFilePath = path.join(this.dataDir, backupFilename);
    const targetFilePath = path.join(this.dataDir, targetFilename);
    
    try {
      // バックアップファイルが存在するか確認
      await fs.access(backupFilePath);
      
      // 復元先にコピー
      await fs.copyFile(backupFilePath, targetFilePath);
      logger.info(`バックアップから復元しました: ${backupFilename} -> ${targetFilename}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.warn(`バックアップファイルが存在しません: ${backupFilename}`);
        throw new Error(`バックアップファイルが存在しません: ${backupFilename}`);
      }
      logger.error(`バックアップからの復元に失敗しました`, { error: (error as Error).message });
      throw new Error(`バックアップからの復元に失敗しました: ${(error as Error).message}`);
    }
  }

  /**
   * 利用可能なバックアップファイルの一覧を取得する
   * @param baseFilename 元のファイル名
   */
  async listBackups(baseFilename: string): Promise<string[]> {
    await this.ensureDataDir();
    
    try {
      const files = await fs.readdir(this.dataDir);
      const backupPattern = new RegExp(`^${baseFilename}\\..*\\.bak$`);
      
      return files.filter(file => backupPattern.test(file));
    } catch (error) {
      logger.error(`バックアップ一覧の取得に失敗しました`, { error: (error as Error).message });
      throw new Error(`バックアップ一覧の取得に失敗しました: ${(error as Error).message}`);
    }
  }

  /**
   * ディレクトリ内のファイル一覧を取得する
   * @param extension 拡張子でフィルタリング（オプション）
   * @returns ファイル名の配列
   */
  async listFiles(extension?: string): Promise<string[]> {
    await this.ensureDataDir();
    
    try {
      const files = await fs.readdir(this.dataDir);
      
      if (extension) {
        return files.filter(file => file.endsWith(extension));
      }
      
      return files;
    } catch (error) {
      logger.error(`ファイル一覧の取得に失敗しました`, { error: (error as Error).message });
      throw new Error(`ファイル一覧の取得に失敗しました: ${(error as Error).message}`);
    }
  }
}
