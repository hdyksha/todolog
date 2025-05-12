import React, { useState } from 'react';
import { Priority } from '../../types';
import InlineEditableField from '../ui/InlineEditableField';
import './EditablePriority.css';

interface EditablePriorityProps {
  priority: Priority;
  onSave: (priority: Priority) => Promise<void> | void;
  disabled?: boolean;
  inline?: boolean;
  className?: string;
}

/**
 * 編集可能な優先度表示コンポーネント
 * インラインで編集できるように改良
 * フォームでも再利用可能
 */
const EditablePriority: React.FC<EditablePriorityProps> = ({
  priority,
  onSave,
  disabled = false,
  inline = true,
  className = '',
}) => {
  const [hoveredPriority, setHoveredPriority] = useState<Priority | null>(null);

  // 優先度の選択コンポーネント
  const PrioritySelector = ({ value, onChange }: { value: Priority, onChange: (p: Priority) => void }) => {
    return (
      <div className={`priority-badges-container ${className}`}>
        <span 
          className={`priority-badge priority-${Priority.High} ${value === Priority.High ? 'active' : 'inactive'}`}
          onClick={() => !disabled && onChange(Priority.High)}
          onMouseEnter={() => setHoveredPriority(Priority.High)}
          onMouseLeave={() => setHoveredPriority(null)}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="優先度を高に設定"
          aria-pressed={value === Priority.High}
          aria-disabled={disabled}
        >
          高
        </span>
        <span 
          className={`priority-badge priority-${Priority.Medium} ${value === Priority.Medium ? 'active' : 'inactive'}`}
          onClick={() => !disabled && onChange(Priority.Medium)}
          onMouseEnter={() => setHoveredPriority(Priority.Medium)}
          onMouseLeave={() => setHoveredPriority(null)}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="優先度を中に設定"
          aria-pressed={value === Priority.Medium}
          aria-disabled={disabled}
        >
          中
        </span>
        <span 
          className={`priority-badge priority-${Priority.Low} ${value === Priority.Low ? 'active' : 'inactive'}`}
          onClick={() => !disabled && onChange(Priority.Low)}
          onMouseEnter={() => setHoveredPriority(Priority.Low)}
          onMouseLeave={() => setHoveredPriority(null)}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="優先度を低に設定"
          aria-pressed={value === Priority.Low}
          aria-disabled={disabled}
        >
          低
        </span>
      </div>
    );
  };

  // 優先度の表示コンポーネント
  const renderPriorityDisplay = (value: Priority, onClick: () => void) => {
    if (disabled) {
      return (
        <span className={`priority-badge priority-${value}`}>
          {value === Priority.High ? '高' : value === Priority.Medium ? '中' : '低'}
        </span>
      );
    }
    
    return <PrioritySelector value={value} onChange={(p) => onSave(p)} />;
  };

  // 優先度の編集コンポーネント（インライン編集のため表示と同じ）
  const renderPriorityEdit = (
    currentValue: Priority,
    onSave: (newValue: Priority) => void,
    onCancel: () => void
  ) => {
    return <PrioritySelector value={currentValue} onChange={onSave} />;
  };

  // インラインモードでない場合は直接セレクターを返す
  if (!inline) {
    return <PrioritySelector value={priority} onChange={(p) => onSave(p)} />;
  }

  // インラインモードの場合はInlineEditableFieldを使用
  return (
    <InlineEditableField
      value={priority}
      onSave={onSave}
      renderDisplay={renderPriorityDisplay}
      renderEdit={renderPriorityEdit}
      className={`editable-priority ${className}`}
    />
  );
};

export default EditablePriority;
