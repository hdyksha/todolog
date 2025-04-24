import { useState, useCallback, useMemo } from 'react';
import { Task, Priority } from '../types';
import { FilterOptions } from '../components/filters/FilterPanel';
import { SortOption } from '../components/tasks/TaskSortControl';

// デフォルトのフィルター設定
const defaultFilters: FilterOptions = {
  priority: 'all',
  tags: [],
  searchTerm: '',
};

// デフォルトのソート設定
const defaultSort: SortOption = {
  field: 'createdAt',
  direction: 'desc',
};

export const useTaskFilters = (tasks: Task[]) => {
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [sort, setSort] = useState<SortOption>(defaultSort);

  // フィルターのリセット
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // フィルター適用済みのタスク一覧を取得
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 優先度でフィルタリング
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }

      // タグでフィルタリング
      if (filters.tags && filters.tags.length > 0) {
        // タスクにタグがない場合はフィルタリング対象外
        if (!task.tags || task.tags.length === 0) {
          // 後方互換性のためにcategoryをチェック
          if (task.category && filters.tags.includes(task.category)) {
            // カテゴリがタグとして選択されている場合は表示
            return true;
          }
          return false;
        }
        
        // 選択されたタグのいずれかがタスクのタグに含まれているかチェック
        const hasMatchingTag = filters.tags.some(tag => 
          task.tags?.includes(tag) || task.category === tag
        );
        
        if (!hasMatchingTag) {
          return false;
        }
      }

      // 検索語でフィルタリング
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(searchLower);
        const memoMatch = task.memo
          ? task.memo.toLowerCase().includes(searchLower)
          : false;
        const categoryMatch = task.category
          ? task.category.toLowerCase().includes(searchLower)
          : false;
        const tagsMatch = task.tags
          ? task.tags.some(tag => tag.toLowerCase().includes(searchLower))
          : false;

        if (!titleMatch && !memoMatch && !categoryMatch && !tagsMatch) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filters]);

  // ソート適用済みのタスク一覧を取得
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'dueDate':
          // 期限がないタスクは後ろに表示
          if (!a.dueDate && !b.dueDate) {
            comparison = 0;
          } else if (!a.dueDate) {
            comparison = 1;
          } else if (!b.dueDate) {
            comparison = -1;
          } else {
            comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          }
          break;
        case 'priority':
          // 優先度の数値変換（High: 3, Medium: 2, Low: 1）
          const getPriorityValue = (priority: Priority): number => {
            switch (priority) {
              case Priority.High:
                return 3;
              case Priority.Medium:
                return 2;
              case Priority.Low:
                return 1;
              default:
                return 0;
            }
          };
          comparison = getPriorityValue(a.priority) - getPriorityValue(b.priority);
          break;
        default:
          comparison = 0;
      }

      // ソート方向の適用
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredTasks, sort]);

  return {
    filters,
    setFilters,
    resetFilters,
    sort,
    setSort,
    filteredTasks,
    sortedTasks,
  };
};
