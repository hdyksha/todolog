import { useState, useEffect } from 'react';
import { Tag } from '../types';
import { api } from '../services/api';

/**
 * タグ情報を取得・管理するカスタムフック
 * @returns タグ情報とタグ操作関数
 */
export const useTags = () => {
  const [tags, setTags] = useState<Record<string, Tag>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // タグ情報の取得
  useEffect(() => {
    const loadTags = async () => {
      try {
        setLoading(true);
        const tagsData = await api.fetchTags();
        
        // タグデータをオブジェクト形式に変換
        const tagsObject: Record<string, Tag> = {};
        Object.entries(tagsData).forEach(([id, tagData]) => {
          tagsObject[id] = tagData;
        });
        
        setTags(tagsObject);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch tags:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch tags'));
      } finally {
        setLoading(false);
      }
    };

    loadTags();
  }, []);

  return {
    tags,
    loading,
    error
  };
};
