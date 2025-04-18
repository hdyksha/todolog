import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Task } from '../types/index.js';

// ESM環境でのディレクトリ名取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// データファイルの名前
const DATA_FILE = 'todolog-data.json';

// データディレクトリのパス
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

// データファイルのパス
const DATA_PATH = path.join(DATA_DIR, DATA_FILE);

/**
 * ファイル操作に関するサービスクラス
 */
export class FileService {
  /**
   * コンストラクタ
   * データディレクトリを初期化する
   */
  constructor() {
    this.initDataDir();
  }

  /**
   * データディレクトリを初期化する
   */
  private async initDataDir(): Promise<void> {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      console.log(`データディレクトリを初期化しました: ${DATA_DIR}`);
    } catch (error) {
      console.error('データディレクトリの初期化に失敗しました:', error);
    }
  }

  /**
   * タスクデータを読み込む
   * @returns タスクの配列
   */
  async readTasks(): Promise<Task[]> {
    try {
      const data = await fs.readFile(DATA_PATH, 'utf-8');
      return JSON.parse(data) as Task[];
    } catch (error) {
      // ファイルが存在しない場合は空の配列を返す
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      console.error('データの読み込みに失敗しました:', error);
      throw error;
    }
  }

  /**
   * タスクデータを保存する
   * @param tasks 保存するタスクの配列
   */
  async writeTasks(tasks: Task[]): Promise<void> {
    try {
      await fs.writeFile(DATA_PATH, JSON.stringify(tasks, null, 2), 'utf-8');
    } catch (error) {
      console.error('データの保存に失敗しました:', error);
      throw error;
    }
  }

  /**
   * タスクデータをエクスポートする
   * @param exportPath エクスポート先のファイルパス
   */
  async exportTasks(exportPath: string): Promise<void> {
    try {
      const tasks = await this.readTasks();
      await fs.writeFile(exportPath, JSON.stringify(tasks, null, 2), 'utf-8');
    } catch (error) {
      console.error('データのエクスポートに失敗しました:', error);
      throw error;
    }
  }

  /**
   * タスクデータをインポートする
   * @param importPath インポート元のファイルパス
   * @returns インポートしたタスクの配列
   */
  async importTasks(importPath: string): Promise<Task[]> {
    try {
      const data = await fs.readFile(importPath, 'utf-8');
      const tasks = JSON.parse(data) as Task[];
      await this.writeTasks(tasks);
      return tasks;
    } catch (error) {
      console.error('データのインポートに失敗しました:', error);
      throw error;
    }
  }
}
