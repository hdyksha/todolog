import { v4 as uuidv4 } from 'uuid';
import { FileService } from './fileService.js';
import { Task, CreateTaskInput, UpdateTaskInput } from '../models/task.model.js';
import { logger } from '../utils/logger.js';
import { SettingsService } from './settingsService.js';

export class TaskService {
  private fileService: FileService;
  private settingsService: SettingsService | null = null;
  private readonly DEFAULT_TASKS_FILE = 'tasks.json';

  constructor(fileService: FileService, settingsService?: SettingsService) {
    this.fileService = fileService;
    this.settingsService = settingsService || null;
  }

  /**
   * 現在のタスクファイル名を取得する
   * @returns タスクファイル名
   */
  private async getTasksFilename(): Promise<string> {
    if (this.settingsService) {
      try {
        // getCurrentTaskFile は内部で最新の設定を確認するようになった
        const currentFile = await this.settingsService.getCurrentTaskFile();
        return currentFile;
      } catch (error) {
        logger.warn('設定からタスクファイル名の取得に失敗しました。デフォルトを使用します。', { error: (error as Error).message });
        return this.DEFAULT_TASKS_FILE;
      }
    }
    return this.DEFAULT_TASKS_FILE;
  }

  // 全タスクの取得（フィルタリングとソート機能付き）
  async getAllTasks(options?: {
    tags?: string[];
    completed?: boolean;
    priority?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority';
    sortOrder?: 'asc' | 'desc';
  }): Promise<Task[]> {
    const tasksFile = await this.getTasksFilename();
    logger.info(`タスクを読み込み中: ${tasksFile}`);
    
    let tasks = await this.fileService.readFile<Task[]>(tasksFile, []);
    
    // カテゴリからタグへの移行処理
    tasks = tasks.map(task => {
      // 古いデータ形式（category）から新しいデータ形式（tags）への変換
      if (!task.tags && task.category) {
        const newTask = {
          ...task,
          tags: [task.category]
        };
        // @ts-ignore - 古いフィールドを削除
        delete newTask.category;
        return newTask as Task;
      }
      
      // tagsフィールドがない場合は空の配列を設定
      if (!task.tags) {
        return {
          ...task,
          tags: []
        };
      }
      
      return task;
    });
    
    // フィルタリング
    if (options) {
      if (options.tags && options.tags.length > 0) {
        tasks = tasks.filter(task => {
          // タスクのタグが指定されたタグのいずれかを含む場合にマッチ
          return options.tags!.some(tag => task.tags.includes(tag));
        });
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
    const tasksFile = await this.getTasksFilename();
    const tasks = await this.getAllTasks();
    
    const newTask: Task = {
      ...taskData,
      completed: taskData.completed ?? false,
      priority: taskData.priority ?? 'medium',
      tags: taskData.tags ?? [],
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    tasks.push(newTask);
    await this.fileService.writeFile(tasksFile, tasks);
    
    logger.info(`タスクが作成されました: ${newTask.id}`);
    return newTask;
  }

  // タスクの更新
  async updateTask(id: string, taskData: UpdateTaskInput): Promise<Task | null> {
    const tasksFile = await this.getTasksFilename();
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
    await this.fileService.writeFile(tasksFile, tasks);
    
    logger.info(`タスクが更新されました: ${id}`);
    return updatedTask;
  }

  // タスクの削除
  async deleteTask(id: string): Promise<boolean> {
    const tasksFile = await this.getTasksFilename();
    const tasks = await this.getAllTasks();
    const initialLength = tasks.length;
    
    const filteredTasks = tasks.filter(task => task.id !== id);
    
    if (filteredTasks.length === initialLength) {
      return false;
    }
    
    await this.fileService.writeFile(tasksFile, filteredTasks);
    
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
  
  // データのバックアップを作成
  async createBackup(): Promise<string> {
    const tasksFile = await this.getTasksFilename();
    return this.fileService.createBackup(tasksFile);
  }
  
  // バックアップからデータを復元
  async restoreFromBackup(backupFilename: string): Promise<void> {
    const tasksFile = await this.getTasksFilename();
    await this.fileService.restoreFromBackup(backupFilename, tasksFile);
  }
  
  // 利用可能なバックアップ一覧を取得
  async listBackups(): Promise<string[]> {
    const tasksFile = await this.getTasksFilename();
    return this.fileService.listBackups(tasksFile);
  }
  
  // タスクデータをエクスポート
  async exportTasks(): Promise<Task[]> {
    return this.getAllTasks();
  }
  
  // タスクデータをインポート
  async importTasks(tasks: Task[]): Promise<void> {
    const tasksFile = await this.getTasksFilename();
    // バックアップを作成してから上書き
    await this.createBackup();
    await this.fileService.writeFile(tasksFile, tasks);
    logger.info(`${tasks.length}件のタスクをインポートしました`);
  }
}
