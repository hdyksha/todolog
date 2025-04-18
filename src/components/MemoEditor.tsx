import React, { useState, useEffect } from 'react';
import './MemoEditor.css';

interface MemoEditorProps {
  taskId: string;
  initialMemo: string;
  onSave: (taskId: string, memo: string) => void;
  onClose: () => void;
}

const MemoEditor: React.FC<MemoEditorProps> = ({
  taskId,
  initialMemo,
  onSave,
  onClose,
}) => {
  const [memo, setMemo] = useState(initialMemo || '');
  const [isSaving, setIsSaving] = useState(false);

  // テキストエリアにフォーカスを当てる
  useEffect(() => {
    const textarea = document.getElementById('memo-textarea');
    if (textarea) {
      textarea.focus();
    }
  }, []);

  // 保存ハンドラー
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(taskId, memo);
      onClose();
    } catch (error) {
      console.error('メモの保存に失敗しました:', error);
      // エラー処理を追加する場合はここに
    } finally {
      setIsSaving(false);
    }
  };

  // キーボードショートカット
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+Enter または Cmd+Enter で保存
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    // Escキーでキャンセル
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="memo-editor-container">
      <div className="memo-editor">
        <div className="memo-editor-header">
          <h3>メモを編集</h3>
          <button className="close-button" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>

        <div className="memo-editor-content">
          <textarea
            id="memo-textarea"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メモを入力してください..."
            rows={10}
          />
          <div className="memo-editor-footer">
            <p className="memo-editor-tip">
              <kbd>Ctrl</kbd>+<kbd>Enter</kbd> で保存
            </p>
            <div className="memo-editor-actions">
              <button
                className="cancel-button"
                onClick={onClose}
                disabled={isSaving}
              >
                キャンセル
              </button>
              <button
                className="save-button"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoEditor;
