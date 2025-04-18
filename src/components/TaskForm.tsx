import React, { useState, useEffect } from 'react';
import { Task, Priority } from '../types';
import './TaskForm.css';

interface TaskFormProps {
  task?: Task;
  categories: string[];
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  categories,
  onSave,
  onCancel,
}) => {
  // フォームの状態
  const [title, setTitle] = useState(task?.title || '');
  const [priority, setPriority] = useState<Priority>(task?.priority || Priority.Medium);
  const [category, setCategory] = useState(task?.category || '');
  const [newCategory, setNewCategory] = useState('');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );
  const [memo, setMemo] = useState(task?.memo || '');
  const [completed, setCompleted] = useState(task?.completed || false);
  const [showNewCategory, setShowNewCategory] = useState(false);

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

    // カテゴリの処理
    const finalCategory = showNewCategory ? newCategory : category;

    // タスクオブジェクトの作成
    const taskData = {
      id: task?.id,
      title: title.trim(),
      priority,
      category: finalCategory || undefined,
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
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            <option value={Priority.High}>高</option>
            <option value={Priority.Medium}>中</option>
            <option value={Priority.Low}>低</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="category">カテゴリ</label>
          {!showNewCategory ? (
            <>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">カテゴリなし</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="link-button"
                onClick={() => setShowNewCategory(true)}
              >
                新しいカテゴリを作成
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="新しいカテゴリ名"
              />
              <button
                type="button"
                className="link-button"
                onClick={() => setShowNewCategory(false)}
              >
                既存のカテゴリから選択
              </button>
            </>
          )}
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
