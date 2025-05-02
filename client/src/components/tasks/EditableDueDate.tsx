import React, { useState, useEffect } from 'react';
import InlineEditableField from '../ui/InlineEditableField';
import './EditableDueDate.css';

interface EditableDueDateProps {
  dueDate: string | null | undefined;
  onSave: (dueDate: string | null) => Promise<void>;
  disabled?: boolean;
}

/**
 * 締切日を編集するためのコンポーネント
 */
const EditableDueDate: React.FC<EditableDueDateProps> = ({
  dueDate,
  onSave,
  disabled = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    dueDate ? new Date(dueDate).toISOString().split('T')[0] : null
  );

  // dueDateが変更されたら選択日付を更新
  useEffect(() => {
    setSelectedDate(dueDate ? new Date(dueDate).toISOString().split('T')[0] : null);
  }, [dueDate]);

  // 表示モードのレンダリング
  const renderDisplay = (value: string | null | undefined, onClick: () => void) => {
    if (disabled) {
      return (
        <span className="due-date-display">
          {value ? new Date(value).toLocaleDateString() : '期限なし'}
        </span>
      );
    }

    return (
      <div
        className="due-date-display editable"
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="締切日を編集"
      >
        {value ? new Date(value).toLocaleDateString() : '期限なし'}
        <span className="edit-icon">✎</span>
      </div>
    );
  };

  // 編集モードのレンダリング
  const renderEdit = (
    value: string | null | undefined,
    onSave: (newValue: string | null) => void,
    onCancel: () => void
  ) => {
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedDate(e.target.value || null);
    };

    const handleRemoveDueDate = () => {
      setSelectedDate(null);
    };

    const handleSave = () => {
      onSave(selectedDate);
    };

    // アニメーション用のクラスを追加
    return (
      <div className="due-date-edit animate-fade-in">
        <div className="due-date-input-container">
          <input
            type="date"
            value={selectedDate || ''}
            onChange={handleDateChange}
            className="due-date-input"
            aria-label="締切日"
          />
          <button
            type="button"
            onClick={handleRemoveDueDate}
            className="remove-due-date-button"
            aria-label="締切日を削除"
          >
            クリア
          </button>
        </div>
        <div className="due-date-actions">
          <button
            type="button"
            onClick={handleSave}
            className="save-button"
            aria-label="締切日を保存"
          >
            保存
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
            aria-label="キャンセル"
          >
            キャンセル
          </button>
        </div>
      </div>
    );
  };

  return (
    <InlineEditableField
      value={dueDate}
      onSave={onSave}
      renderDisplay={renderDisplay}
      renderEdit={renderEdit}
      className="editable-due-date"
    />
  );
};

export default EditableDueDate;
