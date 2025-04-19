import { useState } from 'react';

interface TaskToggleProps {
  completed: boolean;
  onChange: () => void;
  disabled?: boolean;
}

/**
 * タスクの完了状態を切り替えるためのカスタムトグルコンポーネント
 * チェックボックスの代わりに使用する
 */
export function TaskToggle({ completed, onChange, disabled = false }: TaskToggleProps) {
  const [isToggling, setIsToggling] = useState(false);
  
  const handleClick = async () => {
    if (disabled || isToggling) return;
    
    setIsToggling(true);
    try {
      await onChange();
    } finally {
      setIsToggling(false);
    }
  };
  
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isToggling}
      className={`
        w-5 h-5 flex items-center justify-center rounded border
        ${completed 
          ? 'bg-primary-600 border-primary-600 text-white' 
          : 'bg-white border-gray-300 dark:border-gray-600 dark:bg-gray-700'}
        ${isToggling ? 'opacity-50' : ''}
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        transition-colors duration-200 ease-in-out
      `}
      aria-checked={completed}
      role="checkbox"
    >
      {completed && (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}
