import { vi } from 'vitest';
import { mockTask, mockTasks } from './taskMocks';

// APIモックオブジェクト
export const apiMock = {
  fetchTasks: vi.fn().mockResolvedValue(mockTasks),
  fetchTaskById: vi.fn().mockResolvedValue(mockTask),
  createTask: vi.fn().mockImplementation((taskData) => 
    Promise.resolve({ 
      ...taskData, 
      id: 'new-task-id', 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString() 
    })
  ),
  updateTask: vi.fn().mockImplementation((id, updates) => 
    Promise.resolve({ ...mockTask, ...updates })
  ),
  deleteTask: vi.fn().mockResolvedValue(undefined),
  toggleTaskCompletion: vi.fn().mockImplementation((id) => {
    const task = mockTasks.find(t => t.id === id) || mockTask;
    return Promise.resolve({ ...task, completed: !task.completed });
  }),
  updateTaskMemo: vi.fn().mockImplementation((id, memo) => 
    Promise.resolve({ ...mockTask, memo })
  ),
  searchTasks: vi.fn().mockResolvedValue(mockTasks),
};

// APIモックをリセットする関数
export const resetApiMock = () => {
  apiMock.fetchTasks.mockClear();
  apiMock.fetchTaskById.mockClear();
  apiMock.createTask.mockClear();
  apiMock.updateTask.mockClear();
  apiMock.deleteTask.mockClear();
  apiMock.toggleTaskCompletion.mockClear();
  apiMock.updateTaskMemo.mockClear();
  apiMock.searchTasks.mockClear();
  
  // デフォルトの戻り値を設定
  apiMock.fetchTasks.mockResolvedValue(mockTasks);
  apiMock.fetchTaskById.mockResolvedValue(mockTask);
  apiMock.createTask.mockImplementation((taskData) => 
    Promise.resolve({ 
      ...taskData, 
      id: 'new-task-id', 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString() 
    })
  );
  apiMock.updateTask.mockImplementation((id, updates) => 
    Promise.resolve({ ...mockTask, ...updates })
  );
  apiMock.deleteTask.mockResolvedValue(undefined);
  apiMock.toggleTaskCompletion.mockImplementation((id) => {
    const task = mockTasks.find(t => t.id === id) || mockTask;
    return Promise.resolve({ ...task, completed: !task.completed });
  });
  apiMock.updateTaskMemo.mockImplementation((id, memo) => 
    Promise.resolve({ ...mockTask, memo })
  );
  apiMock.searchTasks.mockResolvedValue(mockTasks);
};
