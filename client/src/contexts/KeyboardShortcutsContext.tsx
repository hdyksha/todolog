import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface ShortcutAction {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  scope?: string;
}

interface ShortcutInfo {
  shortcut: string;
  description: string;
  scope?: string;
}

interface KeyboardShortcutsContextType {
  registerShortcut: (shortcut: ShortcutAction) => void;
  unregisterShortcut: (key: string, modifiers?: { ctrlKey?: boolean; altKey?: boolean; shiftKey?: boolean; metaKey?: boolean }) => void;
  getShortcutList: () => ShortcutInfo[];
  isHelpModalOpen: boolean;
  toggleHelpModal: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

interface KeyboardShortcutsProviderProps {
  children: ReactNode;
}

export const KeyboardShortcutsProvider: React.FC<KeyboardShortcutsProviderProps> = ({ children }) => {
  const [shortcuts, setShortcuts] = useState<ShortcutAction[]>([]);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // ショートカットを登録
  const registerShortcut = useCallback((shortcut: ShortcutAction) => {
    setShortcuts(prev => {
      // 既存のショートカットを確認し、同じキーの組み合わせがあれば上書き
      const existingIndex = prev.findIndex(
        s => s.key === shortcut.key && 
             s.ctrlKey === shortcut.ctrlKey && 
             s.altKey === shortcut.altKey && 
             s.shiftKey === shortcut.shiftKey &&
             s.metaKey === shortcut.metaKey
      );
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = shortcut;
        return updated;
      }
      
      return [...prev, shortcut];
    });
  }, []);

  // ショートカットを解除
  const unregisterShortcut = useCallback((key: string, modifiers?: { ctrlKey?: boolean; altKey?: boolean; shiftKey?: boolean; metaKey?: boolean }) => {
    setShortcuts(prev => 
      prev.filter(s => 
        !(s.key === key && 
          s.ctrlKey === (modifiers?.ctrlKey || false) && 
          s.altKey === (modifiers?.altKey || false) && 
          s.shiftKey === (modifiers?.shiftKey || false) &&
          s.metaKey === (modifiers?.metaKey || false)
        )
      )
    );
  }, []);

  // キーボードイベントのハンドラ
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // フォーム要素内でのショートカットは無効化（ユーザー入力を優先）
    if (
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        (event.target as HTMLElement).tagName
      ) ||
      (event.target as HTMLElement).isContentEditable
    ) {
      return;
    }

    const matchedShortcut = shortcuts.find(
      shortcut =>
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.altKey === event.altKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.metaKey === event.metaKey
    );

    if (matchedShortcut) {
      event.preventDefault();
      matchedShortcut.action();
    }
  }, [shortcuts]);

  // ヘルプモーダルの表示/非表示を切り替え
  const toggleHelpModal = useCallback(() => {
    setIsHelpModalOpen(prev => !prev);
  }, []);

  // グローバルショートカットの登録
  useEffect(() => {
    // ヘルプモーダルを表示するショートカット
    registerShortcut({
      key: '?',
      shiftKey: true,
      action: toggleHelpModal,
      description: 'ショートカットヘルプを表示',
      scope: 'グローバル'
    });
    
    // ESCキーでヘルプモーダルを閉じる
    if (isHelpModalOpen) {
      const escShortcut = {
        key: 'Escape',
        action: () => setIsHelpModalOpen(false),
        description: 'モーダルを閉じる',
        scope: 'モーダル'
      };
      registerShortcut(escShortcut);
      return () => unregisterShortcut('Escape');
    }
  }, [registerShortcut, toggleHelpModal, isHelpModalOpen, unregisterShortcut]);

  // イベントリスナーの登録と解除
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // ショートカット一覧を取得
  const getShortcutList = useCallback(() => {
    return shortcuts.map(shortcut => {
      const modifiers = [
        shortcut.ctrlKey && 'Ctrl',
        shortcut.altKey && 'Alt',
        shortcut.shiftKey && 'Shift',
        shortcut.metaKey && 'Cmd'
      ]
        .filter(Boolean)
        .join(' + ');

      const keyDisplay = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
      const shortcutText = modifiers ? `${modifiers} + ${keyDisplay}` : keyDisplay;

      return {
        shortcut: shortcutText,
        description: shortcut.description,
        scope: shortcut.scope || 'アプリ全体'
      };
    });
  }, [shortcuts]);

  const value = {
    registerShortcut,
    unregisterShortcut,
    getShortcutList,
    isHelpModalOpen,
    toggleHelpModal
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
};

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (context === undefined) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  }
  return context;
};
