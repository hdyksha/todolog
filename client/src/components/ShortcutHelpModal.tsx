import type React from 'react';
import { useKeyboardShortcuts } from '../contexts/KeyboardShortcutsContext';
import Modal from './ui/Modal';
import './ShortcutHelpModal.css';

const ShortcutHelpModal: React.FC = () => {
  const { isHelpModalOpen, toggleHelpModal, getShortcutList } = useKeyboardShortcuts();
  const shortcuts = getShortcutList();

  // スコープごとにショートカットをグループ化
  const groupedShortcuts = shortcuts.reduce<Record<string, typeof shortcuts>>(
    (groups, shortcut) => {
      const scope = shortcut.scope || 'その他';
      if (!groups[scope]) {
        groups[scope] = [];
      }
      groups[scope].push(shortcut);
      return groups;
    },
    {}
  );

  // スコープの表示順序
  const scopeOrder = ['グローバル', 'タスク一覧', 'タスク詳細', 'モーダル', 'その他'];

  // ソートされたスコープキーを取得
  const sortedScopes = Object.keys(groupedShortcuts).sort(
    (a, b) => {
      const indexA = scopeOrder.indexOf(a);
      const indexB = scopeOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    }
  );

  return (
    <Modal
      isOpen={isHelpModalOpen}
      onClose={toggleHelpModal}
      title="キーボードショートカット"
      className="shortcut-help-modal"
    >
      <div className="shortcut-help-content">
        {sortedScopes.map(scope => (
          <div key={scope} className="shortcut-section">
            <h3 className="shortcut-section-title">{scope}</h3>
            <table className="shortcut-table">
              <thead>
                <tr>
                  <th>ショートカット</th>
                  <th>説明</th>
                </tr>
              </thead>
              <tbody>
                {groupedShortcuts[scope].map((shortcut) => (
                  <tr key={`${scope}-${shortcut.shortcut}`} className="shortcut-item">
                    <td className="shortcut-key">
                      <kbd>{shortcut.shortcut}</kbd>
                    </td>
                    <td className="shortcut-description">{shortcut.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {shortcuts.length === 0 && (
          <p className="no-shortcuts">登録されているショートカットはありません。</p>
        )}
      </div>
    </Modal>
  );
};

export default ShortcutHelpModal;
