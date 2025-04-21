import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ServerSettingsProvider, useServerSettings } from './ServerSettingsContext';
import * as settingsApi from '../services/settingsApi';
import React from 'react';

// APIモック
vi.mock('../services/settingsApi', () => ({
  fetchServerSettings: vi.fn(),
  updateServerSettings: vi.fn(),
  resetServerSettings: vi.fn(),
  setDataDirectory: vi.fn(),
  setCurrentTaskFile: vi.fn(),
}));

// テスト用のコンポーネント
const TestComponent = () => {
  const { serverSettings, isLoading, error, setDataDirectory } = useServerSettings();
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="data-dir">{serverSettings.storage.dataDir}</div>
      <div data-testid="current-file">{serverSettings.storage.currentTaskFile}</div>
      <button 
        data-testid="change-dir-btn" 
        onClick={() => setDataDirectory('/new/path')}
      >
        Change Directory
      </button>
    </div>
  );
};

describe('ServerSettingsContext', () => {
  const mockSettings = {
    storage: {
      dataDir: '/test/path',
      currentTaskFile: 'test.json',
      recentTaskFiles: ['test.json', 'other.json'],
    },
    app: {
      maxTasksPerPage: 50,
      maxBackups: 10,
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (settingsApi.fetchServerSettings as any).mockResolvedValue(mockSettings);
  });

  it('初期状態でローディング中を表示し、データ取得後に設定を表示する', async () => {
    render(
      <ServerSettingsProvider>
        <TestComponent />
      </ServerSettingsProvider>
    );

    // 初期状態はローディング中
    expect(screen.getByTestId('loading').textContent).toBe('loading');

    // データ取得後
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('loaded');
      expect(screen.getByTestId('data-dir').textContent).toBe('/test/path');
      expect(screen.getByTestId('current-file').textContent).toBe('test.json');
    });
  });

  it('setDataDirectoryを呼び出すと、APIが呼ばれて状態が更新される', async () => {
    const updatedSettings = {
      ...mockSettings,
      storage: {
        ...mockSettings.storage,
        dataDir: '/new/path',
      },
    };
    
    (settingsApi.setDataDirectory as any).mockResolvedValue(updatedSettings);

    render(
      <ServerSettingsProvider>
        <TestComponent />
      </ServerSettingsProvider>
    );

    // データ取得完了を待つ
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('loaded');
    });

    // ボタンをクリック
    screen.getByTestId('change-dir-btn').click();

    // APIが呼ばれたことを確認
    await waitFor(() => {
      expect(settingsApi.setDataDirectory).toHaveBeenCalledWith('/new/path');
    });

    // 状態が更新されたことを確認
    await waitFor(() => {
      expect(screen.getByTestId('data-dir').textContent).toBe('/new/path');
    });
  });

  it('APIエラー時にエラーメッセージを表示する', async () => {
    const errorMessage = 'API error occurred';
    (settingsApi.fetchServerSettings as any).mockRejectedValue(new Error(errorMessage));

    render(
      <ServerSettingsProvider>
        <TestComponent />
      </ServerSettingsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe(errorMessage);
    });
  });
});
