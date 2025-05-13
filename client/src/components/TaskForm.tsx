import React, { useState, useEffect } from 'react';
import { Task, Priority, Tag } from '../types';
import UnifiedTagInput from './tags/UnifiedTagInput';
import EditablePriority from './tasks/EditablePriority';
import './TaskForm.css';

interface TaskFormProps {
  task?: Task;
  availableTags: Record<string, Tag>;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  availableTags,
  onSave,
  onCancel,
}) => {
  // フォームの状態
  const [title, setTitle] = useState(task?.title || '');
  const [priority, setPriority] = useState<Priority>(task?.priority || Priority.Medium);
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );
  const [memo, setMemo] = useState(task?.memo || '');
  const [completed, setCompleted] = useState(task?.completed || false);

  // バリデーション状態
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // タイトル入力のバリデーション
  useEffect(() => {
    if (title.trim() && errors.title) {
      setErrors((prev) => ({ ...prev, title: '' }));
    }
  }, [title, errors.title]);

  // フォーム送信ハンドラー
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) {
      newErrors.title = 'タイトルは必須です';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 日付の処理
    let parsedDueDate: Date | undefined = undefined;
    if (dueDate) {
      parsedDueDate = new Date(dueDate);
    }

    // タスクオブジェクトの作成
    const taskData = {
      id: task?.id,
      title: title.trim(),
      priority,
      tags: tags.length > 0 ? tags : undefined,
      dueDate: parsedDueDate,
      memo: memo.trim() || undefined,
      completed,
    };

    onSave(taskData);
  };

  return (
    <div className="task-form-container">
      <form className="task-form" onSubmit={handleSubmit}>
        <h2>{task ? 'タスクを編集' : '新しいタスク'}</h2>

        <div className="form-group">
          <label htmlFor="title">
            タイトル <span className="required">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <p className="error-message">{errors.title}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="priority">優先度</label>
          <EditablePriority
            priority={priority}
            onSave={(newPriority) => setPriority(newPriority)}
            inline={false}
            className="form-priority-selector"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">タグ</label>
          <UnifiedTagInput
            selectedTags={tags}
            onChange={setTags}
            placeholder="タグを追加..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">期限</label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="memo">メモ</label>
          <textarea
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={5}
          />
        </div>

        {task && (
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
              />
              完了
            </label>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            キャンセル
          </button>
          <button type="submit" className="save-button">
            {task ? '更新' : '作成'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
