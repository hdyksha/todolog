/**
 * テスト環境のセットアップファイル
 * このファイルはテスト実行前に自動的に読み込まれます
 */

import path from 'path';
import os from 'os';
import fs from 'fs/promises';

// テスト用の一時ディレクトリを作成
const testSettingsDir = path.join(os.tmpdir(), `todolog-test-${Date.now()}`);

// 元の環境変数を保存
const originalSettingsDir = process.env.SETTINGS_DIR;
const originalSettingsFile = process.env.SETTINGS_FILE;

// テスト用の環境変数を設定
process.env.SETTINGS_DIR = testSettingsDir;
process.env.NODE_ENV = 'test';

// テスト終了時のクリーンアップ
beforeAll(async () => {
  // テスト用ディレクトリを作成
  await fs.mkdir(testSettingsDir, { recursive: true });
  console.log(`テスト用設定ディレクトリを作成しました: ${testSettingsDir}`);
});

afterAll(async () => {
  try {
    // テスト用ディレクトリを削除
    await fs.rm(testSettingsDir, { recursive: true, force: true });
    console.log(`テスト用設定ディレクトリを削除しました: ${testSettingsDir}`);
  } catch (error) {
    console.error('テスト用ディレクトリの削除に失敗しました:', error);
  }
  
  // 環境変数を元に戻す
  if (originalSettingsDir) {
    process.env.SETTINGS_DIR = originalSettingsDir;
  } else {
    delete process.env.SETTINGS_DIR;
  }
  
  if (originalSettingsFile) {
    process.env.SETTINGS_FILE = originalSettingsFile;
  } else {
    delete process.env.SETTINGS_FILE;
  }
});
