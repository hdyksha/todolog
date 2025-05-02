import React from 'react';
import { Priority } from '../../types';
import InlineEditableField from '../ui/InlineEditableField';
import Select, { SelectOption } from '../ui/Select';
import './EditablePriority.css';

interface EditablePriorityProps {
  priority: Priority;
  onSave: (priority: Priority) => Promise<void>;
  disabled?: boolean;
}

/**
 * 編集可能な優先度表示コンポーネント
 */
const EditablePriority: React.FC<EditablePriorityProps> = ({
  priority,
  onSave,
  disabled = false,
}) => {
  // 優先度のオプション
  const priorityOptions: SelectOption[] = [
    { value: Priority.High, label: '高' },
    { value: Priority.Medium, label: '中' },
    { value: Priority.Low, label: '低' },
  ];

  // 優先度の表示コンポーネント
  const renderPriorityDisplay = (value: Priority, onClick: () => void) => {
    if (disabled) {
      return (
        <span className={`priority-badge priority-${value}`}>
          {value === Priority.High ? '高' : value === Priority.Medium ? '中' : '低'}
        </span>
      );
    }
    
    return (
      <span 
        className={`priority-badge priority-${value} editable`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-label="優先度を編集"
      >
        {value === Priority.High ? '高' : value === Priority.Medium ? '中' : '低'}
        <span className="edit-icon">✎</span>
      </span>
    );
  };

  // 優先度の編集コンポーネント
  const renderPriorityEdit = (
    currentValue: Priority,
    onSave: (newValue: Priority) => void,
    onCancel: () => void
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newPriority = e.target.value as Priority;
      onSave(newPriority);
    };

    return (
      <div className="priority-edit-container">
        <Select
          name="priority"
          value={currentValue}
          options={priorityOptions}
          onChange={handleChange}
          className="priority-select"
        />
        <button 
          className="priority-edit-cancel" 
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
      value={priority}
      onSave={onSave}
      renderDisplay={renderPriorityDisplay}
      renderEdit={renderPriorityEdit}
      className="editable-priority"
    />
  );
};

export default EditablePriority;
