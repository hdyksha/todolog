import React, { ReactNode, useState, useEffect } from 'react';
import { FileProvider, useFileContext } from './FileContext';
import { TaskProvider, useTaskContext } from './TaskContext';
import { AutoSaveProvider } from './AutoSaveContext';
import { ErrorProvider } from './ErrorContext';

// アプリケーション全体のコンテキストを統合するプロバイダー
interface AppProviderProps {
  children: ReactNode;
}

// AutoSaveプロバイダーをタスクとファイルのコンテキストと接続するためのコンポーネント
const ConnectedAutoSaveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { tasks } = useTaskContext();
  const { currentFile } = useFileContext();

  return (
    <AutoSaveProvider
      tasks={tasks}
      currentFile={currentFile}
      // eslint-disable-next-line no-console
      onSaveSuccess={() => console.log(`タスクを自動保存しました: ${currentFile}`)}
      onSaveError={err => console.error(`タスクの自動保存エラー: ${err}`)}
    >
      {children}
    </AutoSaveProvider>
  );
};

// アーカイブの表示/非表示状態を管理するコンテキスト
interface ArchiveContextType {
  showArchived: boolean;
  toggleArchiveVisibility: () => void;
}

export const ArchiveContext = React.createContext<ArchiveContextType | undefined>(undefined);

export const useArchiveContext = (): ArchiveContextType => {
  const context = React.useContext(ArchiveContext);
  if (context === undefined) {
    throw new Error('useArchiveContext must be used within an ArchiveProvider');
  }
  return context;
};

// アプリケーション全体のプロバイダー
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [showArchived, setShowArchived] = useState(true);

  const toggleArchiveVisibility = () => {
    setShowArchived(!showArchived);
  };

  return (
    <ErrorProvider autoClearTimeout={0}>
      <FileProvider>
        <TaskProvider>
          <ConnectedAutoSaveProvider>
            <ArchiveContext.Provider value={{ showArchived, toggleArchiveVisibility }}>
              {children}
            </ArchiveContext.Provider>
          </ConnectedAutoSaveProvider>
        </TaskProvider>
      </FileProvider>
    </ErrorProvider>
  );
};

// アプリケーション初期化用のコンポーネント
export const AppInitializer: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { loadTaskFiles } = useFileContext();
  const { loadTasksFromFile } = useTaskContext();

  useEffect(() => {
    const initializeApp = async () => {
      const selectedFile = await loadTaskFiles();
      if (selectedFile) {
        await loadTasksFromFile(selectedFile);
      }
    };

    initializeApp();
  }, [loadTaskFiles, loadTasksFromFile]);

  return <>{children}</>;
};
