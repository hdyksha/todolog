import type React from 'react';
import { useEffect } from 'react';
import './MarkdownHelpModal.css';

interface MarkdownHelpModalProps {
  onClose: () => void;
}

const MarkdownHelpModal: React.FC<MarkdownHelpModalProps> = ({ onClose }) => {
  // Escキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="markdown-help-modal-overlay" onClick={onClose}>
      <div className="markdown-help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="markdown-help-modal-header">
          <h2>マークダウン記法ヘルプ</h2>
          <button 
            className="markdown-help-modal-close" 
            onClick={onClose}
            type="button"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>
        <div className="markdown-help-modal-content">
          <p>
            メモ欄では以下のマークダウン記法が使用できます。
          </p>

          <h3>見出し</h3>
          <div className="markdown-help-example">
            <div className="markdown-help-code">
              <code># 見出し1</code>
              <code>## 見出し2</code>
              <code>### 見出し3</code>
            </div>
            <div className="markdown-help-preview">
              <h1>見出し1</h1>
              <h2>見出し2</h2>
              <h3>見出し3</h3>
            </div>
          </div>

          <h3>テキストスタイル</h3>
          <div className="markdown-help-example">
            <div className="markdown-help-code">
              <code>**太字**</code>
              <code>*斜体*</code>
              <code>~~取り消し線~~</code>
            </div>
            <div className="markdown-help-preview">
              <p><strong>太字</strong></p>
              <p><em>斜体</em></p>
              <p><del>取り消し線</del></p>
            </div>
          </div>

          <h3>リスト</h3>
          <div className="markdown-help-example">
            <div className="markdown-help-code">
              <code>- 箇条書き1</code>
              <code>- 箇条書き2</code>
              <code>&nbsp;&nbsp;- ネストした箇条書き</code>
              <br />
              <code>1. 番号付きリスト1</code>
              <code>2. 番号付きリスト2</code>
            </div>
            <div className="markdown-help-preview">
              <ul>
                <li>箇条書き1</li>
                <li>箇条書き2
                  <ul>
                    <li>ネストした箇条書き</li>
                  </ul>
                </li>
              </ul>
              <ol>
                <li>番号付きリスト1</li>
                <li>番号付きリスト2</li>
              </ol>
            </div>
          </div>

          <h3>チェックボックス</h3>
          <div className="markdown-help-example">
            <div className="markdown-help-code">
              <code>- [ ] 未完了のタスク</code>
              <code>- [x] 完了したタスク</code>
            </div>
            <div className="markdown-help-preview">
              <div>
                <input type="checkbox" disabled /> 未完了のタスク
              </div>
              <div>
                <input type="checkbox" checked disabled /> 完了したタスク
              </div>
            </div>
          </div>

          <h3>リンク</h3>
          <div className="markdown-help-example">
            <div className="markdown-help-code">
              <code>[リンクテキスト](https://example.com)</code>
              <code>https://example.com</code>
            </div>
            <div className="markdown-help-preview">
              <p><a href="#example">リンクテキスト</a></p>
              <p><a href="#example">https://example.com</a></p>
            </div>
          </div>

          <h3>引用</h3>
          <div className="markdown-help-example">
            <div className="markdown-help-code">
              <code>{`> これは引用文です。`}</code>
              <code>{`> 複数行にまたがることもできます。`}</code>
            </div>
            <div className="markdown-help-preview">
              <blockquote>
                <p>これは引用文です。</p>
                <p>複数行にまたがることもできます。</p>
              </blockquote>
            </div>
          </div>

          <h3>コード</h3>
          <div className="markdown-help-example">
            <div className="markdown-help-code">
              <code>`インラインコード`</code>
              <br />
              <code>```</code>
              <code>// コードブロック</code>
              <code>{`function hello() {`}</code>
              <code>{`  console.log('Hello');`}</code>
              <code>{`}`}</code>
              <code>```</code>
            </div>
            <div className="markdown-help-preview">
              <p><code>インラインコード</code></p>
              <pre><code>{`// コードブロック
function hello() {
  console.log('Hello');
}`}</code></pre>
            </div>
          </div>

          <h3>水平線</h3>
          <div className="markdown-help-example">
            <div className="markdown-help-code">
              <code>---</code>
            </div>
            <div className="markdown-help-preview">
              <hr />
            </div>
          </div>

          <h3>テーブル</h3>
          <div className="markdown-help-example">
            <div className="markdown-help-code">
              <code>| 列1 | 列2 |</code>
              <code>|-----|-----|</code>
              <code>| セル1 | セル2 |</code>
              <code>| セル3 | セル4 |</code>
            </div>
            <div className="markdown-help-preview">
              <table>
                <thead>
                  <tr>
                    <th>列1</th>
                    <th>列2</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>セル1</td>
                    <td>セル2</td>
                  </tr>
                  <tr>
                    <td>セル3</td>
                    <td>セル4</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownHelpModal;
