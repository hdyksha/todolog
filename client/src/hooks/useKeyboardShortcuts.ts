import { useEffect, useCallback } from 'react';

interface ShortcutAction {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

interface ShortcutOptions {
  enabled?: boolean;
}

/**
 * キーボードショートカットを管理するカスタムフック
 * @param shortcuts ショートカットの配列
 * @param options オプション設定
 */
export const useKeyboardShortcuts = (
  shortcuts: ShortcutAction[],
  options: ShortcutOptions = {}
) => {
  const { enabled = true } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

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
        (shortcut) =>
          shortcut.key.toLowerCase() === event.key.toLowerCase() &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.altKey === event.altKey &&
          !!shortcut.shiftKey === event.shiftKey
      );

      if (matchedShortcut) {
        event.preventDefault();
        matchedShortcut.action();
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);

  // ショートカット一覧を返す（ヘルプ表示などに使用）
  const getShortcutList = () => {
    return shortcuts.map((shortcut) => {
      const modifiers = [
        shortcut.ctrlKey && 'Ctrl',
        shortcut.altKey && 'Alt',
        shortcut.shiftKey && 'Shift',
      ]
        .filter(Boolean)
        .join(' + ');

      const keyDisplay = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
      const shortcutText = modifiers ? `${modifiers} + ${keyDisplay}` : keyDisplay;

      return {
        shortcut: shortcutText,
        description: shortcut.description,
      };
    });
  };

  return { getShortcutList };
};
