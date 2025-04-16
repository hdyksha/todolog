import { createTask, validateTask } from '../../types/Task';

describe('Task utility functions', () => {
  describe('createTask', () => {
    test('正しいタスクオブジェクトを作成する', () => {
      const task = createTask('テストタスク');
      
      expect(task).toEqual({
        id: expect.any(String),
        text: 'テストタスク',
        completed: false,
        createdAt: expect.any(String),
      });
      
      // 日付が正しいフォーマットであることを確認
      expect(new Date(task.createdAt).toString()).not.toBe('Invalid Date');
      
      // IDが正しい形式であることを確認
      expect(task.id).toMatch(/^task_\d+_[a-z0-9]+$/);
    });
    
    test('追加データを含めることができる', () => {
      const task = createTask('テストタスク', {
        priority: 'high',
        tags: ['仕事', '重要'],
        notes: 'これはメモです'
      });
      
      expect(task.priority).toBe('high');
      expect(task.tags).toEqual(['仕事', '重要']);
      expect(task.notes).toBe('これはメモです');
    });
  });
  
  describe('validateTask', () => {
    test('有効なタスクを検証する', () => {
      const task = createTask('テストタスク');
      const result = validateTask(task);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
    
    test('テキストが空の場合はエラーを返す', () => {
      const task = createTask('テストタスク');
      task.text = '';
      
      const result = validateTask(task);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'text',
        message: 'タスクのテキストは必須です',
      });
    });
    
    test('テキストが長すぎる場合はエラーを返す', () => {
      const task = createTask('a'.repeat(201));
      
      const result = validateTask(task);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'text',
        message: 'タスクのテキストは200文字以内にしてください',
      });
    });
    
    test('作成日が無効な形式の場合はエラーを返す', () => {
      const task = createTask('テストタスク');
      task.createdAt = 'invalid-date';
      
      const result = validateTask(task);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'createdAt',
        message: '作成日の形式が正しくありません',
      });
    });
    
    test('更新日が無効な形式の場合はエラーを返す', () => {
      const task = createTask('テストタスク');
      task.updatedAt = 'invalid-date';
      
      const result = validateTask(task);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'updatedAt',
        message: '更新日の形式が正しくありません',
      });
    });
    
    test('期限日が無効な形式の場合はエラーを返す', () => {
      const task = createTask('テストタスク');
      task.dueDate = 'invalid-date';
      
      const result = validateTask(task);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'dueDate',
        message: '期限日の形式が正しくありません',
      });
    });
  });
});
