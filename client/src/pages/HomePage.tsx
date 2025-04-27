import type React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../contexts/TaskContext';
import { useTaskActions } from '../hooks/useTaskActions';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { useKeyboardShortcuts } from '../contexts/KeyboardShortcutsContext';
import { useTagStats } from '../hooks/useTagStats';
import { useTags } from '../hooks/useTags';
import { Task, Priority } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import TaskForm from '../components/tasks/TaskForm';
import ArchiveSection from '../components/archive/ArchiveSection';
import TaskQuickAdd from '../components/tasks/TaskQuickAdd';
import TaskFilterBar from '../components/tasks/TaskFilterBar';
import ActiveTaskList from '../components/tasks/ActiveTaskList';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import api from '../services/api';
import './HomePage.css';

const HomePage: React.FC = () => {
  const { tasks, loading, error } = useTaskContext();
  const { fetchTasks, addTask, toggleTaskCompletion, deleteTask, updateTask } = useTaskActions();
  const { tags } = useTags();
  const { usage: tagUsage } = useTagStats(tasks, tags);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  // タスクのフィルタリングとソート
  const {
    filters,
    setFilters,
    resetFilters,
    sort,
    setSort,
    sortedTasks,
  } = useTaskFilters(tasks);

  // 初回ロード時にタスク一覧を取得
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // キーボードショートカットの設定
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();
  
  useEffect(() => {
    // タスク作成ショートカット
    registerShortcut({
      key: 'n',
      action: () => setIsCreateModalOpen(true),
      description: '新しいタスクを作成',
      scope: 'タスク一覧'
    });
    
    // フィルターリセットショートカット
    registerShortcut({
      key: 'r',
      action: resetFilters,
      description: 'フィルターをリセット',
      scope: 'タスク一覧'
    });
    
    // クリーンアップ関数
    return () => {
      unregisterShortcut('n');
      unregisterShortcut('r');
    };
  }, [registerShortcut, unregisterShortcut, resetFilters]);

  // キーボードショートカットからのタスク作成モーダルを開くイベントリスナー
  useEffect(() => {
    const handleOpenCreateTaskModal = () => {
      setIsCreateModalOpen(true);
    };

    window.addEventListener('openCreateTaskModal', handleOpenCreateTaskModal);

    return () => {
      window.removeEventListener('openCreateTaskModal', handleOpenCreateTaskModal);
    };
  }, []);

  // クイック追加ハンドラー
  const handleQuickAdd = useCallback(async (title: string, priority: Priority) => {
    return await addTask(title, priority);
  }, [addTask]);

  // タスク作成ハンドラー
  const handleCreateTask = useCallback(async (taskData: Partial<Task>) => {
    setIsSubmitting(true);
    try {
      await addTask(taskData.title!, taskData.priority!, taskData.tags, taskData.dueDate, taskData.memo);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('タスク作成エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [addTask]);

  // タスク編集ハンドラー
  const handleEditTask = useCallback(async (taskData: Partial<Task>) => {
    if (!currentTask) return;
    
    setIsSubmitting(true);
    try {
      await updateTask({
        ...currentTask,
        ...taskData,
      });
      setIsEditModalOpen(false);
      setCurrentTask(null);
    } catch (error) {
      console.error('タスク更新エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentTask, updateTask]);

  // タスク編集モーダルを開く
  const openEditModal = useCallback(async (task: Task) => {
    try {
      // タスクの詳細情報を取得（メモを含む完全なデータ）
      const taskDetail = await api.fetchTaskById(task.id);
      setCurrentTask(taskDetail);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('タスク詳細の取得エラー:', error);
    }
  }, []);

  // タスク削除確認ダイアログを開く
  const openDeleteConfirm = useCallback((id: string) => {
    setTaskToDelete(id);
    setIsDeleteConfirmOpen(true);
  }, []);

  // タスク削除ハンドラー
  const handleDeleteTask = useCallback(async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  }, [taskToDelete, deleteTask]);

  // タスク詳細ページへの遷移ハンドラー
  const handleViewTaskDetails = useCallback((id: string) => {
    navigate(`/tasks/${id}`);
  }, [navigate]);

  // カテゴリでフィルタリング
  const handleCategoryClick = useCallback((tag: string) => {
    setFilters({ ...filters, tags: [tag] });
  }, [filters, setFilters]);

  // ローディング中の表示
  if (loading) {
    return <LoadingIndicator message="タスクを読み込み中..." />;
  }

  // エラー時の表示
  if (error) {
    return (
      <ErrorDisplay
        message={error.message}
        onRetry={() => fetchTasks(true)}
      />
    );
  }

  return (
    <div className="home-page">
      <h1>タスク管理</h1>
      
      <div className="task-actions-container">
        <TaskQuickAdd onAddTask={handleQuickAdd} />
        
        <Button 
          variant="secondary"
          onClick={() => setIsCreateModalOpen(true)}
          type="button"
        >
          詳細作成
        </Button>
      </div>

      {/* フィルターバー */}
      <TaskFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={resetFilters}
        sort={sort}
        onSortChange={setSort}
        availableTags={tags}
        tagUsage={tagUsage}
      />

      {/* アクティブなタスクリスト */}
      <ActiveTaskList
        tasks={sortedTasks}
        onToggleComplete={toggleTaskCompletion}
        onDelete={openDeleteConfirm}
        onEdit={openEditModal}
        onViewDetails={handleViewTaskDetails}
        onTagClick={handleCategoryClick}
        onClearFilters={resetFilters}
        allTasksCount={tasks.length}
      />

      {/* アーカイブセクション */}
      <ArchiveSection
        tasks={sortedTasks}
        onToggleComplete={toggleTaskCompletion}
        onDelete={openDeleteConfirm}
        onEdit={openEditModal}
        onEditMemo={handleViewTaskDetails}
      />

      {/* タスク作成モーダル */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="新しいタスクを作成"
      >
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setIsCreateModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* タスク編集モーダル */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="タスクを編集"
      >
        {currentTask && (
          <TaskForm
            task={currentTask}
            onSubmit={handleEditTask}
            onCancel={() => setIsEditModalOpen(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteTask}
        title="タスクの削除"
        message="このタスクを削除してもよろしいですか？この操作は元に戻せません。"
        confirmLabel="削除"
        cancelLabel="キャンセル"
        variant="danger"
      />
    </div>
  );
};

export default HomePage;
