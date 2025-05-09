import React, { useState } from 'react';
import { Priority } from '../../types';
import InlineEditableField from '../ui/InlineEditableField';
import './EditablePriority.css';

interface EditablePriorityProps {
  priority: Priority;
  onSave: (priority: Priority) => Promise<void>;
  disabled?: boolean;
}

/**
 * 編集可能な優先度表示コンポーネント
 * インラインで編集できるように改良
 */
const EditablePriority: React.FC<EditablePriorityProps> = ({
  priority,
  onSave,
  disabled = false,
}) => {
  const [hoveredPriority, setHoveredPriority] = useState<Priority | null>(null);

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
      <div className="priority-badges-container">
        <span 
          className={`priority-badge priority-${Priority.High} ${value === Priority.High ? 'active' : 'inactive'}`}
          onClick={() => onSave(Priority.High)}
          onMouseEnter={() => setHoveredPriority(Priority.High)}
          onMouseLeave={() => setHoveredPriority(null)}
          role="button"
          tabIndex={0}
          aria-label="優先度を高に設定"
          aria-pressed={value === Priority.High}
        >
          高
        </span>
        <span 
          className={`priority-badge priority-${Priority.Medium} ${value === Priority.Medium ? 'active' : 'inactive'}`}
          onClick={() => onSave(Priority.Medium)}
          onMouseEnter={() => setHoveredPriority(Priority.Medium)}
          onMouseLeave={() => setHoveredPriority(null)}
          role="button"
          tabIndex={0}
          aria-label="優先度を中に設定"
          aria-pressed={value === Priority.Medium}
        >
          中
        </span>
        <span 
          className={`priority-badge priority-${Priority.Low} ${value === Priority.Low ? 'active' : 'inactive'}`}
          onClick={() => onSave(Priority.Low)}
          onMouseEnter={() => setHoveredPriority(Priority.Low)}
          onMouseLeave={() => setHoveredPriority(null)}
          role="button"
          tabIndex={0}
          aria-label="優先度を低に設定"
          aria-pressed={value === Priority.Low}
        >
          低
        </span>
      </div>
    );
  };

  // 優先度の編集コンポーネント（インライン編集のため表示と同じ）
  const renderPriorityEdit = (
    currentValue: Priority,
    onSave: (newValue: Priority) => void,
    onCancel: () => void
  ) => {
    return renderPriorityDisplay(currentValue, () => {});
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
