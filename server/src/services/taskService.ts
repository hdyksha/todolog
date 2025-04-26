import { v4 as uuidv4 } from 'uuid';
import { FileService } from './fileService.js';
import { Task, CreateTaskInput, UpdateTaskInput } from '../models/task.model.js';
import { logger } from '../utils/logger.js';
import { SettingsService } from './settingsService.js';
import { TagService } from './tagService.js';

export class TaskService {
  private fileService: FileService;
  private settingsService: SettingsService | null = null;
  private tagService: TagService | null = null;
  private readonly DEFAULT_TASKS_FILE = 'tasks.json';

  constructor(fileService: FileService, settingsService?: SettingsService, tagService?: TagService) {
    this.fileService = fileService;
    this.settingsService = settingsService || null;
    this.tagService = tagService || null;
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

  /**
   * 新しいタグを自動的に登録する
   * @param tags タグの配列
   */
  private async registerNewTags(tags: string[]): Promise<void> {
    if (!this.tagService) {
      logger.warn('タグサービスが利用できないため、タグの自動登録をスキップします');
      return;
    }
    
    try {
      const existingTags = await this.tagService.getAllTags();
      logger.info(`既存のタグを確認: ${Object.keys(existingTags).join(', ')}`);
      
      const newTags = tags.filter(tag => !existingTags[tag]);
      if (newTags.length === 0) return;
      
      logger.info(`新しいタグを登録します: ${newTags.join(', ')}`);
      
      // 新しいタグを登録
      await Promise.all(newTags.map(tag => this.registerSingleTag(tag)));
    } catch (error) {
      logger.error('タグの自動登録に失敗しました', { error: (error as Error).message });
    }
  }
  
  /**
   * 単一のタグを登録する
   * @param tag タグ名
   */
  private async registerSingleTag(tag: string): Promise<void> {
    if (!this.tagService) return;
    
    try {
      // デフォルトの色とタグの説明を設定
      const defaultColors = [
        '#4a90e2', '#50b83c', '#f49342', '#9c6ade', '#47c1bf', 
        '#5c6ac4', '#de3618', '#8a8a8a', '#bf0711', '#00848e'
      ];
      const randomColor = defaultColors[Math.floor(Math.random() * defaultColors.length)];
      
      await this.tagService.createTag(tag, {
        color: randomColor,
        description: `${tag}に関するタスク`
      });
      
      logger.info(`新しいタグを自動登録しました: ${tag}`);
    } catch (error) {
      logger.error(`タグ "${tag}" の登録に失敗しました`, { error: (error as Error).message });
    }
  }

  /**
   * タスクデータを読み込み、古いデータ形式を新しい形式に変換する
   * @returns 変換済みのタスク配列
   */
  private async loadAndNormalizeTaskData(): Promise<Task[]> {
    const tasksFile = await this.getTasksFilename();
    logger.info(`タスクを読み込み中: ${tasksFile}`);
    
    const tasks = await this.fileService.readFile<Task[]>(tasksFile, []);
    return this.normalizeTaskData(tasks);
  }
  
  /**
   * タスクデータを正規化する（古い形式から新しい形式への変換）
   * @param tasks タスク配列
   * @returns 正規化されたタスク配列
   */
  private normalizeTaskData(tasks: Task[]): Task[] {
    return tasks.map(task => {
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
  }
  
  /**
   * タスクをフィルタリングする
   * @param tasks タスク配列
   * @param options フィルタリングオプション
   * @returns フィルタリングされたタスク配列
   */
  private filterTasks(tasks: Task[], options?: {
    tags?: string[];
    completed?: boolean;
    priority?: string;
  }): Task[] {
    if (!options) return tasks;
    
    let filteredTasks = [...tasks];
    
    // タグでフィルタリング
    if (options.tags && options.tags.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        options.tags!.some(tag => task.tags.includes(tag))
      );
    }
    
    // 完了状態でフィルタリング
    if (options.completed !== undefined) {
      filteredTasks = filteredTasks.filter(task => 
        task.completed === options.completed
      );
    }
    
    // 優先度でフィルタリング
    if (options.priority !== undefined) {
      filteredTasks = filteredTasks.filter(task => 
        task.priority === options.priority
      );
    }
    
    return filteredTasks;
  }
  
  /**
   * タスクをソートする
   * @param tasks タスク配列
   * @param sortBy ソート対象のフィールド
   * @param sortOrder ソート順序
   * @returns ソートされたタスク配列
   */
  private sortTasks(
    tasks: Task[], 
    sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Task[] {
    if (!sortBy) return tasks;
    
    const sortedTasks = [...tasks];
    const multiplier = sortOrder === 'desc' ? -1 : 1;
    
    sortedTasks.sort((a, b) => {
      const fieldA = a[sortBy];
      const fieldB = b[sortBy];
      
      if (fieldA === undefined && fieldB === undefined) return 0;
      if (fieldA === undefined) return multiplier;
      if (fieldB === undefined) return -multiplier;
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return fieldA.localeCompare(fieldB) * multiplier;
      }
      
      return 0;
    });
    
    return sortedTasks;
  }

  /**
   * 全タスクの取得（フィルタリングとソート機能付き）
   * @param options フィルタリングとソートのオプション
   * @returns タスク配列
   */
  async getAllTasks(options?: {
    tags?: string[];
    completed?: boolean;
    priority?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority';
    sortOrder?: 'asc' | 'desc';
  }): Promise<Task[]> {
    // タスクデータを読み込み、正規化
    let tasks = await this.loadAndNormalizeTaskData();
    
    // フィルタリング
    tasks = this.filterTasks(tasks, options);
    
    // ソート
    if (options?.sortBy) {
      tasks = this.sortTasks(tasks, options.sortBy, options.sortOrder || 'asc');
    }
    
    return tasks;
  }

  /**
   * IDによるタスクの取得
   * @param id タスクID
   * @returns タスクオブジェクトまたはnull
   */
  async getTaskById(id: string): Promise<Task | null> {
    const tasks = await this.getAllTasks();
    return tasks.find(task => task.id === id) || null;
  }

  /**
   * タスクの作成
   * @param taskData 作成するタスクのデータ
   * @returns 作成されたタスク
   */
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
    
    // 新しいタグを自動的に登録
    if (this.tagService && newTask.tags && newTask.tags.length > 0) {
      await this.registerNewTags(newTask.tags);
    }
    
    logger.info(`タスクが作成されました: ${newTask.id}`);
    return newTask;
  }

  /**
   * タスクの更新
   * @param id 更新するタスクのID
   * @param taskData 更新データ
   * @returns 更新されたタスクまたはnull
   */
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
    
    // 新しいタグを自動的に登録
    if (this.tagService && updatedTask.tags && updatedTask.tags.length > 0) {
      await this.registerNewTags(updatedTask.tags);
    }
    
    logger.info(`タスクが更新されました: ${id}`);
    return updatedTask;
  }

  /**
   * タスクの削除
   * @param id 削除するタスクのID
   * @returns 削除成功の場合true、タスクが見つからない場合false
   */
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

  /**
   * タスクの完了状態の切り替え
   * @param id タスクID
   * @returns 更新されたタスクまたはnull
   */
  async toggleTaskCompletion(id: string): Promise<Task | null> {
    const task = await this.getTaskById(id);
    
    if (!task) {
      return null;
    }
    
    return this.updateTask(id, { completed: !task.completed });
  }

  /**
   * タスクのメモ更新
   * @param id タスクID
   * @param memo 新しいメモ内容
   * @returns 更新されたタスクまたはnull
   */
  async updateTaskMemo(id: string, memo: string): Promise<Task | null> {
    const task = await this.getTaskById(id);
    
    if (!task) {
      return null;
    }
    
    return this.updateTask(id, { memo });
  }
  
  /**
   * タグ一覧の取得
   * @returns タグの配列
   */
  async getTags(): Promise<string[]> {
    const tasks = await this.getAllTasks();
    const tagsSet = new Set<string>();
    
    tasks.forEach(task => {
      if (task.tags && task.tags.length > 0) {
        task.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    
    return Array.from(tagsSet);
  }
  
  /**
   * タグでタスクを検索
   * @param tag 検索するタグ
   * @returns タスクの配列
   */
  async getTasksByTag(tag: string): Promise<Task[]> {
    return this.getAllTasks({ tags: [tag] });
  }
  
  /**
   * データのバックアップを作成
   * @returns バックアップファイル名
   */
  async createBackup(): Promise<string> {
    const tasksFile = await this.getTasksFilename();
    return this.fileService.createBackup(tasksFile);
  }
  
  /**
   * バックアップからデータを復元
   * @param backupFilename バックアップファイル名
   */
  async restoreFromBackup(backupFilename: string): Promise<void> {
    const tasksFile = await this.getTasksFilename();
    await this.fileService.restoreFromBackup(backupFilename, tasksFile);
  }
  
  /**
   * 利用可能なバックアップ一覧を取得
   * @returns バックアップファイル名の配列
   */
  async listBackups(): Promise<string[]> {
    const tasksFile = await this.getTasksFilename();
    return this.fileService.listBackups(tasksFile);
  }
  
  /**
   * タスクデータをエクスポート
   * @returns タスクの配列
   */
  async exportTasks(): Promise<Task[]> {
    return this.getAllTasks();
  }
  
  /**
   * タスクデータをインポート
   * @param tasks インポートするタスクの配列
   */
  async importTasks(tasks: Task[]): Promise<void> {
    const tasksFile = await this.getTasksFilename();
    // バックアップを作成してから上書き
    await this.createBackup();
    await this.fileService.writeFile(tasksFile, tasks);
    logger.info(`${tasks.length}件のタスクをインポートしました`);
  }
}
