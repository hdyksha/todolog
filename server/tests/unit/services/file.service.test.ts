import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FileService } from '../../../src/services/fileService.js';

// fsのモック
vi.mock('fs/promises', () => {
  return {
    default: {
      access: vi.fn(),
      readFile: vi.fn(),
      writeFile: vi.fn(),
      mkdir: vi.fn(),
      copyFile: vi.fn(),
      readdir: vi.fn(),
    },
    access: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    copyFile: vi.fn(),
    readdir: vi.fn(),
  };
});

// pathのモック
vi.mock('path', () => {
  return {
    default: {
      join: (...args: string[]) => args.join('/'),
    },
    join: (...args: string[]) => args.join('/'),
  };
});

// loggerのモック
vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

// 実際のモジュールをインポート
import fs from 'fs/promises';
import path from 'path';

describe('FileService', () => {
  let fileService: FileService;
  const testDataDir = './test-data';
  
  beforeEach(() => {
    vi.clearAllMocks();
    fileService = new FileService(testDataDir);
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  describe('readFile', () => {
    it('ファイルが存在する場合はデータを返すべき', async () => {
      const mockData = { test: 'data' };
      const mockJsonString = JSON.stringify(mockData);
      
      (fs.access as any).mockResolvedValue(undefined);
      (fs.readFile as any).mockResolvedValue(mockJsonString);
      
      const result = await fileService.readFile('test.json', null);
      
      expect(fs.readFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'test.json'),
        'utf8'
      );
      expect(result).toEqual(mockData);
    });
    
    it('ファイルが存在しない場合はデフォルト値を返すべき', async () => {
      const defaultValue = { default: 'value' };
      const error = new Error('File not found');
      (error as any).code = 'ENOENT';
      
      (fs.access as any).mockResolvedValue(undefined);
      (fs.readFile as any).mockRejectedValue(error);
      
      const result = await fileService.readFile('non-existent.json', defaultValue);
      
      expect(result).toEqual(defaultValue);
    });
    
    it('その他のエラーの場合は例外をスローするべき', async () => {
      const error = new Error('Some other error');
      
      (fs.access as any).mockResolvedValue(undefined);
      (fs.readFile as any).mockRejectedValue(error);
      
      await expect(fileService.readFile('test.json', null)).rejects.toThrow();
    });
  });
  
  describe('writeFile', () => {
    it('データをファイルに書き込むべき', async () => {
      const data = { test: 'data' };
      
      (fs.access as any).mockResolvedValue(undefined);
      (fs.writeFile as any).mockResolvedValue(undefined);
      
      await fileService.writeFile('test.json', data);
      
      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'test.json'),
        JSON.stringify(data, null, 2),
        'utf8'
      );
    });
    
    it('エラーが発生した場合は例外をスローするべき', async () => {
      const data = { test: 'data' };
      const error = new Error('Write error');
      
      (fs.access as any).mockResolvedValue(undefined);
      (fs.writeFile as any).mockRejectedValue(error);
      
      await expect(fileService.writeFile('test.json', data)).rejects.toThrow();
    });
  });
  
  describe('createBackup', () => {
    it('バックアップファイルを作成するべき', async () => {
      const filename = 'test.json';
      
      // 日付のモック
      const mockDate = new Date('2025-01-01T00:00:00Z');
      const spy = vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      
      (fs.access as any).mockResolvedValue(undefined);
      (fs.copyFile as any).mockResolvedValue(undefined);
      
      const result = await fileService.createBackup(filename);
      
      expect(fs.copyFile).toHaveBeenCalled();
      expect(result).toContain('test.json.2025-01-01T00-00-00');
      
      spy.mockRestore();
    });
    
    it('ソースファイルが存在しない場合は例外をスローするべき', async () => {
      const error = new Error('File not found');
      (error as any).code = 'ENOENT';
      
      (fs.access as any).mockRejectedValue(error);
      
      await expect(fileService.createBackup('non-existent.json')).rejects.toThrow();
    });
  });
  
  describe('listBackups', () => {
    it('バックアップファイルの一覧を返すべき', async () => {
      const files = [
        'test.json',
        'test.json.2025-01-01T00-00-00.bak',
        'test.json.2025-01-02T00-00-00.bak',
        'other.json',
      ];
      
      (fs.access as any).mockResolvedValue(undefined);
      (fs.readdir as any).mockResolvedValue(files);
      
      const result = await fileService.listBackups('test.json');
      
      expect(result).toHaveLength(2);
      expect(result).toContain('test.json.2025-01-01T00-00-00.bak');
      expect(result).toContain('test.json.2025-01-02T00-00-00.bak');
      expect(result).not.toContain('test.json');
      expect(result).not.toContain('other.json');
    });
  });
});
