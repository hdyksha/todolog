import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import './TaskMemoViewer.css';

interface TaskMemoViewerProps {
  memo: string;
  className?: string;
}

/**
 * マークダウン形式のタスクメモを表示するコンポーネント
 * 
 * @param memo - マークダウン形式のメモテキスト
 * @param className - 追加のCSSクラス名（オプション）
 */
const TaskMemoViewer: React.FC<TaskMemoViewerProps> = ({ memo, className = '' }) => {
  // メモが空の場合のプレースホルダー表示
  if (!memo || memo.trim() === '') {
    return (
      <div className={`task-memo-viewer-empty ${className}`}>
        メモはありません
      </div>
    );
  }

  return (
    <div className={`task-memo-viewer ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]} // GitHub Flavored Markdownのサポート
        rehypePlugins={[rehypeSanitize]} // XSS対策
        components={{
          // 外部リンクは新しいタブで開く
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="task-memo-link"
            />
          ),
          // コードブロックのスタイリング
          code: ({ node, inline, ...props }) => (
            <code
              {...props}
              className={`${props.className || ''} ${
                inline ? 'task-memo-inline-code' : 'task-memo-code-block'
              }`}
            />
          ),
          // 見出しのスタイリング
          h1: ({ node, ...props }) => (
            <h1 {...props} className="task-memo-heading task-memo-h1" />
          ),
          h2: ({ node, ...props }) => (
            <h2 {...props} className="task-memo-heading task-memo-h2" />
          ),
          h3: ({ node, ...props }) => (
            <h3 {...props} className="task-memo-heading task-memo-h3" />
          ),
          h4: ({ node, ...props }) => (
            <h4 {...props} className="task-memo-heading task-memo-h4" />
          ),
          h5: ({ node, ...props }) => (
            <h5 {...props} className="task-memo-heading task-memo-h5" />
          ),
          h6: ({ node, ...props }) => (
            <h6 {...props} className="task-memo-heading task-memo-h6" />
          ),
          // リストのスタイリング
          ul: ({ node, ...props }) => (
            <ul {...props} className="task-memo-list task-memo-ul" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="task-memo-list task-memo-ol" />
          ),
          // 引用のスタイリング
          blockquote: ({ node, ...props }) => (
            <blockquote {...props} className="task-memo-blockquote" />
          ),
          // 水平線のスタイリング
          hr: ({ node, ...props }) => (
            <hr {...props} className="task-memo-hr" />
          ),
        }}
      >
        {memo}
      </ReactMarkdown>
    </div>
  );
};

export default TaskMemoViewer;
