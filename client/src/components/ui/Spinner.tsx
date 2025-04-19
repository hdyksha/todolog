import { HTMLAttributes } from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  color?: string;
}

export function Spinner({ 
  size = 'md', 
  color = 'currentColor',
  className = '',
  ...props 
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const classes = [
    'inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]',
    sizeClasses[size],
    className,
  ].join(' ');

  return (
    <div 
      className="flex justify-center items-center" 
      role="status"
      {...props}
    >
      <div 
        className={classes}
        style={{ color }}
        aria-hidden="true"
      />
      <span className="sr-only">読み込み中...</span>
    </div>
  );
}
