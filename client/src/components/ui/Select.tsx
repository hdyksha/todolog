import React from 'react';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  name: string;
  label?: string;
  value: string | string[];
  options: SelectOption[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  className?: string;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({
  id,
  name,
  label,
  value,
  options,
  onChange,
  error,
  disabled = false,
  required = false,
  multiple = false,
  className = '',
  placeholder,
}) => {
  const selectId = id || `select-${name}`;
  
  return (
    <div className={`select-container ${className} ${error ? 'has-error' : ''}`}>
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        multiple={multiple}
        className="select-input"
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : undefined}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div id={`${selectId}-error`} className="select-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default Select;
