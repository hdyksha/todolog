import { Tag } from '../types';
import api from './api';

export const tagService = {
  /**
   * すべてのタグを取得
   */
  async getAllTags(): Promise<Record<string, Tag>> {
    const response = await fetch('/api/tags');
    if (!response.ok) {
      throw new Error('タグの取得に失敗しました');
    }
    return response.json();
  },

  /**
   * 新しいタグを作成
   */
  async createTag(name: string, tag: Tag): Promise<Tag> {
    const response = await fetch(`/api/tags/${encodeURIComponent(name)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tag),
    });
    
    if (!response.ok) {
      throw new Error('タグの作成に失敗しました');
    }
    
    return response.json();
  },

  /**
   * タグを更新
   */
  async updateTag(name: string, tag: Tag): Promise<Tag> {
    const response = await fetch(`/api/tags/${encodeURIComponent(name)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tag),
    });
    
    if (!response.ok) {
      throw new Error('タグの更新に失敗しました');
    }
    
    return response.json();
  },

  /**
   * タグを削除
   */
  async deleteTag(name: string): Promise<void> {
    const response = await fetch(`/api/tags/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('タグの削除に失敗しました');
    }
  },

  /**
   * タグの使用状況を取得
   */
  async getTagUsage(): Promise<Record<string, number>> {
    const response = await fetch('/api/tags/usage');
    
    if (!response.ok) {
      throw new Error('タグの使用状況の取得に失敗しました');
    }
    
    return response.json();
  }
};
