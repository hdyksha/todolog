import { InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className="flex items-center">
        <input
          ref={ref}
          type="checkbox"
          className={`h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer ${className}`}
          {...props}
        />
        {label && (
          <label className="ml-2 block text-sm text-slate-900 dark:text-slate-100 cursor-pointer">
            {label}
          </label>
        )}
      </div>
    );
  }
);
