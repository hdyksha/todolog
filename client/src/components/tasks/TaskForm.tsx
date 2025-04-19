import React, { useState, useEffect } from 'react';
import { Task, Priority } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import './TaskForm.css';

interface TaskFormProps {
  task?: Task;
  onSubmit: (taskData: Partial<Task>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [memo, setMemo] = useState('');
  const [titleError, setTitleError] = useState('');

  // 編集モードの場合、既存のタスクデータをフォームに設定
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setPriority(task.priority);
      setCategory(task.category || '');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setMemo(task.memo || '');
    }
  }, [task]);

  const validateForm = (): boolean => {
    let isValid = true;
    
    // タイトルのバリデーション
    if (!title.trim()) {
      setTitleError('タイトルは必須です');
      isValid = false;
    } else {
      setTitleError('');
    }
    
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const taskData: Partial<Task> = {
      title: title.trim(),
      priority,
    };
    
    if (category) {
      taskData.category = category;
    }
    
    if (dueDate) {
      taskData.dueDate = new Date(dueDate).toISOString();
    }
    
    if (memo) {
      taskData.memo = memo;
    }
    
    onSubmit(taskData);
  };

  return (
    <form className="task-form-container" onSubmit={handleSubmit}>
      <div className="form-group">
        <Input
          type="text"
          label="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={titleError}
          required
          fullWidth
          autoFocus
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">優先度</label>
        <div className="priority-selector">
          <label className={`priority-option ${priority === Priority.Low ? 'selected' : ''}`}>
            <input
              type="radio"
              name="priority"
              value={Priority.Low}
              checked={priority === Priority.Low}
              onChange={() => setPriority(Priority.Low)}
            />
            <span className="priority-label priority-low">低</span>
          </label>
          
          <label className={`priority-option ${priority === Priority.Medium ? 'selected' : ''}`}>
            <input
              type="radio"
              name="priority"
              value={Priority.Medium}
              checked={priority === Priority.Medium}
              onChange={() => setPriority(Priority.Medium)}
            />
            <span className="priority-label priority-medium">中</span>
          </label>
          
          <label className={`priority-option ${priority === Priority.High ? 'selected' : ''}`}>
            <input
              type="radio"
              name="priority"
              value={Priority.High}
              checked={priority === Priority.High}
              onChange={() => setPriority(Priority.High)}
            />
            <span className="priority-label priority-high">高</span>
          </label>
        </div>
      </div>
      
      <div className="form-group">
        <Input
          type="text"
          label="カテゴリ"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="カテゴリを入力（オプション）"
          fullWidth
        />
      </div>
      
      <div className="form-group">
        <Input
          type="date"
          label="期限"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          fullWidth
        />
      </div>
      
      <div className="form-group">
        <label className="form-label" htmlFor="task-memo">
          メモ
        </label>
        <textarea
          id="task-memo"
          className="form-textarea"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="メモを入力（オプション）"
          rows={4}
        />
      </div>
      
      <div className="form-actions">
        <Button
          type="button"
          variant="text"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? '保存中...' : task ? '更新' : '作成'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
