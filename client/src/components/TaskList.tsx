import React, { useState } from 'react';
import { Task, TaskFilter, TaskSort, Priority } from '../types';
import TaskItem from './TaskItem';
import './TaskList.css';

interface TaskListProps {
  tasks: Task[];
  filter: TaskFilter;
  sort: TaskSort;
  categories: string[];
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string) => void;
  onEditMemo?: (id: string) => void;
  onFilterChange: (filter: TaskFilter) => void;
  onSortChange: (sort: TaskSort) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  filter,
  sort,
  categories,
  onToggleComplete,
  onDeleteTask,
  onEditTask,
  onEditMemo,
  onFilterChange,
  onSortChange,
}) => {
  // アーカイブセクションの表示状態
  const [isArchiveVisible, setIsArchiveVisible] = useState(true);
  
  // タスクをアクティブとアーカイブに分類
  const activeTasks = tasks.filter(task => !task.completed);
  const archivedTasks = tasks.filter(task => task.completed);
  
  // フィルターの変更ハンドラー
  const handleStatusChange = (status: 'all' | 'completed' | 'active') => {
    onFilterChange({ ...filter, status });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({
      ...filter,
      priority: value === 'all' ? undefined : value as Priority,
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({
      ...filter,
      category: value === 'all' ? undefined : value,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filter,
      searchTerm: e.target.value || undefined,
    });
  };

  // ソートの変更ハンドラー
  const handleSortFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange({
      ...sort,
      field: e.target.value as TaskSort['field'],
    });
  };

  const handleSortDirectionChange = () => {
    onSortChange({
      ...sort,
      direction: sort.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2>タスク一覧</h2>
        <div className="task-filters">
          <div className="filter-group">
            <label htmlFor="status-filter">ステータス:</label>
            <div className="status-buttons">
              <button
                className={filter.status === 'all' ? 'active' : ''}
                onClick={() => handleStatusChange('all')}
              >
                すべて
              </button>
              <button
                className={filter.status === 'active' ? 'active' : ''}
                onClick={() => handleStatusChange('active')}
              >
                未完了
              </button>
              <button
                className={filter.status === 'completed' ? 'active' : ''}
                onClick={() => handleStatusChange('completed')}
              >
                完了済み
              </button>
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="priority-filter">優先度:</label>
            <select
              id="priority-filter"
              value={filter.priority || 'all'}
              onChange={handlePriorityChange}
            >
              <option value="all">すべて</option>
              <option value={Priority.High}>高</option>
              <option value={Priority.Medium}>中</option>
              <option value={Priority.Low}>低</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="category-filter">カテゴリ:</label>
            <select
              id="category-filter"
              value={filter.category || 'all'}
              onChange={handleCategoryChange}
            >
              <option value="all">すべて</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="search-filter">検索:</label>
            <input
              id="search-filter"
              type="text"
              placeholder="タスクを検索..."
              value={filter.searchTerm || ''}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="task-sort">
          <label htmlFor="sort-field">並び替え:</label>
          <select
            id="sort-field"
            value={sort.field}
            onChange={handleSortFieldChange}
          >
            <option value="title">タイトル</option>
            <option value="priority">優先度</option>
            <option value="dueDate">期限</option>
            <option value="createdAt">作成日</option>
            <option value="updatedAt">更新日</option>
          </select>
          <button onClick={handleSortDirectionChange}>
            {sort.direction === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* アクティブなタスクセクション */}
      <div className="task-list-section">
        <h2 className="section-title">アクティブなタスク ({activeTasks.length})</h2>
        <div className="tasks">
          {activeTasks.length === 0 ? (
            <p className="no-tasks">アクティブなタスクはありません</p>
          ) : (
            activeTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
                onEditMemo={onEditMemo}
              />
            ))
          )}
        </div>
      </div>

      {/* アーカイブセクション */}
      <div className="archive-section">
        <div 
          className="archive-header"
          onClick={() => setIsArchiveVisible(!isArchiveVisible)}
        >
          <h2 className="section-title">アーカイブ済み ({archivedTasks.length})</h2>
          <button className="toggle-button">
            {isArchiveVisible ? '▼' : '▶'}
          </button>
        </div>
        
        {isArchiveVisible && (
          <div className="tasks archived-tasks">
            {archivedTasks.length === 0 ? (
              <p className="no-tasks">アーカイブされたタスクはありません</p>
            ) : (
              archivedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isArchived={true}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDeleteTask}
                  onEdit={onEditTask}
                  onEditMemo={onEditMemo}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
