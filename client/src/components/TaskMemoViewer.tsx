import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './TaskMemoViewer.css';

interface TaskMemoViewerProps {
  memo: string;
  className?: string;
  onCheckboxChange?: (text: string) => void;
}

/**
 * マークダウン形式のタスクメモを表示するコンポーネント
 * 
 * @param memo - マークダウン形式のメモテキスト
 * @param className - 追加のCSSクラス名（オプション）
 * @param onCheckboxChange - チェックボックスの状態変更時のコールバック（オプション）
 */
const TaskMemoViewer: React.FC<TaskMemoViewerProps> = ({ 
  memo, 
  className = '',
  onCheckboxChange 
}) => {
  // メモが空の場合のプレースホルダー表示
  if (!memo || memo.trim() === '') {
    return (
      <div className={`task-memo-viewer-empty ${className}`}>
        メモはありません
      </div>
    );
  }

  // チェックボックスの状態変更を処理する関数
  const handleCheckboxChange = (checked: boolean, index: number) => {
    if (!onCheckboxChange) return;
    
    // メモテキストを行に分割
    const lines = memo.split('\n');
    
    // チェックボックスの正規表現
    const checkboxRegex = /^(\s*[-*+]\s+\[)[ xX](\].*)$/;
    
    // チェックボックスのカウンター
    let checkboxCount = 0;
    
    // 変更されたチェックボックスを含む新しいテキストを作成
    const newText = lines.map(line => {
      const match = line.match(checkboxRegex);
      if (match) {
        checkboxCount++;
        if (checkboxCount - 1 === index) {
          // チェックボックスの状態を更新
          return `${match[1]}${checked ? 'x' : ' '}${match[2]}`;
        }
      }
      return line;
    }).join('\n');
    
    // 親コンポーネントに変更を通知
    onCheckboxChange(newText);
  };

  return (
    <div className={`task-memo-viewer ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]} // GitHub Flavored Markdownのサポート
        rehypePlugins={[rehypeSanitize, rehypeRaw]} // XSS対策とHTMLタグの許可
        components={{
          // 外部リンクは新しいタブで開く
          a: ({ node, ...props }) => {
            const href = props.href || '';
            const isExternal = href.startsWith('http') || href.startsWith('https');
            
            return (
              <a
                {...props}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="task-memo-link"
              />
            );
          },
          
          // コードブロックのシンタックスハイライト
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            return !inline && language ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={language}
                PreTag="div"
                className="task-memo-code-block"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code
                className={`${className || ''} ${
                  inline ? 'task-memo-inline-code' : 'task-memo-code-block'
                }`}
                {...props}
              >
                {children}
              </code>
            );
          },
          
          // チェックボックスの処理
          li: ({ node, className, checked, index, ...props }) => {
            // チェックボックスを含むリスト項目かどうかを判定
            if (
              typeof checked === 'boolean' &&
              onCheckboxChange &&
              // @ts-ignore - ReactMarkdownのindex型定義が不足しているため
              typeof index === 'number'
            ) {
              return (
                <li className={`task-memo-list-item ${className || ''}`} {...props}>
                  <label className="task-memo-checkbox-label">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => handleCheckboxChange(e.target.checked, index)}
                      className="task-memo-checkbox"
                    />
                    <span>{props.children}</span>
                  </label>
                </li>
              );
            }
            
            return <li className={`task-memo-list-item ${className || ''}`} {...props} />;
          },
          
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
          
          // テーブルのスタイリング
          table: ({ node, ...props }) => (
            <div className="task-memo-table-container">
              <table {...props} className="task-memo-table" />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead {...props} className="task-memo-thead" />
          ),
          tbody: ({ node, ...props }) => (
            <tbody {...props} className="task-memo-tbody" />
          ),
          tr: ({ node, ...props }) => (
            <tr {...props} className="task-memo-tr" />
          ),
          th: ({ node, ...props }) => (
            <th {...props} className="task-memo-th" />
          ),
          td: ({ node, ...props }) => (
            <td {...props} className="task-memo-td" />
          ),
        }}
      >
        {memo}
      </ReactMarkdown>
    </div>
  );
};

export default TaskMemoViewer;
