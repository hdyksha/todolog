import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StorageSettings from './StorageSettings';
import { useServerSettings } from '../../contexts/ServerSettingsContext';
import { useTaskFiles } from '../../contexts/TaskFilesContext';
import { useNotification } from '../../contexts/NotificationContext';
import React from 'react';

// コンテキストのモック
vi.mock('../../contexts/ServerSettingsContext', () => ({
  useServerSettings: vi.fn(),
}));

vi.mock('../../contexts/TaskFilesContext', () => ({
  useTaskFiles: vi.fn(),
}));

vi.mock('../../contexts/NotificationContext', () => ({
  useNotification: vi.fn(),
}));

describe('StorageSettings', () => {
  const mockServerSettings = {
    storage: {
      dataDir: '/test/data',
      currentTaskFile: 'tasks.json',
      recentTaskFiles: ['tasks.json', 'work.json'],
    },
    app: {
      maxTasksPerPage: 50,
      maxBackups: 10,
    },
  };

  const mockSetDataDirectory = vi.fn();
  const mockCreateNewTaskFile = vi.fn();
  const mockRefreshFiles = vi.fn();
  const mockShowNotification = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    
    (useServerSettings as any).mockReturnValue({
      serverSettings: mockServerSettings,
      setDataDirectory: mockSetDataDirectory,
    });
    
    (useTaskFiles as any).mockReturnValue({
      createNewTaskFile: mockCreateNewTaskFile,
      refreshFiles: mockRefreshFiles,
    });
    
    (useNotification as any).mockReturnValue({
      showNotification: mockShowNotification,
    });
  });

  it('現在のデータディレクトリとタスクファイルを表示する', () => {
    render(<StorageSettings />);
    
    expect(screen.getByLabelText(/データディレクトリのパス/i)).toHaveValue('/test/data');
    expect(screen.getByText('tasks.json')).toBeInTheDocument();
  });

  it('データディレクトリを変更する', async () => {
    mockSetDataDirectory.mockResolvedValue(undefined);
    
    render(<StorageSettings />);
    
    // 入力を変更
    const input = screen.getByLabelText(/データディレクトリのパス/i);
    fireEvent.change(input, { target: { value: '/new/data/path' } });
    
    // 保存ボタンをクリック
    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);
    
    // APIが呼ばれたことを確認
    await waitFor(() => {
      expect(mockSetDataDirectory).toHaveBeenCalledWith('/new/data/path');
      expect(mockRefreshFiles).toHaveBeenCalled();
      expect(mockShowNotification).toHaveBeenCalledWith('データディレクトリを変更しました', 'success');
    });
  });

  it('新しいタスクファイルを作成する', async () => {
    mockCreateNewTaskFile.mockResolvedValue({ filename: 'new-file.json', message: 'ファイルが作成されました' });
    
    render(<StorageSettings />);
    
    // 入力を変更
    const input = screen.getByLabelText(/ファイル名/i);
    fireEvent.change(input, { target: { value: 'new-file' } });
    
    // 作成ボタンをクリック
    const createButton = screen.getByText('作成');
    fireEvent.click(createButton);
    
    // APIが呼ばれたことを確認
    await waitFor(() => {
      expect(mockCreateNewTaskFile).toHaveBeenCalledWith('new-file');
      expect(mockRefreshFiles).toHaveBeenCalled();
      expect(mockShowNotification).toHaveBeenCalledWith(expect.stringContaining('new-file'), 'success');
    });
    
    // 入力がクリアされたことを確認
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('データディレクトリ変更時にエラーが発生した場合、エラー通知を表示する', async () => {
    const errorMessage = 'ディレクトリへのアクセス権限がありません';
    mockSetDataDirectory.mockRejectedValue(new Error(errorMessage));
    
    render(<StorageSettings />);
    
    // 入力を変更
    const input = screen.getByLabelText(/データディレクトリのパス/i);
    fireEvent.change(input, { target: { value: '/invalid/path' } });
    
    // 保存ボタンをクリック
    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);
    
    // エラー通知が表示されたことを確認
    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith(errorMessage, 'error');
    });
  });

  it('ファイル名が空の場合、作成ボタンを無効にする', () => {
    render(<StorageSettings />);
    
    const createButton = screen.getByText('作成');
    expect(createButton).toBeDisabled();
    
    // 入力を変更
    const input = screen.getByLabelText(/ファイル名/i);
    fireEvent.change(input, { target: { value: 'new-file' } });
    
    // ボタンが有効になったことを確認
    expect(createButton).not.toBeDisabled();
  });
});
