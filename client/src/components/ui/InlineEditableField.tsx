import React, { useState, useRef, useEffect } from 'react';
import './InlineEditableField.css';

interface InlineEditableFieldProps {
  value: React.ReactNode;
  onSave: (newValue: any) => Promise<void> | void;
  renderDisplay: (value: React.ReactNode, onClick: () => void) => React.ReactNode;
  renderEdit: (value: any, onSave: (newValue: any) => void, onCancel: () => void) => React.ReactNode;
  className?: string;
}

/**
 * インライン編集可能なフィールドを提供するコンポーネント
 * 表示モードと編集モードを切り替えることができる
 */
const InlineEditableField: React.FC<InlineEditableFieldProps> = ({
  value,
  onSave,
  renderDisplay,
  renderEdit,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 編集モードを開始
  const handleStartEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  // 編集をキャンセル
  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  // 変更を保存
  const handleSave = async (newValue: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onSave(newValue);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 外部クリックで編集モードを終了
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node)
      ) {
        handleCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  return (
    <div 
      className={`inline-editable-field ${className} ${isEditing ? 'is-editing' : ''}`}
      ref={containerRef}
    >
      {isEditing ? (
        <div className="inline-editable-field-edit">
          {renderEdit(value, handleSave, handleCancel)}
          {error && <div className="inline-editable-field-error">{error}</div>}
          {isLoading && <div className="inline-editable-field-loading">保存中...</div>}
        </div>
      ) : (
        <div className="inline-editable-field-display">
          {renderDisplay(value, handleStartEdit)}
        </div>
      )}
    </div>
  );
};

export default InlineEditableField;
