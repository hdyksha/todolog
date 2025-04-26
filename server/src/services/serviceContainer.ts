/**
 * サービスコンテナ - アプリケーション全体で共有されるサービスインスタンスを管理
 */

import { SettingsService } from './settingsService.js';
import { FileService } from './fileService.js';
import { TaskService } from './taskService.js';
import { TagService } from './tagService.js';
import path from 'path';
import os from 'os';
import { logger } from '../utils/logger.js';

// シングルトンインスタンス
let settingsServiceInstance: SettingsService | null = null;
let fileServiceInstance: FileService | null = null;
let taskServiceInstance: TaskService | null = null;
let tagServiceInstance: TagService | null = null;

// 初期化済みフラグ
let isInitialized = false;

// 初期化時の設定ディレクトリ（変更検出用）
let currentSettingsDir: string | null = null;
let currentSettingsFile: string | null = null;

/**
 * サービスコンテナの初期化
 * @param options 初期化オプション
 */
export function initializeServices(options: {
  settingsDir?: string;
  settingsFile?: string;
} = {}) {
  // 設定ディレクトリの設定
  const settingsDir = options.settingsDir || process.env.SETTINGS_DIR || path.join(os.homedir(), '.todolog');
  const settingsFile = options.settingsFile || process.env.SETTINGS_FILE || 'settings.json';
  
  // 既に同じ設定で初期化されている場合はスキップ
  if (isInitialized && settingsDir === currentSettingsDir && settingsFile === currentSettingsFile) {
    return;
  }
  
  // 既に初期化されている場合はリセット
  if (isInitialized) {
    resetServices();
  }
  
  logger.debug(`サービスコンテナを初期化します: settingsDir=${settingsDir}, settingsFile=${settingsFile}`);
  
  // 現在の設定を保存
  currentSettingsDir = settingsDir;
  currentSettingsFile = settingsFile;
  
  // SettingsServiceの初期化
  settingsServiceInstance = new SettingsService(settingsDir, settingsFile);
  
  // FileServiceの初期化
  fileServiceInstance = new FileService(undefined, settingsServiceInstance);
  
  // TagServiceの初期化
  tagServiceInstance = new TagService(fileServiceInstance);
  
  // TaskServiceの初期化
  taskServiceInstance = new TaskService(
    fileServiceInstance,
    settingsServiceInstance,
    tagServiceInstance
  );
  
  // TagServiceにTaskServiceを設定（循環参照を解決）
  tagServiceInstance.setTaskService(taskServiceInstance);
  
  isInitialized = true;
}

/**
 * SettingsServiceのインスタンスを取得
 */
export function getSettingsService(): SettingsService {
  if (!settingsServiceInstance) {
    initializeServices();
  }
  return settingsServiceInstance!;
}

/**
 * FileServiceのインスタンスを取得
 */
export function getFileService(): FileService {
  if (!fileServiceInstance) {
    initializeServices();
  }
  return fileServiceInstance!;
}

/**
 * TaskServiceのインスタンスを取得
 */
export function getTaskService(): TaskService {
  if (!taskServiceInstance) {
    initializeServices();
  }
  return taskServiceInstance!;
}

/**
 * TagServiceのインスタンスを取得
 */
export function getTagService(): TagService {
  if (!tagServiceInstance) {
    initializeServices();
  }
  return tagServiceInstance!;
}

/**
 * テスト用にサービスをリセット
 */
export function resetServices() {
  settingsServiceInstance = null;
  fileServiceInstance = null;
  taskServiceInstance = null;
  tagServiceInstance = null;
  isInitialized = false;
  currentSettingsDir = null;
  currentSettingsFile = null;
}
