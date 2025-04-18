import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// テスト用のデータディレクトリ
const TEST_DATA_DIR = path.join(__dirname, '../../../test-data');

// 環境変数のモック
vi.mock('../../../src/config/env.js', () => ({
  env: {
    DATA_DIR: TEST_DATA_DIR,
    NODE_ENV: 'test',
    LOG_LEVEL: 'error',
    PORT: '3001',
  },
}));

// ロガーのモック
vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

// FileServiceのインポートはモックの後に行う
import { FileService } from '../../../src/services/file.service.js';

describe('FileService', () => {
  let fileService: FileService;
  
  beforeEach(async () => {
    // テスト用ディレクトリの作成
    try {
      await fs.mkdir(TEST_DATA_DIR, { recursive: true });
    } catch (error) {
      // ディレクトリが既に存在する場合は無視
    }
    
    fileService = new FileService();
  });
  
  afterEach(async () => {
    // テスト用ディレクトリの削除
    try {
      await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
    } catch (error) {
      console.error('テストディレクトリの削除に失敗しました', error);
    }
  });
  
  it('ファイルが存在しない場合はデフォルト値を返すべき', async () => {
    const defaultData = { test: 'data' };
    const result = await fileService.readFile('non-existent.json', defaultData);
    expect(result).toEqual(defaultData);
  });
  
  it('ファイルの書き込みと読み込みが正しく動作するべき', async () => {
    const testData = { test: 'write and read' };
    const filename = 'test-file.json';
    
    await fileService.writeFile(filename, testData);
    const result = await fileService.readFile(filename, {});
    
    expect(result).toEqual(testData);
  });
  
  it('ファイルの上書きが正しく動作するべき', async () => {
    const initialData = { test: 'initial' };
    const updatedData = { test: 'updated' };
    const filename = 'update-test.json';
    
    await fileService.writeFile(filename, initialData);
    await fileService.writeFile(filename, updatedData);
    const result = await fileService.readFile(filename, {});
    
    expect(result).toEqual(updatedData);
  });
  
  it('バックアップファイルが作成されるべき', async () => {
    const initialData = { test: 'backup test' };
    const filename = 'backup-test.json';
    const filePath = path.join(TEST_DATA_DIR, filename);
    const backupPath = `${filePath}.backup`;
    
    await fileService.writeFile(filename, initialData);
    await fileService.writeFile(filename, { test: 'updated' });
    
    // バックアップファイルが存在するか確認
    const backupExists = await fs.access(backupPath).then(() => true).catch(() => false);
    expect(backupExists).toBe(true);
    
    // バックアップファイルの内容を確認
    const backupContent = JSON.parse(await fs.readFile(backupPath, 'utf-8'));
    expect(backupContent).toEqual(initialData);
  });
  
  it('無効なJSONを読み込もうとするとエラーを投げるべき', async () => {
    const filename = 'invalid.json';
    const filePath = path.join(TEST_DATA_DIR, filename);
    
    // 無効なJSONを書き込む
    await fs.writeFile(filePath, 'not a valid json', 'utf-8');
    
    await expect(fileService.readFile(filename, {})).rejects.toThrow();
  });
});
