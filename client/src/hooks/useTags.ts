import { useState, useEffect } from 'react';
import { Tag } from '../types';
import { api } from '../services/api';
import { useTagContext } from '../contexts/TagContext';

/**
 * タグ情報を取得・管理するカスタムフック
 * TagContextを唯一の信頼できるソースとして使用し、
 * 必要に応じてAPIからデータを取得してTagContextを更新します。
 * 
 * @returns タグ情報とタグ操作関数
 */
export const useTags = () => {
  // TagContextからタグ情報を取得
  const { state: { tags: contextTags, loading: contextLoading, error: contextError }, dispatch } = useTagContext();
  
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

  // コンテキストからのタグ情報がない場合は、APIから直接取得してコンテキストを更新
  useEffect(() => {
    if (Object.keys(contextTags).length === 0 && !contextLoading && !loading) {
      const loadTags = async () => {
        try {
          setLoading(true);
          dispatch({ type: 'FETCH_TAGS_START' });
          
          const tagsData = await api.fetchTags();
          
          // タグデータをオブジェクト形式に変換
          const tagsObject: Record<string, Tag> = {};
          Object.entries(tagsData).forEach(([id, tagData]) => {
            tagsObject[id] = tagData;
          });
          
          // ローカル状態とコンテキスト両方を更新
          setTags(tagsObject);
          dispatch({ type: 'FETCH_TAGS_SUCCESS', payload: tagsObject });
          setError(null);
        } catch (err) {
          console.error('Failed to fetch tags:', err);
          const error = err instanceof Error ? err : new Error('Failed to fetch tags');
          setError(error);
          dispatch({ type: 'FETCH_TAGS_ERROR', payload: error });
        } finally {
          setLoading(false);
        }
      };

      loadTags();
    }
  }, [contextTags, contextLoading, dispatch]);

  return {
    tags,
    loading,
    error
  };
};
