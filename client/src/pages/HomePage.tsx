import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../contexts/TaskContext';
import { useTaskActions } from '../hooks/useTaskActions';
import { Priority, Task } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import TaskForm from '../components/tasks/TaskForm';
import './HomePage.css';

const HomePage: React.FC = () => {
  const { tasks, loading, error } = useTaskContext();
  const { fetchTasks, addTask, toggleTaskCompletion, deleteTask, updateTask } = useTaskActions();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // 初回ロード時にタスク一覧を取得
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // クイック追加ハンドラー
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle, Priority.Medium);
      setNewTaskTitle('');
    }
  };

  // タスク作成ハンドラー
  const handleCreateTask = async (taskData: Partial<Task>) => {
    setIsSubmitting(true);
    try {
      await addTask(taskData.title!, taskData.priority!, taskData.category, taskData.dueDate, taskData.memo);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('タスク作成エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // タスク編集ハンドラー
  const handleEditTask = async (taskData: Partial<Task>) => {
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
  };

  // タスク編集モーダルを開く
  const openEditModal = (task: Task) => {
    setCurrentTask(task);
    setIsEditModalOpen(true);
  };

  // タスク削除ハンドラー
  const handleDeleteTask = (id: string) => {
    if (window.confirm('このタスクを削除してもよろしいですか？')) {
      deleteTask(id);
    }
  };

  // タスク詳細ページへの遷移ハンドラー
  const handleViewTaskDetails = (id: string) => {
    navigate(`/tasks/${id}`);
  };

  // ローディング中の表示
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>読み込み中...</p>
      </div>
    );
  }

  // エラー時の表示
  if (error) {
    return (
      <div className="error-container">
        <h2>エラーが発生しました</h2>
        <p>{error.message}</p>
        <Button onClick={() => fetchTasks(true)}>再読み込み</Button>
      </div>
    );
  }

  return (
    <div className="home-page">
      <h1>タスク管理</h1>
      
      <div className="task-actions-container">
        <form className="quick-add-form" onSubmit={handleQuickAdd}>
          <Input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="新しいタスクを入力..."
            label="クイック追加"
            fullWidth
          />
          <Button type="submit" variant="primary">
            追加
          </Button>
        </form>
        
        <Button 
          variant="secondary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          詳細作成
        </Button>
      </div>

      <div className="task-list">
        <h2>タスク一覧</h2>
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>タスクはありません</p>
            <p>新しいタスクを追加してください</p>
          </div>
        ) : (
          <ul className="task-items">
            {tasks.map((task) => (
              <li
                key={task.id}
                className={`task-item ${task.completed ? 'completed' : ''}`}
              >
                <div 
                  className="task-item-content"
                  onClick={() => handleViewTaskDetails(task.id)}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => {
                      e.stopPropagation(); // クリックイベントの伝播を停止
                      toggleTaskCompletion(task.id);
                    }}
                    className="task-checkbox"
                    aria-label={`${task.title}を${task.completed ? '未完了' : '完了'}としてマーク`}
                  />
                  <span className="task-title">{task.title}</span>
                  
                  <div className="task-meta">
                    {task.priority && (
                      <span className={`task-priority priority-${task.priority}`}>
                        {task.priority === Priority.High
                          ? '高'
                          : task.priority === Priority.Medium
                          ? '中'
                          : '低'}
                      </span>
                    )}
                    
                    {task.dueDate && (
                      <span className="task-due-date">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="task-actions">
                  <Button
                    variant="text"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // クリックイベントの伝播を停止
                      openEditModal(task);
                    }}
                  >
                    編集
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // クリックイベントの伝播を停止
                      handleViewTaskDetails(task.id);
                    }}
                  >
                    詳細
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // クリックイベントの伝播を停止
                      handleDeleteTask(task.id);
                    }}
                  >
                    削除
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

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
    </div>
  );
};

export default HomePage;
