import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, helperText, className = '', ...props }, ref) => {
    const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors';
    const classes = [
      baseClasses,
      error
        ? 'border-red-300 focus:border-red-300 focus:ring-red-200'
        : 'border-slate-300 focus:border-primary-300 focus:ring-primary-200',
      className,
    ].join(' ');

    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {label}
          </label>
        )}
        <input ref={ref} className={classes} {...props} />
        {error ? (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
