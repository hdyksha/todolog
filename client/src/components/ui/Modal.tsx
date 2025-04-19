import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnEsc?: boolean;
  closeOnOutsideClick?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnEsc = true,
  closeOnOutsideClick = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // ESCキーでモーダルを閉じる
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, closeOnEsc]);
  
  // モーダル外のクリックでモーダルを閉じる
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  
  // モーダルが開いている間はスクロールを無効にする
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // サイズに応じたクラスを設定
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };
  
  if (!isOpen) return null;
  
  // モーダルをbody直下にレンダリング
  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleOutsideClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full ${sizeClasses[size]} overflow-hidden`}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="閉じる"
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          {children}
        </div>
        
        {footer && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
