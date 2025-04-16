import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';
import { AppProvider } from '../../contexts/AppContext';
import { ErrorProvider } from '../../contexts/ErrorContext';
import { apiService } from '../../services/ApiService';

// APIサービスのモック
jest.mock('../../services/ApiService', () => ({
  apiService: {
    getTaskFiles: jest.fn(),
    getTasks: jest.fn(),
    saveTasks: jest.fn(),
    createTaskFile: jest.fn(),
    deleteTaskFile: jest.fn(),
    getConfig: jest.fn().mockResolvedValue({
      dataStoragePath: './data',
      autoSaveInterval: 60000
    }),
  },
}));

describe('ファイル選択とタスク表示の統合テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // モックデータの設定
    const mockFiles = [
      { name: 'tasks1.json', path: '/path/to/tasks1.json', lastModified: new Date().toISOString() },
      { name: 'tasks2.json', path: '/path/to/tasks2.json', lastModified: new Date().toISOString() },
    ];
    
    const mockTasks = [
      { id: '1', text: 'タスク1', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '2', text: 'タスク2', completed: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];
    
    apiService.getTaskFiles.mockResolvedValue(mockFiles);
    apiService.getTasks.mockResolvedValue(mockTasks);
    apiService.saveTasks.mockResolvedValue(true);
  });

  test('アプリケーション起動時にファイル一覧が読み込まれる', async () => {
    render(
      <ErrorProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </ErrorProvider>
    );

    // ファイル一覧が読み込まれるのを待つ
    await waitFor(() => {
      expect(apiService.getTaskFiles).toHaveBeenCalled();
    });

    // ファイルセレクタが表示されていることを確認
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
