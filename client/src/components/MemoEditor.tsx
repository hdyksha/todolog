import React, { useState, useEffect } from 'react';
import TaskMemoViewer from './TaskMemoViewer';
import './MemoEditor.css';

interface MemoEditorProps {
  taskId: string;
  initialMemo: string;
  onSave: (taskId: string, memo: string) => Promise<boolean>;
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
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // テキストエリアにフォーカスを当てる
  useEffect(() => {
    if (!isPreviewMode) {
      const textarea = document.getElementById('memo-textarea');
      if (textarea) {
        textarea.focus();
      }
    }
  }, [isPreviewMode]);

  // 保存ハンドラー
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await onSave(taskId, memo);
      if (success) {
        onClose();
      }
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
    // Ctrl+P または Cmd+P でプレビュー切り替え
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      setIsPreviewMode(!isPreviewMode);
    }
  };
  
  // プレビューモード時のキーボードイベント
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isPreviewMode && (e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setIsPreviewMode(false);
      }
    };
    
    // プレビューモード時のみグローバルイベントリスナーを追加
    if (isPreviewMode) {
      document.addEventListener('keydown', handleGlobalKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isPreviewMode]);

  // マークダウンヘルプの表示/非表示を切り替え
  const toggleMarkdownHelp = () => {
    setShowMarkdownHelp(!showMarkdownHelp);
  };

  // プレビューモードの切り替え
  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  return (
    <div className="memo-editor-container">
      <div className="memo-editor">
        <div className="memo-editor-header">
          <h3>メモを編集</h3>
          <div className="memo-editor-header-actions">
            <button 
              className={`preview-toggle-button ${isPreviewMode ? 'active' : ''}`}
              onClick={togglePreviewMode}
              aria-label={isPreviewMode ? "編集モードに切り替え" : "プレビューモードに切り替え"}
              title={isPreviewMode ? "編集モードに切り替え" : "プレビューモードに切り替え"}
            >
              {isPreviewMode ? "編集" : "プレビュー"}
            </button>
            <button 
              className="markdown-help-button" 
              onClick={toggleMarkdownHelp}
              aria-label="マークダウンヘルプ"
              title="マークダウンヘルプ"
            >
              <span role="img" aria-label="ヘルプ">❓</span>
            </button>
            <button className="close-button" onClick={onClose} aria-label="閉じる">
              ×
            </button>
          </div>
        </div>

        {showMarkdownHelp && (
          <div className="markdown-help-panel">
            <h4>マークダウン記法</h4>
            <table className="markdown-help-table">
              <tbody>
                <tr>
                  <td><code># 見出し1</code></td>
                  <td>見出し (h1)</td>
                </tr>
                <tr>
                  <td><code>## 見出し2</code></td>
                  <td>見出し (h2)</td>
                </tr>
                <tr>
                  <td><code>**太字**</code></td>
                  <td><strong>太字</strong></td>
                </tr>
                <tr>
                  <td><code>*斜体*</code></td>
                  <td><em>斜体</em></td>
                </tr>
                <tr>
                  <td><code>- リスト項目</code></td>
                  <td>箇条書きリスト</td>
                </tr>
                <tr>
                  <td><code>1. 番号付きリスト</code></td>
                  <td>番号付きリスト</td>
                </tr>
                <tr>
                  <td><code>- [ ] タスク</code></td>
                  <td>未完了のチェックボックス</td>
                </tr>
                <tr>
                  <td><code>- [x] タスク</code></td>
                  <td>完了済みのチェックボックス</td>
                </tr>
                <tr>
                  <td><code>[リンク](URL)</code></td>
                  <td>ハイパーリンク</td>
                </tr>
                <tr>
                  <td><code>```<br/>コード<br/>```</code></td>
                  <td>コードブロック</td>
                </tr>
                <tr>
                  <td><code>```javascript<br/>コード<br/>```</code></td>
                  <td>シンタックスハイライト付きコードブロック</td>
                </tr>
                <tr>
                  <td><code>`インラインコード`</code></td>
                  <td>インラインコード</td>
                </tr>
                <tr>
                  <td><code>{`> 引用文`}</code></td>
                  <td>引用</td>
                </tr>
                <tr>
                  <td><code>---</code></td>
                  <td>水平線</td>
                </tr>
                <tr>
                  <td><code>| 列1 | 列2 |<br/>|-----|-----|<br/>| セル1 | セル2 |</code></td>
                  <td>テーブル</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="memo-editor-content">
          {isPreviewMode ? (
            <div 
              className="memo-preview" 
              tabIndex={0} 
              onKeyDown={handleKeyDown}
            >
              <TaskMemoViewer memo={memo} className="memo-preview-content" />
            </div>
          ) : (
            <textarea
              id="memo-textarea"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="メモを入力してください...
# マークダウン記法が使えます
- リスト項目
- **太字** や *斜体* も使えます
- [リンク](https://example.com)
- [ ] チェックボックス
- [x] 完了済みのチェックボックス

```javascript
// コードブロック
console.log('Hello, world!');
```

| 列1 | 列2 |
|-----|-----|
| セル1 | セル2 |"
              rows={10}
              disabled={isSaving}
            />
          )}
          <div className="memo-editor-footer">
            <p className="memo-editor-tip">
              {isPreviewMode ? (
                <>
                  <kbd>Ctrl</kbd>+<kbd>P</kbd> で編集モードに戻る
                </>
              ) : (
                <>
                  <kbd>Ctrl</kbd>+<kbd>Enter</kbd> で保存 | <kbd>Ctrl</kbd>+<kbd>P</kbd> でプレビュー
                </>
              )}
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
