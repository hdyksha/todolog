import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Task } from '../types';

// 状態の型定義
interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  updatingTaskIds: string[];
}

// アクションの型定義
type TaskAction =
  | { type: 'FETCH_TASKS_START' }
  | { type: 'FETCH_TASKS_SUCCESS'; payload: Task[] }
  | { type: 'FETCH_TASKS_ERROR'; payload: Error }
  | { type: 'ADD_TASK_START' }
  | { type: 'ADD_TASK_SUCCESS'; payload: Task }
  | { type: 'ADD_TASK_ERROR'; payload: Error }
  | { type: 'UPDATE_TASK_START'; payload: string }
  | { type: 'UPDATE_TASK_SUCCESS'; payload: Task }
  | { type: 'UPDATE_TASK_ERROR'; payload: { id: string; error: Error } }
  | { type: 'DELETE_TASK_START'; payload: string }
  | { type: 'DELETE_TASK_SUCCESS'; payload: string }
  | { type: 'DELETE_TASK_ERROR'; payload: { id: string; error: Error } }
  | { type: 'TOGGLE_TASK_START'; payload: string }
  | { type: 'TOGGLE_TASK_SUCCESS'; payload: Task }
  | { type: 'TOGGLE_TASK_ERROR'; payload: { id: string; error: Error } }
  | { type: 'UPDATE_MEMO_START'; payload: string }
  | { type: 'UPDATE_MEMO_SUCCESS'; payload: Task }
  | { type: 'UPDATE_MEMO_ERROR'; payload: { id: string; error: Error } }
  | { type: 'UPDATE_TITLE_START'; payload: string }
  | { type: 'UPDATE_TITLE_SUCCESS'; payload: Task }
  | { type: 'UPDATE_TITLE_ERROR'; payload: { id: string; error: Error } };;

// コンテキストの型定義
interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  updatingTaskIds: string[];
  dispatch: React.Dispatch<TaskAction>;
}

// 初期状態
const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  updatingTaskIds: [],
};

// リデューサー
const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    // タスク一覧取得
    case 'FETCH_TASKS_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_TASKS_SUCCESS':
      return {
        ...state,
        tasks: action.payload,
        loading: false,
        error: null,
      };
    case 'FETCH_TASKS_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // タスク追加
    case 'ADD_TASK_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'ADD_TASK_SUCCESS':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        loading: false,
        error: null,
      };
    case 'ADD_TASK_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // タスク更新
    case 'UPDATE_TASK_START':
      return {
        ...state,
        updatingTaskIds: [...state.updatingTaskIds, action.payload],
        error: null,
      };
    case 'UPDATE_TASK_SUCCESS':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
        updatingTaskIds: state.updatingTaskIds.filter(id => id !== action.payload.id),
        error: null,
      };
    case 'UPDATE_TASK_ERROR':
      return {
        ...state,
        updatingTaskIds: state.updatingTaskIds.filter(id => id !== action.payload.id),
        error: action.payload.error,
      };

    // タスク削除
    case 'DELETE_TASK_START':
      return {
        ...state,
        updatingTaskIds: [...state.updatingTaskIds, action.payload],
        error: null,
      };
    case 'DELETE_TASK_SUCCESS':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        updatingTaskIds: state.updatingTaskIds.filter(id => id !== action.payload),
        error: null,
      };
    case 'DELETE_TASK_ERROR':
      return {
        ...state,
        updatingTaskIds: state.updatingTaskIds.filter(id => id !== action.payload.id),
        error: action.payload.error,
      };

    // タスク完了状態の切り替え
    case 'TOGGLE_TASK_START':
      return {
        ...state,
        updatingTaskIds: [...state.updatingTaskIds, action.payload],
        error: null,
      };
    case 'TOGGLE_TASK_SUCCESS':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
        updatingTaskIds: state.updatingTaskIds.filter(id => id !== action.payload.id),
        error: null,
      };
    case 'TOGGLE_TASK_ERROR':
      return {
        ...state,
        updatingTaskIds: state.updatingTaskIds.filter(id => id !== action.payload.id),
        error: action.payload.error,
      };

    // メモ更新
    case 'UPDATE_MEMO_START':
      return {
        ...state,
        updatingTaskIds: [...state.updatingTaskIds, action.payload],
        error: null,
      };
    case 'UPDATE_MEMO_SUCCESS':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
        updatingTaskIds: state.updatingTaskIds.filter(id => id !== action.payload.id),
        error: null,
      };
    case 'UPDATE_MEMO_ERROR':
      return {
        ...state,
        updatingTaskIds: state.updatingTaskIds.filter(id => id !== action.payload.id),
        error: action.payload.error,
      };

    // タイトル更新
    case 'UPDATE_TITLE_START':
      return {
        ...state,
        updatingTaskIds: [...state.updatingTaskIds, action.payload],
        error: null,
      };
    case 'UPDATE_TITLE_SUCCESS':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
        updatingTaskIds: state.updatingTaskIds.filter(id => id !== action.payload.id),
        error: null,
      };
    case 'UPDATE_TITLE_ERROR':
      return {
        ...state,
        updatingTaskIds: state.updatingTaskIds.filter(id => id !== action.payload.id),
        error: action.payload.error,
      };

    default:
      return state;
  }
};

// コンテキストの作成
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// プロバイダーコンポーネント
export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  return (
    <TaskContext.Provider
      value={{
        tasks: state.tasks,
        loading: state.loading,
        error: state.error,
        updatingTaskIds: state.updatingTaskIds,
        dispatch,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

// カスタムフック
export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
