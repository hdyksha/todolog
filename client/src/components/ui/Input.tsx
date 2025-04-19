import React, { forwardRef } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, helperText, className = '', ...props }, ref) => {
    const inputId = props.id || `input-${Math.random().toString(36).substring(2, 9)}`;
    
    const inputClasses = [
      'input',
      error ? 'input-error' : '',
      fullWidth ? 'input-full-width' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={`input-container ${fullWidth ? 'input-container-full-width' : ''}`}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
            {props.required && <span className="input-required">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        {error && (
          <div id={`${inputId}-error`} className="input-error-text" role="alert">
            {error}
          </div>
        )}
        {helperText && !error && (
          <div id={`${inputId}-helper`} className="input-helper-text">
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
