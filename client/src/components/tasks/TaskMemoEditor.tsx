import React, { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';
import TaskMemoViewer from '../TaskMemoViewer';
import MarkdownHelpModal from '../MarkdownHelpModal';
import './TaskMemoEditor.css';

interface TaskMemoEditorProps {
  initialMemo: string;
  onSave: (memo: string) => Promise<void>;
  onCancel: () => void;
  onCheckboxChange: (newMemo: string) => void;
}

/**
 * タスクメモの編集コンポーネント
 * テキスト編集モードとプレビューモードを切り替え可能
 */
const TaskMemoEditor: React.FC<TaskMemoEditorProps> = ({
  initialMemo,
  onSave,
  onCancel,
  onCheckboxChange,
}) => {
  const [memo, setMemo] = useState(initialMemo);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 初期メモが変更されたら、編集中のメモも更新
  useEffect(() => {
    setMemo(initialMemo);
  }, [initialMemo]);

  // 編集モードになったらテキストエリアにフォーカス
  useEffect(() => {
    if (!isPreviewMode && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isPreviewMode]);

  // メモの保存
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(memo);
    } catch (error) {
      console.error('メモ更新エラー:', error);
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
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="task-memo-editor-container">
      <div className="task-memo-editor-toolbar">
        <Button
          variant={isPreviewMode ? "secondary" : "text"}
          size="small"
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          type="button"
        >
          {isPreviewMode ? "編集" : "プレビュー"}
        </Button>
        <Button
          variant="text"
          size="small"
          onClick={() => setShowMarkdownHelp(true)}
          title="マークダウンヘルプ"
          type="button"
        >
          <span role="img" aria-label="ヘルプ">❓</span>
        </Button>
        <Button
          variant="primary"
          size="small"
          onClick={handleSave}
          isLoading={isSaving}
          disabled={isSaving}
          type="button"
        >
          保存
        </Button>
        <Button
          variant="text"
          size="small"
          onClick={onCancel}
          disabled={isSaving}
          type="button"
        >
          キャンセル
        </Button>
      </div>

      <div className="task-memo-editor-content">
        {isPreviewMode ? (
          <div className="task-memo-preview">
            <TaskMemoViewer 
              memo={memo} 
              onCheckboxChange={onCheckboxChange}
            />
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            className="task-memo-textarea"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="メモを入力..."
            disabled={isSaving}
            onKeyDown={handleKeyDown}
          />
        )}
      </div>

      {showMarkdownHelp && (
        <MarkdownHelpModal onClose={() => setShowMarkdownHelp(false)} />
      )}
    </div>
  );
};

export default TaskMemoEditor;
