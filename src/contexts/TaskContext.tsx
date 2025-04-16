import React, { createContext, useContext, ReactNode } from 'react';
import { useTasks } from '../hooks/useTasks';
import { Task } from '../types/Task';
import { TaskOperationResult } from '../types/TaskOperationResult';

// コンテキストの型定義
interface TaskContextType {
  // 状態
  tasks: Task[];
  activeTasks: Record<string, Task[]>;
  archivedTasks: Record<string, Task[]>;
  newTask: string;
  loading: boolean;
  error: string | null;

  // アクション
  setNewTask: (text: string) => void;
  loadTasksFromFile: (filename: string) => Promise<TaskOperationResult<boolean>>;
  saveTasksToFile: (filename: string) => Promise<TaskOperationResult<boolean>>;
  addTask: (text: string) => TaskOperationResult<Task>;
  toggleTask: (id: string) => TaskOperationResult<Task>;
  deleteTask: (id: string) => TaskOperationResult<boolean>;
  updateTask: (
    id: string,
    updates: Partial<Omit<Task, 'id' | 'createdAt'>>
  ) => TaskOperationResult<Task>;
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
