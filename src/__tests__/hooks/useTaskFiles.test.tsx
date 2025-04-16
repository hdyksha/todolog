import { renderHook, act } from '@testing-library/react';
import { useTaskFiles } from '../../hooks/useTaskFiles';
import { ErrorProvider } from '../../contexts/ErrorContext';
import { apiService } from '../../services/ApiService';
import React from 'react';

// APIサービスのモック
jest.mock('../../services/ApiService', () => ({
  apiService: {
    getTaskFiles: jest.fn(),
    createTaskFile: jest.fn(),
    deleteTaskFile: jest.fn(),
  },
}));

// window.confirm のモック
global.confirm = jest.fn();

describe('useTaskFiles hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.confirm as jest.Mock).mockReturnValue(true);
  });

  test('初期状態が正しい', () => {
    const wrapper = ({ children }) => <ErrorProvider>{children}</ErrorProvider>;
    const { result } = renderHook(() => useTaskFiles(), { wrapper });

    expect(result.current.taskFiles).toEqual([]);
    expect(result.current.currentFile).toBe('');
    expect(result.current.newFileName).toBe('');
    expect(result.current.fileLoading).toBe(false);
  });

  test('ファイル一覧を読み込める', async () => {
    const mockFiles = [
      { name: 'file1.json', path: '/path/to/file1.json', lastModified: new Date().toISOString() },
      { name: 'file2.json', path: '/path/to/file2.json', lastModified: new Date().toISOString() },
    ];
    
    apiService.getTaskFiles.mockResolvedValue(mockFiles);

    const wrapper = ({ children }) => <ErrorProvider>{children}</ErrorProvider>;
    const { result } = renderHook(() => useTaskFiles(), { wrapper });

    await act(async () => {
      await result.current.loadTaskFiles();
    });

    expect(result.current.taskFiles).toEqual(mockFiles);
    expect(result.current.currentFile).toBe(mockFiles[0].name);
    expect(apiService.getTaskFiles).toHaveBeenCalled();
  });

  test('新しいファイルを作成できる', async () => {
    const mockFile = { name: 'newfile.json', path: '/path/to/newfile.json', lastModified: new Date().toISOString() };
    
    apiService.createTaskFile.mockResolvedValue(mockFile);
    apiService.getTaskFiles.mockResolvedValue([mockFile]);

    const wrapper = ({ children }) => <ErrorProvider>{children}</ErrorProvider>;
    const { result } = renderHook(() => useTaskFiles(), { wrapper });

    act(() => {
      result.current.setNewFileName('newfile');
    });

    await act(async () => {
      await result.current.createNewFile();
    });

    expect(apiService.createTaskFile).toHaveBeenCalledWith('newfile.json');
    expect(apiService.getTaskFiles).toHaveBeenCalled();
    expect(result.current.currentFile).toBe('newfile.json');
    expect(result.current.newFileName).toBe('');
  });

  test('ファイル名が空の場合は新しいファイルを作成しない', async () => {
    const wrapper = ({ children }) => <ErrorProvider>{children}</ErrorProvider>;
    const { result } = renderHook(() => useTaskFiles(), { wrapper });

    act(() => {
      result.current.setNewFileName('');
    });

    await act(async () => {
      await result.current.createNewFile();
    });

    expect(apiService.createTaskFile).not.toHaveBeenCalled();
  });

  test('ファイルを削除できる', async () => {
    const mockFiles = [
      { name: 'file1.json', path: '/path/to/file1.json', lastModified: new Date().toISOString() },
      { name: 'file2.json', path: '/path/to/file2.json', lastModified: new Date().toISOString() },
    ];
    
    apiService.getTaskFiles.mockResolvedValue(mockFiles);
    apiService.deleteTaskFile.mockResolvedValue(true);

    const wrapper = ({ children }) => <ErrorProvider>{children}</ErrorProvider>;
    const { result } = renderHook(() => useTaskFiles(), { wrapper });

    await act(async () => {
      await result.current.loadTaskFiles();
    });

    expect(result.current.currentFile).toBe('file1.json');

    // file1.json を削除
    await act(async () => {
      await result.current.deleteFile('file1.json');
    });

    expect(apiService.deleteTaskFile).toHaveBeenCalledWith('file1.json');
    expect(global.confirm).toHaveBeenCalled();
  });

  test('削除をキャンセルするとファイルは削除されない', async () => {
    const mockFiles = [
      { name: 'file1.json', path: '/path/to/file1.json', lastModified: new Date().toISOString() },
    ];
    
    apiService.getTaskFiles.mockResolvedValue(mockFiles);
    (global.confirm as jest.Mock).mockReturnValue(false);

    const wrapper = ({ children }) => <ErrorProvider>{children}</ErrorProvider>;
    const { result } = renderHook(() => useTaskFiles(), { wrapper });

    await act(async () => {
      await result.current.loadTaskFiles();
    });

    await act(async () => {
      await result.current.deleteFile('file1.json');
    });

    expect(apiService.deleteTaskFile).not.toHaveBeenCalled();
  });

  test('カレントファイルを設定できる', () => {
    const wrapper = ({ children }) => <ErrorProvider>{children}</ErrorProvider>;
    const { result } = renderHook(() => useTaskFiles(), { wrapper });

    act(() => {
      result.current.setCurrentFile('file1.json');
    });

    expect(result.current.currentFile).toBe('file1.json');
  });
});
