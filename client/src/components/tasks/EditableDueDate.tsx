import React from 'react';
import InlineEditableField from '../ui/InlineEditableField';
import DatePicker from '../ui/DatePicker';
import './EditableDueDate.css';

interface EditableDueDateProps {
  dueDate: string | null | undefined;
  onSave: (dueDate: string | null) => Promise<void>;
  disabled?: boolean;
}

/**
 * 編集可能な締切日表示コンポーネント
 */
const EditableDueDate: React.FC<EditableDueDateProps> = ({
  dueDate,
  onSave,
  disabled = false,
}) => {
  // 締切日の表示コンポーネント
  const renderDueDateDisplay = (value: string | null | undefined, onClick: () => void) => {
    const displayText = value 
      ? new Date(value).toLocaleDateString() 
      : '期限なし';
    
    const isPastDue = value && new Date(value) < new Date() && !disabled;
    
    if (disabled) {
      return (
        <span className={`due-date-badge ${isPastDue ? 'past-due' : ''}`}>
          {displayText}
        </span>
      );
    }
    
    return (
      <span 
        className={`due-date-badge ${isPastDue ? 'past-due' : ''} editable`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-label="締切日を編集"
      >
        {displayText}
        <span className="edit-icon">✎</span>
      </span>
    );
  };

  // 締切日の編集コンポーネント
  const renderDueDateEdit = (
    currentValue: string | null | undefined,
    onSave: (newValue: string | null) => void,
    onCancel: () => void
  ) => {
    const handleChange = (newDate: string | null) => {
      onSave(newDate);
    };

    return (
      <div className="due-date-edit-container">
        <DatePicker
          name="dueDate"
          value={currentValue || null}
          onChange={handleChange}
          allowClear={true}
          className="due-date-picker"
        />
        <button 
          className="due-date-edit-cancel" 
          onClick={onCancel}
          aria-label="キャンセル"
        >
          キャンセル
        </button>
      </div>
    );
  };

  return (
    <InlineEditableField
      value={dueDate}
      onSave={onSave}
      renderDisplay={renderDueDateDisplay}
      renderEdit={renderDueDateEdit}
      className="editable-due-date"
    />
  );
};

export default EditableDueDate;
