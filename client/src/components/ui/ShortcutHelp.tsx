import React, { useState } from 'react';
import './ShortcutHelp.css';

interface ShortcutInfo {
  shortcut: string;
  description: string;
}

interface ShortcutHelpProps {
  shortcuts: ShortcutInfo[];
}

const ShortcutHelp: React.FC<ShortcutHelpProps> = ({ shortcuts }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleHelp = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        className="shortcut-help-button"
        onClick={toggleHelp}
        aria-label="キーボードショートカット一覧を表示"
        title="キーボードショートカット"
      >
        <span className="shortcut-help-icon">⌨️</span>
      </button>

      {isOpen && (
        <div className="shortcut-help-overlay" onClick={toggleHelp}>
          <div className="shortcut-help-modal" onClick={(e) => e.stopPropagation()}>
            <div className="shortcut-help-header">
              <h2 className="shortcut-help-title">キーボードショートカット</h2>
              <button
                className="shortcut-help-close"
                onClick={toggleHelp}
                aria-label="閉じる"
              >
                ×
              </button>
            </div>
            <div className="shortcut-help-content">
              <table className="shortcut-help-table">
                <thead>
                  <tr>
                    <th>ショートカット</th>
                    <th>機能</th>
                  </tr>
                </thead>
                <tbody>
                  {shortcuts.map((item, index) => (
                    <tr key={index}>
                      <td className="shortcut-key">
                        <kbd>{item.shortcut}</kbd>
                      </td>
                      <td>{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShortcutHelp;
