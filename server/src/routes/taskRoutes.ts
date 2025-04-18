import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// データファイルのパス
const DATA_DIR = process.env.DATA_DIR || './data';
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

// データディレクトリが存在しない場合は作成
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch (error) {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// タスクデータを読み込む
async function loadTasks() {
  await ensureDataDir();
  
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // ファイルが存在しない場合は空の配列を返す
    return [];
  }
}

// タスクデータを保存する
async function saveTasks(tasks: any[]) {
  await ensureDataDir();
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
}

// タスク一覧を取得
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await loadTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'タスクの取得に失敗しました' });
  }
});

// 特定のタスクを取得
router.get('/tasks/:id', async (req, res) => {
  try {
    const tasks = await loadTasks();
    const task = tasks.find((t: any) => t.id === req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'タスクが見つかりません' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'タスクの取得に失敗しました' });
  }
});

// 新しいタスクを作成
router.post('/tasks', async (req, res) => {
  try {
    const { title, priority, category, dueDate, memo } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'タイトルは必須です' });
    }
    
    const tasks = await loadTasks();
    const now = new Date().toISOString();
    
    const newTask = {
      id: uuidv4(),
      title,
      completed: false,
      priority: priority || 'medium',
      category,
      dueDate,
      createdAt: now,
      updatedAt: now,
      memo,
    };
    
    tasks.push(newTask);
    await saveTasks(tasks);
    
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'タスクの作成に失敗しました' });
  }
});

// タスクを更新
router.put('/tasks/:id', async (req, res) => {
  try {
    const { title, priority, category, dueDate, memo, completed } = req.body;
    const tasks = await loadTasks();
    const taskIndex = tasks.findIndex((t: any) => t.id === req.params.id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'タスクが見つかりません' });
    }
    
    const updatedTask = {
      ...tasks[taskIndex],
      ...(title !== undefined && { title }),
      ...(priority !== undefined && { priority }),
      ...(category !== undefined && { category }),
      ...(dueDate !== undefined && { dueDate }),
      ...(memo !== undefined && { memo }),
      ...(completed !== undefined && { completed }),
      updatedAt: new Date().toISOString(),
    };
    
    tasks[taskIndex] = updatedTask;
    await saveTasks(tasks);
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'タスクの更新に失敗しました' });
  }
});

// タスクを削除
router.delete('/tasks/:id', async (req, res) => {
  try {
    const tasks = await loadTasks();
    const filteredTasks = tasks.filter((t: any) => t.id !== req.params.id);
    
    if (filteredTasks.length === tasks.length) {
      return res.status(404).json({ error: 'タスクが見つかりません' });
    }
    
    await saveTasks(filteredTasks);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'タスクの削除に失敗しました' });
  }
});

// タスクの完了状態を切り替え
router.put('/tasks/:id/toggle', async (req, res) => {
  try {
    const tasks = await loadTasks();
    const taskIndex = tasks.findIndex((t: any) => t.id === req.params.id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'タスクが見つかりません' });
    }
    
    const completed = req.body.completed !== undefined ? req.body.completed : !tasks[taskIndex].completed;
    
    const updatedTask = {
      ...tasks[taskIndex],
      completed,
      updatedAt: new Date().toISOString(),
    };
    
    tasks[taskIndex] = updatedTask;
    await saveTasks(tasks);
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'タスクの状態変更に失敗しました' });
  }
});

// タスクのメモを更新
router.put('/tasks/:id/memo', async (req, res) => {
  try {
    const { memo } = req.body;
    const tasks = await loadTasks();
    const taskIndex = tasks.findIndex((t: any) => t.id === req.params.id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'タスクが見つかりません' });
    }
    
    const updatedTask = {
      ...tasks[taskIndex],
      memo,
      updatedAt: new Date().toISOString(),
    };
    
    tasks[taskIndex] = updatedTask;
    await saveTasks(tasks);
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'メモの更新に失敗しました' });
  }
});

// カテゴリ一覧を取得
router.get('/categories', async (req, res) => {
  try {
    const tasks = await loadTasks();
    const categories = [...new Set(tasks.map((t: any) => t.category).filter(Boolean))];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'カテゴリの取得に失敗しました' });
  }
});

export const taskRoutes = router;
