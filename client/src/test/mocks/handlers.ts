import { http, HttpResponse } from 'msw';
import { mockTasks, mockCategories } from '../utils';

// APIエンドポイントのモックハンドラー
export const handlers = [
  // タスク一覧の取得
  http.get('/api/tasks', () => {
    return HttpResponse.json(mockTasks);
  }),

  // 特定のタスクの取得
  http.get('/api/tasks/:id', ({ params }) => {
    const { id } = params;
    const task = mockTasks.find(task => task.id === id);
    
    if (!task) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(task);
  }),

  // タスクの作成
  http.post('/api/tasks', async ({ request }) => {
    const newTask = await request.json();
    
    return HttpResponse.json({
      ...newTask,
      id: 'new-task-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { status: 201 });
  }),

  // タスクの更新
  http.put('/api/tasks/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedTask = await request.json();
    
    return HttpResponse.json({
      ...updatedTask,
      id,
      updatedAt: new Date().toISOString()
    });
  }),

  // タスクの削除
  http.delete('/api/tasks/:id', ({ params }) => {
    return new HttpResponse(null, { status: 204 });
  }),

  // タスクの完了状態の切り替え
  http.put('/api/tasks/:id/toggle', ({ params }) => {
    const { id } = params;
    const task = mockTasks.find(task => task.id === id);
    
    if (!task) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json({
      ...task,
      completed: !task.completed,
      updatedAt: new Date().toISOString()
    });
  }),

  // タスクのメモ更新
  http.put('/api/tasks/:id/memo', async ({ params, request }) => {
    const { id } = params;
    const { memo } = await request.json();
    const task = mockTasks.find(task => task.id === id);
    
    if (!task) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json({
      ...task,
      memo,
      updatedAt: new Date().toISOString()
    });
  }),

  // カテゴリ一覧の取得
  http.get('/api/categories', () => {
    return HttpResponse.json(mockCategories);
  }),

  // ヘルスチェック
  http.get('/health', () => {
    return new HttpResponse('OK', { status: 200 });
  })
];
