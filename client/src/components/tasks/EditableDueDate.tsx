import React, { useState, useEffect, useRef } from 'react';
import InlineEditableField from '../ui/InlineEditableField';
import './EditableDueDate.css';

interface EditableDueDateProps {
  dueDate: string | null | undefined;
  onSave: (dueDate: string | null) => Promise<void>;
  disabled?: boolean;
}

/**
 * 締切日を編集するためのコンポーネント
 * インラインで編集できるように改良
 */
const EditableDueDate: React.FC<EditableDueDateProps> = ({
  dueDate,
  onSave,
  disabled = false,
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    dueDate ? new Date(dueDate).toISOString().split('T')[0] : null
  );
  const dateInputRef = useRef<HTMLInputElement>(null);

  // dueDateが変更されたら選択日付を更新
  useEffect(() => {
    setSelectedDate(dueDate ? new Date(dueDate).toISOString().split('T')[0] : null);
  }, [dueDate]);

  // カレンダーを開く
  const openCalendar = () => {
    if (disabled) return;
    setIsCalendarOpen(true);
    // 少し遅延させてフォーカスを当てる
    setTimeout(() => {
      if (dateInputRef.current) {
        dateInputRef.current.focus();
      }
    }, 10);
  };

  // 日付の変更を保存
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value || null;
    setSelectedDate(newDate);
    
    if (newDate) {
      onSave(newDate).catch(error => {
        console.error('締切日更新エラー:', error);
      });
    }
    setIsCalendarOpen(false);
  };

  // 日付をクリア
  const handleClearDate = async () => {
    try {
      await onSave(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('締切日クリアエラー:', error);
    } finally {
      setIsCalendarOpen(false);
    }
  };

  // 表示モードのレンダリング
  const renderDisplay = (value: string | null | undefined, onClick: () => void) => {
    if (disabled) {
      return (
        <span className="due-date-display">
          {value ? new Date(value).toLocaleDateString() : '期限なし'}
        </span>
      );
    }

    if (isCalendarOpen) {
      return (
        <div className="due-date-inline-edit">
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate || ''}
            onChange={handleDateChange}
            onBlur={() => setTimeout(() => setIsCalendarOpen(false), 200)}
            className="due-date-input-inline"
            aria-label="締切日"
          />
          <button
            type="button"
            onClick={handleClearDate}
            className="clear-date-button"
            aria-label="締切日をクリア"
          >
            クリア
          </button>
        </div>
      );
    }

    return (
      <div
        className="due-date-display editable"
        onClick={openCalendar}
        role="button"
        tabIndex={0}
        aria-label="締切日を編集"
      >
        {value ? (
          <span className="due-date-value">
            {new Date(value).toLocaleDateString()}
            <span className="edit-icon">✎</span>
          </span>
        ) : (
          <span className="due-date-empty">
            期限を設定
            <span className="edit-icon">+</span>
          </span>
        )}
      </div>
    );
  };

  // 編集モードのレンダリング（インライン編集のため表示と同じ）
  const renderEdit = (
    value: string | null | undefined,
    onSave: (newValue: string | null) => void,
    onCancel: () => void
  ) => {
    return renderDisplay(value, () => {});
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
