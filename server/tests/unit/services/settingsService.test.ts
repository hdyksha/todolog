import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { SettingsService } from '../../../src/services/settingsService.js';
import { defaultSettings } from '../../../src/models/settings.model.js';

// モックの設定
vi.mock('fs/promises');
vi.mock('os', () => ({
  homedir: vi.fn(() => '/mock-home')
}));

describe('SettingsService', () => {
  const mockSettingsDir = '/mock-home/.todolog';
  const mockSettingsFile = 'settings.json';
  const mockSettingsPath = path.join(mockSettingsDir, mockSettingsFile);
  
  let settingsService: SettingsService;
  
  beforeEach(() => {
    // モックをリセット
    vi.resetAllMocks();
    
    // SettingsServiceのインスタンスを作成
    settingsService = new SettingsService(mockSettingsDir, mockSettingsFile);
    
    // fs.accessのモック
    vi.mocked(fs.access).mockImplementation(async (path) => {
      if (path === mockSettingsDir || path === mockSettingsPath) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('ENOENT'));
    });
    
    // fs.readFileのモック
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(defaultSettings));
    
    // fs.writeFileのモック
    vi.mocked(fs.writeFile).mockResolvedValue();
    
    // fs.mkdirのモック
    vi.mocked(fs.mkdir).mockResolvedValue();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  describe('initialize', () => {
    it('設定ディレクトリが存在する場合、設定を読み込む', async () => {
      await settingsService.initialize();
      
      expect(fs.access).toHaveBeenCalledWith(mockSettingsDir);
      expect(fs.access).toHaveBeenCalledWith(mockSettingsPath);
      expect(fs.readFile).toHaveBeenCalledWith(mockSettingsPath, 'utf8');
    });
    
    it('設定ディレクトリが存在しない場合、ディレクトリを作成して設定を保存する', async () => {
      // ディレクトリが存在しないケース
      vi.mocked(fs.access).mockImplementation(async (path) => {
        return Promise.reject({ code: 'ENOENT' });
      });
      
      // 初期化後は設定が読み込まれていることを確認
      await settingsService.initialize();
      const settings = await settingsService.getSettings();
      
      expect(fs.mkdir).toHaveBeenCalledWith(mockSettingsDir, { recursive: true });
      expect(settings).toEqual(defaultSettings);
    });
    
    it('設定ファイルが存在しない場合、デフォルト設定を保存する', async () => {
      // ディレクトリは存在するが、ファイルは存在しないケース
      vi.mocked(fs.access).mockImplementation(async (path) => {
        if (path === mockSettingsDir) {
          return Promise.resolve();
        }
        return Promise.reject({ code: 'ENOENT' });
      });
      
      // 初期化後は設定が読み込まれていることを確認
      await settingsService.initialize();
      const settings = await settingsService.getSettings();
      
      expect(settings).toEqual(defaultSettings);
    });
  });
  
  describe('getSettings', () => {
    it('初期化されていない場合、自動的に初期化して設定を返す', async () => {
      const settings = await settingsService.getSettings();
      
      expect(settings).toEqual(defaultSettings);
      expect(fs.access).toHaveBeenCalled();
      expect(fs.readFile).toHaveBeenCalled();
    });
    
    it('初期化済みの場合、設定を返す', async () => {
      await settingsService.initialize();
      vi.clearAllMocks(); // モックをクリア
      
      const settings = await settingsService.getSettings();
      
      expect(settings).toEqual(defaultSettings);
      expect(fs.access).not.toHaveBeenCalled(); // 再度アクセスしないこと
      expect(fs.readFile).not.toHaveBeenCalled(); // 再度読み込まないこと
    });
  });
  
  describe('updateSettings', () => {
    it('設定を更新して保存する', async () => {
      const updateData = {
        storage: {
          dataDir: '/new-data-dir'
        },
        app: {
          maxTasksPerPage: 100
        }
      };
      
      const updatedSettings = await settingsService.updateSettings(updateData);
      
      expect(updatedSettings.storage.dataDir).toBe('/new-data-dir');
      expect(updatedSettings.app.maxTasksPerPage).toBe(100);
      expect(fs.writeFile).toHaveBeenCalled();
    });
    
    it('部分的な更新を行う', async () => {
      const updateData = {
        app: {
          maxTasksPerPage: 100
        }
      };
      
      const updatedSettings = await settingsService.updateSettings(updateData);
      
      expect(updatedSettings.storage.dataDir).toBe(defaultSettings.storage.dataDir); // 変更なし
      expect(updatedSettings.app.maxTasksPerPage).toBe(100); // 更新
      expect(fs.writeFile).toHaveBeenCalled();
    });
  });
  
  describe('resetSettings', () => {
    it('設定をデフォルトにリセットする', async () => {
      // まず設定を更新
      await settingsService.updateSettings({
        storage: { dataDir: '/custom-dir' },
        app: { maxTasksPerPage: 100 }
      });
      
      // リセット
      const resetSettings = await settingsService.resetSettings();
      
      expect(resetSettings).toEqual(defaultSettings);
      expect(fs.writeFile).toHaveBeenCalledTimes(2); // 更新とリセットで2回
    });
  });
  
  describe('データディレクトリとタスクファイル管理', () => {
    it('データディレクトリを設定する', async () => {
      const newDir = '/new-data-dir';
      await settingsService.setDataDir(newDir);
      
      const settings = await settingsService.getSettings();
      expect(settings.storage.dataDir).toBe(newDir);
      expect(fs.writeFile).toHaveBeenCalled();
    });
    
    it('データディレクトリが存在しない場合、作成する', async () => {
      vi.mocked(fs.access).mockImplementation(async (path) => {
        if (path === mockSettingsDir || path === mockSettingsPath) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('ENOENT'));
      });
      
      const newDir = '/non-existent-dir';
      await settingsService.setDataDir(newDir);
      
      expect(fs.mkdir).toHaveBeenCalledWith(newDir, { recursive: true });
    });
    
    it('現在のタスクファイルを設定する', async () => {
      const newFile = 'new-tasks.json';
      await settingsService.setCurrentTaskFile(newFile);
      
      const currentFile = await settingsService.getCurrentTaskFile();
      expect(currentFile).toBe(newFile);
      
      const recentFiles = await settingsService.getRecentTaskFiles();
      expect(recentFiles[0]).toBe(newFile);
    });
    
    it('最近使用したタスクファイルを管理する', async () => {
      await settingsService.addRecentTaskFile('file1.json');
      await settingsService.addRecentTaskFile('file2.json');
      await settingsService.addRecentTaskFile('file1.json'); // 重複
      
      const recentFiles = await settingsService.getRecentTaskFiles();
      expect(recentFiles[0]).toBe('file1.json'); // 最新
      expect(recentFiles[1]).toBe('file2.json');
      expect(recentFiles.length).toBe(2); // 重複は除去
    });
  });
});
