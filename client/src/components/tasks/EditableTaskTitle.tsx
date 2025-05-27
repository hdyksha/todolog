import React, { useState, useRef, useEffect } from 'react';
import './EditableTaskTitle.css';

interface EditableTaskTitleProps {
  title: string;
  onSave: (newTitle: string) => Promise<void>;
}

/**
 * 編集可能なタスクタイトルコンポーネント
 * クリックすると編集モードになり、タイトルを変更できる
 */
const EditableTaskTitle: React.FC<EditableTaskTitleProps> = ({ title, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 編集モードになったら入力フィールドにフォーカス
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // カーソルを末尾に配置
      inputRef.current.setSelectionRange(
        editedTitle.length,
        editedTitle.length
      );
    }
  }, [isEditing, editedTitle]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(e.target.value);
  };

  const handleSave = async () => {
    // 空のタイトルは保存しない
    if (!editedTitle.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    // 変更がない場合は編集モードを終了するだけ
    if (editedTitle === title) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(editedTitle);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タイトルの更新に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditedTitle(title); // 元のタイトルに戻す
      setIsEditing(false);
      setError(null);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  return (
    <div className="editable-task-title">
      {isEditing ? (
        <div className="editable-task-title__input-container">
          <input
            ref={inputRef}
            type="text"
            value={editedTitle}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={`editable-task-title__input ${error ? 'editable-task-title__input--error' : ''}`}
            disabled={isSaving}
            aria-label="タスクタイトル"
            data-testid="task-title-input"
          />
          {error && <div className="editable-task-title__error">{error}</div>}
        </div>
      ) : (
        <div className="editable-task-title__header">
          <h1 className="editable-task-title__heading">{title}</h1>
          <button
            className="editable-task-title__edit-button"
            onClick={handleEdit}
            aria-label="タスクタイトルを編集"
            data-testid="task-title-display"
          >
            <span className="editable-task-title__edit-icon">✎</span>
            <span className="visually-hidden">編集</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default EditableTaskTitle;
