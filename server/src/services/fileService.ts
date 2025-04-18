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
}
