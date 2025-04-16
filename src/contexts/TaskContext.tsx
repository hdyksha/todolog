import React, { createContext, useContext, ReactNode } from 'react';
import { useTasks, TasksByDate } from '../hooks/useTasks';
import { Task } from '../types/Task';

// コンテキストの型定義
interface TaskContextType {
  // 状態
  tasks: Task[];
  activeTasks: TasksByDate;
  archivedTasks: TasksByDate;
  newTask: string;
  loading: boolean;
  error: string | null;

  // アクション
  setNewTask: (text: string) => void;
  loadTasksFromFile: (filename: string) => Promise<boolean>;
  saveTasksToFile: (filename: string) => Promise<boolean>;
  addTask: (text: string) => boolean;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  resetTasks: () => void;
  clearError: () => void;
}

// コンテキストの作成
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// プロバイダーコンポーネント
export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const taskHook = useTasks();

  return <TaskContext.Provider value={taskHook}>{children}</TaskContext.Provider>;
};

// カスタムフック
export const useTaskContext = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
