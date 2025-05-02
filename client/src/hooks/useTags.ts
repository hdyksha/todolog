import { useState, useEffect } from 'react';
import { Tag } from '../types';
import { api } from '../services/api';
import { useTagContext } from '../contexts/TagContext';

/**
 * タグ情報を取得・管理するカスタムフック
 * @returns タグ情報とタグ操作関数
 */
export const useTags = () => {
  // TagContextからタグ情報を取得
  const { state: { tags: contextTags, loading: contextLoading, error: contextError } } = useTagContext();
  
  // 独自のタグ取得ロジックをバックアップとして保持
  const [tags, setTags] = useState<Record<string, Tag>>(contextTags || {});
  const [loading, setLoading] = useState(contextLoading);
  const [error, setError] = useState<Error | null>(contextError);

  // コンテキストからのタグ情報が更新されたら、ローカルの状態も更新
  useEffect(() => {
    if (contextTags && Object.keys(contextTags).length > 0) {
      setTags(contextTags);
      setLoading(contextLoading);
      setError(contextError);
    }
  }, [contextTags, contextLoading, contextError]);

  // コンテキストからのタグ情報がない場合は、APIから直接取得
  useEffect(() => {
    if (Object.keys(contextTags).length === 0 && !contextLoading && !loading) {
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
    }
  }, [contextTags, contextLoading]);

  return {
    tags,
    loading,
    error
  };
};
