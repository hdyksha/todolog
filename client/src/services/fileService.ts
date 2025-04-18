// fileService.ts
// ファイル操作に関するサービス

// Node.jsのファイルシステムAPIをインポート
// このサービスはElectronやNode.js環境で実行することを前提としています
import { promises as fs } from 'fs';
import path from 'path';

// データファイルの名前
const DATA_FILE = 'todolog-data.json';

// データファイルのパス（ユーザーのホームディレクトリを基準）
const DATA_PATH = path.join(process.env.HOME || process.env.USERPROFILE || '.', DATA_FILE);

/**
 * データをJSONファイルに保存する
 * @param data 保存するデータ
 */
export async function saveData<T>(data: T): Promise<void> {
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('データの保存に失敗しました:', error);
    throw error;
  }
}

/**
 * JSONファイルからデータを読み込む
 * @returns 読み込んだデータ、ファイルが存在しない場合はnull
 */
export async function loadData<T>(): Promise<T | null> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error) {
    // ファイルが存在しない場合は null を返す
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    console.error('データの読み込みに失敗しました:', error);
    throw error;
  }
}

/**
 * データを指定したファイルにエクスポートする
 * @param filePath エクスポート先のファイルパス
 * @param data エクスポートするデータ
 */
export async function exportData(filePath: string, data: unknown): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('データのエクスポートに失敗しました:', error);
    throw error;
  }
}

/**
 * 指定したファイルからデータをインポートする
 * @param filePath インポート元のファイルパス
 * @returns インポートしたデータ
 */
export async function importData<T>(filePath: string): Promise<T> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('データのインポートに失敗しました:', error);
    throw error;
  }
}
