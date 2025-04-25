import { useMemo } from 'react';
import { Task, Tag } from '../types';

interface TagStats {
  usage: Record<string, number>;
  mostUsed: string[];
  leastUsed: string[];
}

/**
 * タグの使用統計情報を計算するカスタムフック
 */
export const useTagStats = (
  tasks: Task[],
  availableTags: Record<string, Tag>
): TagStats => {
  // タグの使用回数を集計
  const tagUsage = useMemo(() => {
    const usage: Record<string, number> = {};
    
    // 初期化（すべてのタグを0回で初期化）
    Object.keys(availableTags).forEach(tag => {
      usage[tag] = 0;
    });
    
    // タスクからタグの使用回数を集計
    tasks.forEach(task => {
      if (task.tags && task.tags.length > 0) {
        task.tags.forEach(tag => {
          if (usage[tag] !== undefined) {
            usage[tag]++;
          } else {
            // 存在しないタグ（削除されたタグなど）は無視
            console.warn(`Unknown tag: ${tag}`);
          }
        });
      }
    });
    
    return usage;
  }, [tasks, availableTags]);
  
  // 使用頻度でソートしたタグリスト
  const sortedTags = useMemo(() => {
    return Object.entries(tagUsage)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
  }, [tagUsage]);
  
  // 最も使用されているタグ（上位5件）
  const mostUsed = useMemo(() => {
    return sortedTags.filter(tag => tagUsage[tag] > 0).slice(0, 5);
  }, [sortedTags, tagUsage]);
  
  // 最も使用されていないタグ（下位5件、使用回数0のタグは除外）
  const leastUsed = useMemo(() => {
    return [...sortedTags]
      .filter(tag => tagUsage[tag] > 0)
      .reverse()
      .slice(0, 5);
  }, [sortedTags, tagUsage]);
  
  return {
    usage: tagUsage,
    mostUsed,
    leastUsed
  };
};
