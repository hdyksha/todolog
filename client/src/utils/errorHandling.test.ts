import { describe, it, expect, vi } from 'vitest';
import { getErrorMessage, handleApiError, handleApiErrorWithId, logError } from './errorHandling';

describe('errorHandling ユーティリティ', () => {
  describe('getErrorMessage', () => {
    it('Error オブジェクトからメッセージを抽出する', () => {
      const error = new Error('テストエラー');
      expect(getErrorMessage(error)).toBe('テストエラー');
    });

    it('文字列をそのまま返す', () => {
      expect(getErrorMessage('エラーメッセージ')).toBe('エラーメッセージ');
    });

    it('未知の型の場合はデフォルトメッセージを返す', () => {
      expect(getErrorMessage(null)).toBe('不明なエラーが発生しました');
      expect(getErrorMessage(undefined)).toBe('不明なエラーが発生しました');
      expect(getErrorMessage({})).toBe('不明なエラーが発生しました');
    });

    it('カスタムデフォルトメッセージを使用する', () => {
      expect(getErrorMessage(null, 'カスタムエラー')).toBe('カスタムエラー');
    });
  });

  describe('handleApiError', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('エラーメッセージを含むErrorオブジェクトを返す', () => {
      const result = handleApiError(new Error('APIエラー'), 'データ取得');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('APIエラー');
    });

    it('エラーをコンソールに記録する', () => {
      const error = new Error('APIエラー');
      handleApiError(error, 'データ取得');
      expect(console.error).toHaveBeenCalledWith('データ取得に失敗しました:', error);
    });

    it('未知のエラー型の場合は操作名を含むメッセージを返す', () => {
      const result = handleApiError(null, 'データ取得');
      expect(result.message).toBe('データ取得に失敗しました');
    });
  });

  describe('handleApiErrorWithId', () => {
    it('IDとエラーを含むオブジェクトを返す', () => {
      const result = handleApiErrorWithId(new Error('APIエラー'), 'タスク更新', '123');
      expect(result).toHaveProperty('id', '123');
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe('APIエラー');
    });
  });

  describe('logError', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('コンテキスト付きでエラーをコンソールに記録する', () => {
      const error = new Error('テストエラー');
      logError(error, 'TaskComponent');
      expect(console.error).toHaveBeenCalledWith('[TaskComponent]', error);
    });
  });
});
