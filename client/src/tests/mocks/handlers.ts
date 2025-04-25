import { http, HttpResponse } from 'msw';
import { Priority, Task } from '../../types';

// モックタスクデータ
const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'プレゼンテーション資料作成',
    completed: false,
    priority: Priority.High,
    tags: ['仕事', 'プロジェクトA'],
    createdAt: '2025-04-15T10:00:00.000Z',
    updatedAt: '2025-04-15T10:00:00.000Z',
    dueDate: '2025-04-20T00:00:00.000Z',
    memo: '会議用の資料を準備する'
  },
  {
    id: 'task-2',
    title: '買い物リスト作成',
    completed: true,
    priority: Priority.Medium,
    tags: ['個人', '買い物'],
    createdAt: '2025-04-14T10:00:00.000Z',
    updatedAt: '2025-04-16T10:00:00.000Z',
    dueDate: '2025-04-18T00:00:00.000Z',
    memo: '週末のパーティー用の食材を購入'
  },
  {
    id: 'task-3',
    title: 'ジムに行く',
    completed: false,
    priority: Priority.Low,
    tags: ['健康'],
    createdAt: '2025-04-16T10:00:00.000Z',
    updatedAt: '2025-04-16T10:00:00.000Z',
    dueDate: '2025-04-25T00:00:00.000Z',
    memo: '有酸素運動30分、筋トレ20分'
  }
];

// モックタグデータ
const mockTags = {
  '仕事': { color: '#4a90e2', description: '仕事関連のタスク' },
  '個人': { color: '#50e3c2', description: '個人的なタスク' },
  '健康': { color: '#b8e986', description: '健康に関するタスク' },
  '買い物': { color: '#f5a623', description: '買い物リスト' },
  'プロジェクトA': { color: '#bd10e0', description: 'プロジェクトAに関するタスク' }
};

// APIリクエストハンドラー
export const handlers = [
  // タスク一覧の取得
  http.get('http://localhost:3001/api/tasks', () => {
    return HttpResponse.json(mockTasks);
  }),
  
  // 特定のタスクの取得
  http.get('http://localhost:3001/api/tasks/:id', ({ params }) => {
    const { id } = params;
    const task = mockTasks.find(task => task.id === id);
    
    if (task) {
      return HttpResponse.json(task);
    } else {
      return new HttpResponse(
        JSON.stringify({ message: 'タスクが見つかりません' }),
        { status: 404 }
      );
    }
  }),
  
  // タスクの作成
  http.post('http://localhost:3001/api/tasks', async ({ request }) => {
    const body = await request.json();
    const newTask = {
      id: `task-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json(newTask, { status: 201 });
  }),
  
  // タスクの更新
  http.put('http://localhost:3001/api/tasks/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    const taskIndex = mockTasks.findIndex(task => task.id === id);
    
    if (taskIndex !== -1) {
      const updatedTask = {
        ...mockTasks[taskIndex],
        ...body,
        updatedAt: new Date().toISOString()
      };
      
      return HttpResponse.json(updatedTask);
    } else {
      return new HttpResponse(
        JSON.stringify({ message: 'タスクが見つかりません' }),
        { status: 404 }
      );
    }
  }),
  
  // タスクの削除
  http.delete('http://localhost:3001/api/tasks/:id', ({ params }) => {
    const { id } = params;
    const taskIndex = mockTasks.findIndex(task => task.id === id);
    
    if (taskIndex !== -1) {
      return HttpResponse.json({ success: true });
    } else {
      return new HttpResponse(
        JSON.stringify({ message: 'タスクが見つかりません' }),
        { status: 404 }
      );
    }
  }),
  
  // タスクの完了状態の切り替え
  http.put('http://localhost:3001/api/tasks/:id/toggle', ({ params }) => {
    const { id } = params;
    const taskIndex = mockTasks.findIndex(task => task.id === id);
    
    if (taskIndex !== -1) {
      const updatedTask = {
        ...mockTasks[taskIndex],
        completed: !mockTasks[taskIndex].completed,
        updatedAt: new Date().toISOString()
      };
      
      return HttpResponse.json(updatedTask);
    } else {
      return new HttpResponse(
        JSON.stringify({ message: 'タスクが見つかりません' }),
        { status: 404 }
      );
    }
  }),
  
  // タスクのメモ更新
  http.put('http://localhost:3001/api/tasks/:id/memo', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    const taskIndex = mockTasks.findIndex(task => task.id === id);
    
    if (taskIndex !== -1) {
      const updatedTask = {
        ...mockTasks[taskIndex],
        memo: body.memo,
        updatedAt: new Date().toISOString()
      };
      
      return HttpResponse.json(updatedTask);
    } else {
      return new HttpResponse(
        JSON.stringify({ message: 'タスクが見つかりません' }),
        { status: 404 }
      );
    }
  }),
  
  // タグ一覧の取得
  http.get('/api/tags', () => {
    return HttpResponse.json(mockTags);
  }),
  
  // タグの作成
  http.post('/api/tags', async ({ request }) => {
    const body = await request.json();
    const { tagName, color, description } = body;
    
    return HttpResponse.json({
      name: tagName,
      color: color || '#4a90e2',
      description: description || ''
    }, { status: 201 });
  }),
  
  // タグの更新
  http.put('/api/tags/:name', async ({ params, request }) => {
    const { name } = params;
    const body = await request.json();
    
    return HttpResponse.json({
      name,
      ...body
    });
  }),
  
  // タグの削除
  http.delete('/api/tags/:name', () => {
    return HttpResponse.json({ success: true });
  }),
  
  // タグの使用状況取得
  http.get('/api/tags/usage', () => {
    const usage = {
      '仕事': 1,
      '個人': 1,
      '健康': 1,
      '買い物': 1,
      'プロジェクトA': 1
    };
    return HttpResponse.json(usage);
  }),
  
  // ヘルスチェック
  http.get('http://localhost:3001/health', () => {
    return HttpResponse.json({ status: 'ok' });
  })
];
