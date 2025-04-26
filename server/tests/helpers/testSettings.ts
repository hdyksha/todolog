import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { resetServices, initializeServices } from '../../src/services/serviceContainer.js';

/**
 * テスト用の一時設定ディレクトリを設定する
 */
export async function setupTestSettings() {
  // 元の環境変数を保存
  const originalSettingsDir = process.env.SETTINGS_DIR;
  const originalSettingsFile = process.env.SETTINGS_FILE;
  
  // テスト用の一時ディレクトリを作成
  const testSettingsDir = path.join(os.tmpdir(), `todolog-test-${Date.now()}`);
  await fs.mkdir(testSettingsDir, { recursive: true });
  
  // 環境変数を設定
  process.env.SETTINGS_DIR = testSettingsDir;
  
  // サービスをリセットして再初期化
  resetServices();
  initializeServices({
    settingsDir: testSettingsDir
  });
  
  return {
    settingsDir: testSettingsDir,
    cleanup: async () => {
      try {
        // テスト用ディレクトリを削除
        await fs.rm(testSettingsDir, { recursive: true, force: true });
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
      
      // サービスをリセット
      resetServices();
    }
  };
}
