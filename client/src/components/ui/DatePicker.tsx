import React, { useState } from 'react';
import './DatePicker.css';

interface DatePickerProps {
  id?: string;
  name: string;
  label?: string;
  value: string | null;
  onChange: (date: string | null) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  placeholder?: string;
  allowClear?: boolean;
}

/**
 * 日付選択コンポーネント
 */
const DatePicker: React.FC<DatePickerProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = '',
  placeholder = '日付を選択',
  allowClear = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const datePickerId = id || `datepicker-${name}`;
  
  // 日付をYYYY-MM-DD形式に変換
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // 表示用の日付フォーマット
  const formatDisplayDate = (dateString: string | null): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // 日付変更ハンドラー
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value ? e.target.value : null;
    onChange(newDate);
  };
  
  // 日付クリアハンドラー
  const handleClear = () => {
    onChange(null);
  };
  
  return (
    <div className={`datepicker-container ${className} ${error ? 'has-error' : ''}`}>
      {label && (
        <label htmlFor={datePickerId} className="datepicker-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      
      <div className="datepicker-input-container">
        <input
          id={datePickerId}
          name={name}
          type="date"
          value={value || ''}
          onChange={handleDateChange}
          disabled={disabled}
          required={required}
          className="datepicker-input"
          aria-invalid={!!error}
          aria-describedby={error ? `${datePickerId}-error` : undefined}
          placeholder={placeholder}
        />
        
        {allowClear && value && !disabled && (
          <button
            type="button"
            className="datepicker-clear-button"
            onClick={handleClear}
            aria-label="日付をクリア"
          >
            ×
          </button>
        )}
      </div>
      
      {error && (
        <div id={`${datePickerId}-error`} className="datepicker-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default DatePicker;
