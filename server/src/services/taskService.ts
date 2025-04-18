import { v4 as uuidv4 } from 'uuid';
import { FileService } from './fileService.js';
import { Task, CreateTaskInput, UpdateTaskInput } from '../models/task.model.js';
import { logger } from '../utils/logger.js';

export class TaskService {
  private fileService: FileService;
  private readonly TASKS_FILE = 'tasks.json';

  constructor(fileService: FileService) {
    this.fileService = fileService;
  }

  // 全タスクの取得（フィルタリングとソート機能付き）
  async getAllTasks(options?: {
    category?: string;
    completed?: boolean;
    priority?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority';
    sortOrder?: 'asc' | 'desc';
  }): Promise<Task[]> {
    let tasks = await this.fileService.readFile<Task[]>(this.TASKS_FILE, []);
    
    // フィルタリング
    if (options) {
      if (options.category !== undefined) {
        tasks = tasks.filter(task => task.category === options.category);
      }
      
      if (options.completed !== undefined) {
        tasks = tasks.filter(task => task.completed === options.completed);
      }
      
      if (options.priority !== undefined) {
        tasks = tasks.filter(task => task.priority === options.priority);
      }
      
      // ソート
      if (options.sortBy) {
        const sortOrder = options.sortOrder === 'desc' ? -1 : 1;
        
        tasks.sort((a, b) => {
          const fieldA = a[options.sortBy as keyof Task];
          const fieldB = b[options.sortBy as keyof Task];
          
          if (fieldA === undefined && fieldB === undefined) return 0;
          if (fieldA === undefined) return sortOrder;
          if (fieldB === undefined) return -sortOrder;
          
          if (typeof fieldA === 'string' && typeof fieldB === 'string') {
            return fieldA.localeCompare(fieldB) * sortOrder;
          }
          
          return 0;
        });
      }
    }
    
    return tasks;
  }

  // IDによるタスクの取得
  async getTaskById(id: string): Promise<Task | null> {
    const tasks = await this.getAllTasks();
    return tasks.find(task => task.id === id) || null;
  }

  // タスクの作成
  async createTask(taskData: CreateTaskInput): Promise<Task> {
    const tasks = await this.getAllTasks();
    
    const newTask: Task = {
      ...taskData,
      completed: taskData.completed ?? false,
      priority: taskData.priority ?? 'medium',
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    tasks.push(newTask);
    await this.fileService.writeFile(this.TASKS_FILE, tasks);
    
    logger.info(`タスクが作成されました: ${newTask.id}`);
    return newTask;
  }

  // タスクの更新
  async updateTask(id: string, taskData: UpdateTaskInput): Promise<Task | null> {
    const tasks = await this.getAllTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return null;
    }
    
    const updatedTask: Task = {
      ...tasks[taskIndex],
      ...taskData,
      updatedAt: new Date().toISOString(),
    };
    
    tasks[taskIndex] = updatedTask;
    await this.fileService.writeFile(this.TASKS_FILE, tasks);
    
    logger.info(`タスクが更新されました: ${id}`);
    return updatedTask;
  }

  // タスクの削除
  async deleteTask(id: string): Promise<boolean> {
    const tasks = await this.getAllTasks();
    const initialLength = tasks.length;
    
    const filteredTasks = tasks.filter(task => task.id !== id);
    
    if (filteredTasks.length === initialLength) {
      return false;
    }
    
    await this.fileService.writeFile(this.TASKS_FILE, filteredTasks);
    
    logger.info(`タスクが削除されました: ${id}`);
    return true;
  }

  // タスクの完了状態の切り替え
  async toggleTaskCompletion(id: string): Promise<Task | null> {
    const task = await this.getTaskById(id);
    
    if (!task) {
      return null;
    }
    
    return this.updateTask(id, { completed: !task.completed });
  }

  // タスクのメモ更新
  async updateTaskMemo(id: string, memo: string): Promise<Task | null> {
    const task = await this.getTaskById(id);
    
    if (!task) {
      return null;
    }
    
    return this.updateTask(id, { memo });
  }

  // カテゴリ一覧の取得
  async getCategories(): Promise<string[]> {
    const tasks = await this.getAllTasks();
    const categories = new Set<string>();
    
    tasks.forEach(task => {
      if (task.category) {
        categories.add(task.category);
      }
    });
    
    return Array.from(categories);
  }
  
  // データのバックアップを作成
  async createBackup(): Promise<string> {
    return this.fileService.createBackup(this.TASKS_FILE);
  }
  
  // バックアップからデータを復元
  async restoreFromBackup(backupFilename: string): Promise<void> {
    await this.fileService.restoreFromBackup(backupFilename, this.TASKS_FILE);
  }
  
  // 利用可能なバックアップ一覧を取得
  async listBackups(): Promise<string[]> {
    return this.fileService.listBackups(this.TASKS_FILE);
  }
  
  // タスクデータをエクスポート
  async exportTasks(): Promise<Task[]> {
    return this.getAllTasks();
  }
  
  // タスクデータをインポート
  async importTasks(tasks: Task[]): Promise<void> {
    // バックアップを作成してから上書き
    await this.createBackup();
    await this.fileService.writeFile(this.TASKS_FILE, tasks);
    logger.info(`${tasks.length}件のタスクをインポートしました`);
  }
}
