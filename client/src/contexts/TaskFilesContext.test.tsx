import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { TaskFilesProvider, useTaskFiles } from './TaskFilesContext';
import * as settingsApi from '../services/settingsApi';
import React from 'react';
import { ServerSettingsProvider } from './ServerSettingsContext';

// APIモック
vi.mock('../services/settingsApi', () => ({
  fetchTaskFiles: vi.fn(),
  fetchRecentTaskFiles: vi.fn(),
  createTaskFile: vi.fn(),
  setCurrentTaskFile: vi.fn(),
}));

// ServerSettingsContextのモック
vi.mock('./ServerSettingsContext', () => ({
  useServerSettings: () => ({
    refreshSettings: vi.fn().mockResolvedValue(undefined),
  }),
  ServerSettingsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// テスト用のコンポーネント
const TestComponent = () => {
  const { taskFiles, recentFiles, isLoading, error, createNewTaskFile, switchTaskFile } = useTaskFiles();
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="task-files">{taskFiles.join(',')}</div>
      <div data-testid="recent-files">{recentFiles.join(',')}</div>
      <button 
        data-testid="create-file-btn" 
        onClick={() => createNewTaskFile('new-file')}
      >
        Create File
      </button>
      <button 
        data-testid="switch-file-btn" 
        onClick={() => switchTaskFile('other-file.json')}
      >
        Switch File
      </button>
    </div>
  );
};

describe('TaskFilesContext', () => {
  const mockTaskFiles = ['tasks.json', 'work.json', 'personal.json'];
  const mockRecentFiles = ['personal.json', 'tasks.json'];

  beforeEach(() => {
    vi.resetAllMocks();
    (settingsApi.fetchTaskFiles as any).mockResolvedValue(mockTaskFiles);
    (settingsApi.fetchRecentTaskFiles as any).mockResolvedValue(mockRecentFiles);
  });

  it('初期状態でローディング中を表示し、データ取得後にファイル一覧を表示する', async () => {
    render(
      <ServerSettingsProvider>
        <TaskFilesProvider>
          <TestComponent />
        </TaskFilesProvider>
      </ServerSettingsProvider>
    );

    // 初期状態はローディング中
    expect(screen.getByTestId('loading').textContent).toBe('loading');

    // データ取得後
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('loaded');
      expect(screen.getByTestId('task-files').textContent).toBe(mockTaskFiles.join(','));
      expect(screen.getByTestId('recent-files').textContent).toBe(mockRecentFiles.join(','));
    });
  });

  it('createNewTaskFileを呼び出すと、APIが呼ばれてファイル一覧が更新される', async () => {
    const mockResult = { filename: 'new-file.json', message: 'ファイルが作成されました' };
    (settingsApi.createTaskFile as any).mockResolvedValue(mockResult);
    
    // 新しいファイルを含むリストを返すようにモックを更新
    const updatedTaskFiles = [...mockTaskFiles, 'new-file.json'];
    (settingsApi.fetchTaskFiles as any)
      .mockResolvedValueOnce(mockTaskFiles)  // 初回のロード
      .mockResolvedValueOnce(updatedTaskFiles);  // createNewTaskFile後

    render(
      <ServerSettingsProvider>
        <TaskFilesProvider>
          <TestComponent />
        </TaskFilesProvider>
      </ServerSettingsProvider>
    );

    // データ取得完了を待つ
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('loaded');
    });

    // 初回のfetchTaskFilesの呼び出しをリセット
    vi.resetAllMocks();
    (settingsApi.createTaskFile as any).mockResolvedValue(mockResult);
    (settingsApi.fetchTaskFiles as any).mockResolvedValue(updatedTaskFiles);
    (settingsApi.fetchRecentTaskFiles as any).mockResolvedValue(mockRecentFiles);

    // ボタンをクリック
    screen.getByTestId('create-file-btn').click();

    // APIが呼ばれたことを確認
    await waitFor(() => {
      expect(settingsApi.createTaskFile).toHaveBeenCalledWith('new-file');
    });

    // 状態が更新されたことを確認（fetchTaskFilesが呼ばれる）
    await waitFor(() => {
      expect(settingsApi.fetchTaskFiles).toHaveBeenCalled();
      expect(screen.getByTestId('task-files').textContent).toContain('new-file.json');
    });
  });

  it('switchTaskFileを呼び出すと、APIが呼ばれて最近使用したファイル一覧が更新される', async () => {
    // 切り替え後の最近使用したファイル一覧を返すようにモックを更新
    const updatedRecentFiles = ['other-file.json', 'personal.json', 'tasks.json'];
    (settingsApi.fetchRecentTaskFiles as any)
      .mockResolvedValueOnce(mockRecentFiles)
      .mockResolvedValueOnce(updatedRecentFiles);

    render(
      <ServerSettingsProvider>
        <TaskFilesProvider>
          <TestComponent />
        </TaskFilesProvider>
      </ServerSettingsProvider>
    );

    // データ取得完了を待つ
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('loaded');
    });

    // 初回のfetchRecentTaskFilesの呼び出しをリセット
    vi.resetAllMocks();
    (settingsApi.setCurrentTaskFile as any).mockResolvedValue({});
    (settingsApi.fetchRecentTaskFiles as any).mockResolvedValue(updatedRecentFiles);

    // ボタンをクリック
    screen.getByTestId('switch-file-btn').click();

    // APIが呼ばれたことを確認
    await waitFor(() => {
      expect(settingsApi.setCurrentTaskFile).toHaveBeenCalledWith('other-file.json');
    });

    // 状態が更新されたことを確認（fetchRecentTaskFilesが呼ばれる）
    await waitFor(() => {
      expect(settingsApi.fetchRecentTaskFiles).toHaveBeenCalled();
    });
  });

  it('APIエラー時にエラーメッセージを表示する', async () => {
    const errorMessage = 'API error occurred';
    (settingsApi.fetchTaskFiles as any).mockRejectedValue(new Error(errorMessage));

    render(
      <ServerSettingsProvider>
        <TaskFilesProvider>
          <TestComponent />
        </TaskFilesProvider>
      </ServerSettingsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe(errorMessage);
    });
  });
});
