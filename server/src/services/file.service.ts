import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

// ESM環境でのディレクトリ名取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FileService {
  private dataDir: string;

  constructor() {
    this.dataDir = env.DATA_DIR;
    this.ensureDataDirectory();
  }

  // データディレクトリの存在確認と作成
  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.access(this.dataDir);
      logger.info(`データディレクトリが存在します: ${this.dataDir}`);
    } catch (error) {
      logger.info(`データディレクトリが存在しないため作成します: ${this.dataDir}`);
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  // ファイルの読み込み
  async readFile<T>(filename: string, defaultValue: T): Promise<T> {
    const filePath = path.join(this.dataDir, filename);
    
    try {
      await fs.access(filePath);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.info(`ファイルが存在しないため、デフォルト値を使用します: ${filename}`);
        await this.writeFile(filename, defaultValue);
        return defaultValue;
      }
      
      logger.error(`ファイル読み込みエラー: ${filename}`, error);
      throw new Error(`ファイル読み込みエラー: ${filename}`);
    }
  }

  // ファイルの書き込み
  async writeFile<T>(filename: string, data: T): Promise<void> {
    const filePath = path.join(this.dataDir, filename);
    
    try {
      // バックアップの作成（既存ファイルの場合）
      try {
        await fs.access(filePath);
        const backupPath = `${filePath}.backup`;
        await fs.copyFile(filePath, backupPath);
        logger.debug(`バックアップファイルを作成しました: ${backupPath}`);
      } catch (error) {
        // ファイルが存在しない場合は何もしない
      }
      
      // ファイルの書き込み
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      logger.debug(`ファイルを保存しました: ${filename}`);
    } catch (error) {
      logger.error(`ファイル書き込みエラー: ${filename}`, error);
      throw new Error(`ファイル書き込みエラー: ${filename}`);
    }
  }
}
