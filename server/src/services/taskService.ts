import { v4 as uuidv4 } from 'uuid';
import { FileService } from './fileService.js';
import { Task, Priority } from '../types/index.js';

/**
 * タスク管理に関するサービスクラス
 */
export class TaskService {
  private fileService: FileService;

  /**
   * コンストラクタ
   * @param fileService ファイル操作サービス
   */
  constructor(fileService: FileService) {
    this.fileService = fileService;
  }

  /**
   * すべてのタスクを取得する
   * @returns タスクの配列
   */
  async getAllTasks(): Promise<Task[]> {
    return this.fileService.readTasks();
  }

  /**
   * IDでタスクを取得する
   * @param id タスクID
   * @returns タスク、見つからない場合はnull
   */
  async getTaskById(id: string): Promise<Task | null> {
    const tasks = await this.fileService.readTasks();
    return tasks.find(task => task.id === id) || null;
  }

  /**
   * 新しいタスクを作成する
   * @param taskData タスクデータ
   * @returns 作成されたタスク
   */
  async createTask(taskData: {
    title: string;
    priority?: Priority;
    category?: string;
    dueDate?: string;
    memo?: string;
  }): Promise<Task> {
    const tasks = await this.fileService.readTasks();
    
    const now = new Date().toISOString();
    const newTask: Task = {
      id: uuidv4(),
      title: taskData.title,
      completed: false,
      priority: taskData.priority || Priority.Medium,
      category: taskData.category,
      dueDate: taskData.dueDate,
      memo: taskData.memo,
      createdAt: now,
      updatedAt: now,
    };
    
    tasks.push(newTask);
    await this.fileService.writeTasks(tasks);
    
    return newTask;
  }

  /**
   * タスクを更新する
   * @param id タスクID
   * @param updates 更新データ
   * @returns 更新されたタスク、見つからない場合はnull
   */
  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | null> {
    const tasks = await this.fileService.readTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return null;
    }
    
    const updatedTask = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    tasks[taskIndex] = updatedTask;
    await this.fileService.writeTasks(tasks);
    
    return updatedTask;
  }

  /**
   * タスクを削除する
   * @param id タスクID
   * @returns 削除成功の場合はtrue、見つからない場合はfalse
   */
  async deleteTask(id: string): Promise<boolean> {
    const tasks = await this.fileService.readTasks();
    const filteredTasks = tasks.filter(task => task.id !== id);
    
    if (filteredTasks.length === tasks.length) {
      return false; // タスクが見つからなかった
    }
    
    await this.fileService.writeTasks(filteredTasks);
    return true;
  }

  /**
   * タスクの完了状態を切り替える
   * @param id タスクID
   * @param completed 設定する完了状態（省略時は現在の状態を反転）
   * @returns 更新されたタスク、見つからない場合はnull
   */
  async toggleTaskCompletion(id: string, completed?: boolean): Promise<Task | null> {
    const task = await this.getTaskById(id);
    
    if (!task) {
      return null;
    }
    
    const newCompleted = completed !== undefined ? completed : !task.completed;
    
    return this.updateTask(id, { completed: newCompleted });
  }

  /**
   * タスクのメモを更新する
   * @param id タスクID
   * @param memo 新しいメモ
   * @returns 更新されたタスク、見つからない場合はnull
   */
  async updateTaskMemo(id: string, memo: string): Promise<Task | null> {
    return this.updateTask(id, { memo });
  }

  /**
   * 利用可能なカテゴリの一覧を取得する
   * @returns カテゴリの配列
   */
  async getCategories(): Promise<string[]> {
    const tasks = await this.fileService.readTasks();
    const categories = new Set<string>();
    
    tasks.forEach(task => {
      if (task.category) {
        categories.add(task.category);
      }
    });
    
    return Array.from(categories);
  }
}
