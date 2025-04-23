# Issue08: リッチタスクメモビューアーの開発

## 概要

現在のタスクメモ表示機能を拡張し、URLの自動リンク化やマークダウン形式のサポートなど、リッチなテキスト表示機能を実装します。これにより、ユーザーはより構造化されたメモを作成でき、情報の視認性と利便性が向上します。

## 現状の課題

現在のタスクメモ表示は単純なテキスト表示のみで、以下の制限があります：

1. URLが含まれていても自動的にリンクに変換されない
2. テキストの書式設定（見出し、太字、箇条書きなど）ができない
3. コードブロックなどの特殊な表示形式がサポートされていない
4. 長文テキストの構造化が難しい

## 機能要件

### 基本機能
- URLの自動検出とリンク化
- マークダウン記法のサポート
  - 見出し（#, ##, ###）
  - 強調（**太字**, *斜体*）
  - リスト（箇条書き、番号付きリスト）
  - コードブロック（インラインコード、複数行コード）
  - 引用（> による引用）
  - 水平線（---）
  - チェックボックス（- [ ], - [x]）

### 拡張機能
- シンタックスハイライト（コードブロック内）
- テーブル表示
- 画像リンクのプレビュー表示
- 絵文字のサポート
- メモ内の特定のタスクIDへのリンク

## 技術的アプローチ

### 1. マークダウンパーサーライブラリの選定

以下のライブラリを候補として検討します：

1. **react-markdown**
   - 軽量で使いやすい
   - プラグインシステムによる拡張性
   - Reactコンポーネントとの統合が容易

2. **marked + DOMPurify**
   - 高速なパース
   - カスタマイズ性が高い
   - セキュリティ対策としてDOMPurifyと組み合わせる

3. **remark + rehype**
   - 高度なカスタマイズが可能
   - プラグインエコシステムが豊富
   - 処理パイプラインの柔軟な構築

比較検討の結果、**react-markdown**を採用します。理由は以下の通りです：
- Reactとの統合が容易
- プラグインによる拡張性
- 十分な機能セットと適度な軽量さ
- アクティブなメンテナンス

### 2. 実装計画

#### フェーズ1: 基本実装

1. **TaskMemoViewer コンポーネントの作成**
   ```tsx
   // src/components/tasks/TaskMemoViewer.tsx
   import React from 'react';
   import ReactMarkdown from 'react-markdown';
   import './TaskMemoViewer.css';

   interface TaskMemoViewerProps {
     memo: string;
   }

   const TaskMemoViewer: React.FC<TaskMemoViewerProps> = ({ memo }) => {
     if (!memo) {
       return <span className="task-detail-memo-empty">メモはありません</span>;
     }

     return (
       <div className="task-memo-viewer">
         <ReactMarkdown>{memo}</ReactMarkdown>
       </div>
     );
   };

   export default TaskMemoViewer;
   ```

2. **スタイリングの実装**
   ```css
   /* src/components/tasks/TaskMemoViewer.css */
   .task-memo-viewer {
     line-height: 1.6;
   }

   .task-memo-viewer h1,
   .task-memo-viewer h2,
   .task-memo-viewer h3,
   .task-memo-viewer h4,
   .task-memo-viewer h5,
   .task-memo-viewer h6 {
     margin-top: 1.5em;
     margin-bottom: 0.5em;
     font-weight: 600;
   }

   .task-memo-viewer h1 { font-size: 1.8em; }
   .task-memo-viewer h2 { font-size: 1.5em; }
   .task-memo-viewer h3 { font-size: 1.3em; }
   .task-memo-viewer h4 { font-size: 1.2em; }
   .task-memo-viewer h5 { font-size: 1.1em; }
   .task-memo-viewer h6 { font-size: 1em; }

   .task-memo-viewer p {
     margin-bottom: 1em;
   }

   .task-memo-viewer ul,
   .task-memo-viewer ol {
     margin-bottom: 1em;
     padding-left: 2em;
   }

   .task-memo-viewer li {
     margin-bottom: 0.5em;
   }

   .task-memo-viewer a {
     color: var(--color-primary);
     text-decoration: none;
   }

   .task-memo-viewer a:hover {
     text-decoration: underline;
   }

   .task-memo-viewer blockquote {
     border-left: 4px solid var(--color-border);
     padding-left: 1em;
     margin-left: 0;
     color: var(--color-text-muted);
   }

   .task-memo-viewer pre {
     background-color: var(--color-background-tertiary);
     padding: 1em;
     border-radius: 4px;
     overflow-x: auto;
     margin-bottom: 1em;
   }

   .task-memo-viewer code {
     background-color: var(--color-background-tertiary);
     padding: 0.2em 0.4em;
     border-radius: 3px;
     font-family: monospace;
   }

   .task-memo-viewer hr {
     border: 0;
     border-top: 1px solid var(--color-border);
     margin: 2em 0;
   }
   ```

3. **TaskDetailPage への統合**
   ```tsx
   // src/pages/TaskDetailPage.tsx の修正部分
   import TaskMemoViewer from '../components/tasks/TaskMemoViewer';

   // 既存のメモ表示部分を置き換え
   {isEditingMemo ? (
     <textarea
       className="task-detail-memo-editor"
       value={memo}
       onChange={(e) => setMemo(e.target.value)}
       placeholder="メモを入力..."
       disabled={isSaving}
       autoFocus
     />
   ) : (
     <TaskMemoViewer memo={task.memo || ''} />
   )}
   ```

#### フェーズ2: 拡張機能の実装

1. **シンタックスハイライトの追加**
   ```tsx
   // src/components/tasks/TaskMemoViewer.tsx
   import React from 'react';
   import ReactMarkdown from 'react-markdown';
   import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
   import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
   import { useTheme } from '../../contexts/ThemeContext';
   import './TaskMemoViewer.css';

   interface TaskMemoViewerProps {
     memo: string;
   }

   const TaskMemoViewer: React.FC<TaskMemoViewerProps> = ({ memo }) => {
     const { currentTheme } = useTheme();
     const codeStyle = currentTheme === 'dark' ? vscDarkPlus : vs;

     if (!memo) {
       return <span className="task-detail-memo-empty">メモはありません</span>;
     }

     return (
       <div className="task-memo-viewer">
         <ReactMarkdown
           components={{
             code({ node, inline, className, children, ...props }) {
               const match = /language-(\w+)/.exec(className || '');
               return !inline && match ? (
                 <SyntaxHighlighter
                   style={codeStyle}
                   language={match[1]}
                   PreTag="div"
                   {...props}
                 >
                   {String(children).replace(/\n$/, '')}
                 </SyntaxHighlighter>
               ) : (
                 <code className={className} {...props}>
                   {children}
                 </code>
               );
             }
           }}
         >
           {memo}
         </ReactMarkdown>
       </div>
     );
   };

   export default TaskMemoViewer;
   ```

2. **URLの自動リンク化とターゲット設定**
   ```tsx
   // src/components/tasks/TaskMemoViewer.tsx の components オブジェクトに追加
   a({ node, href, children, ...props }) {
     return (
       <a
         href={href}
         target={href?.startsWith('http') ? '_blank' : undefined}
         rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
         {...props}
       >
         {children}
       </a>
     );
   }
   ```

3. **チェックボックスのサポート**
   ```tsx
   // src/components/tasks/TaskMemoViewer.tsx
   // react-markdown の rehype プラグインを使用
   import rehypeRaw from 'rehype-raw';
   import remarkGfm from 'remark-gfm';

   // ReactMarkdown コンポーネントに追加
   <ReactMarkdown
     remarkPlugins={[remarkGfm]}
     rehypePlugins={[rehypeRaw]}
     components={{
       // 既存のコンポーネントオーバーライド
     }}
   >
     {memo}
   </ReactMarkdown>
   ```

#### フェーズ3: ヘルプ機能とプレビュー機能

1. **マークダウンヘルプモーダルの実装**
   ```tsx
   // src/components/tasks/MarkdownHelpModal.tsx
   import React from 'react';
   import Modal from '../ui/Modal';
   import './MarkdownHelpModal.css';

   interface MarkdownHelpModalProps {
     isOpen: boolean;
     onClose: () => void;
   }

   const MarkdownHelpModal: React.FC<MarkdownHelpModalProps> = ({ isOpen, onClose }) => {
     return (
       <Modal isOpen={isOpen} onClose={onClose} title="マークダウン記法ヘルプ">
         <div className="markdown-help">
           <section>
             <h3>見出し</h3>
             <pre>
               # 見出し1
               ## 見出し2
               ### 見出し3
             </pre>
           </section>

           <section>
             <h3>テキスト装飾</h3>
             <pre>
               **太字**
               *斜体*
               ~~取り消し線~~
             </pre>
           </section>

           <section>
             <h3>リスト</h3>
             <pre>
               - 箇条書き1
               - 箇条書き2
                 - ネストした箇条書き

               1. 番号付きリスト1
               2. 番号付きリスト2
             </pre>
           </section>

           <section>
             <h3>リンク</h3>
             <pre>
               [リンクテキスト](https://example.com)
               https://example.com (自動リンク)
             </pre>
           </section>

           <section>
             <h3>コード</h3>
             <pre>
               `インラインコード`

               ```javascript
               // コードブロック
               function hello() {
                 console.log("Hello");
               }
               ```
             </pre>
           </section>

           <section>
             <h3>引用</h3>
             <pre>
               > 引用テキスト
               > 複数行の引用
             </pre>
           </section>

           <section>
             <h3>チェックボックス</h3>
             <pre>
               - [ ] 未完了のタスク
               - [x] 完了したタスク
             </pre>
           </section>
         </div>
       </Modal>
     );
   };

   export default MarkdownHelpModal;
   ```

2. **メモ編集時のプレビュー機能**
   ```tsx
   // src/pages/TaskDetailPage.tsx の修正部分
   const [isPreviewMode, setIsPreviewMode] = useState(false);
   const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

   // メモ編集部分の修正
   {isEditingMemo && (
     <div className="task-detail-memo-edit-container">
       <div className="task-detail-memo-toolbar">
         <Button
           variant="text"
           size="small"
           onClick={() => setIsPreviewMode(!isPreviewMode)}
         >
           {isPreviewMode ? 'エディタに戻る' : 'プレビュー'}
         </Button>
         <Button
           variant="text"
           size="small"
           onClick={() => setIsHelpModalOpen(true)}
         >
           マークダウンヘルプ
         </Button>
       </div>

       {isPreviewMode ? (
         <div className="task-detail-memo-preview">
           <TaskMemoViewer memo={memo} />
         </div>
       ) : (
         <textarea
           className="task-detail-memo-editor"
           value={memo}
           onChange={(e) => setMemo(e.target.value)}
           placeholder="メモを入力... (マークダウン記法が使用できます)"
           disabled={isSaving}
           autoFocus
         />
       )}
     </div>
   )}

   {/* ヘルプモーダル */}
   <MarkdownHelpModal
     isOpen={isHelpModalOpen}
     onClose={() => setIsHelpModalOpen(false)}
   />
   ```

## テスト計画

### 単体テスト
1. **TaskMemoViewer コンポーネントのテスト**
   - 基本的なマークダウン変換のテスト
   - 空のメモ表示のテスト
   - リンク変換のテスト
   - コードブロック表示のテスト

2. **MarkdownHelpModal コンポーネントのテスト**
   - モーダル表示/非表示のテスト
   - コンテンツ表示のテスト

### 統合テスト
1. **TaskDetailPage でのメモ表示テスト**
   - メモ表示モードでのマークダウン表示
   - 編集モードとプレビューモードの切り替え
   - メモ保存後の表示確認

### アクセシビリティテスト
1. **キーボードナビゲーション**
   - リンクへのフォーカス移動
   - プレビューモードでのスクロール操作

2. **スクリーンリーダー対応**
   - マークダウン構造の適切な読み上げ
   - リンクの適切なラベル付け

## 実装スケジュール

### フェーズ1: 基本実装（2日）
- 依存関係のインストール
- TaskMemoViewer コンポーネントの作成
- 基本的なマークダウン表示の実装
- TaskDetailPage への統合

### フェーズ2: 拡張機能の実装（2日）
- シンタックスハイライトの追加
- URLの自動リンク化
- チェックボックスのサポート
- テーブル表示の実装

### フェーズ3: ヘルプ機能とプレビュー機能（1日）
- マークダウンヘルプモーダルの実装
- プレビュー機能の実装
- UIの調整とスタイリング

### フェーズ4: テストと最適化（1日）
- 単体テストの作成
- 統合テストの作成
- パフォーマンス最適化
- アクセシビリティ対応

**合計予定工数: 6日**

## 技術的考慮事項

### セキュリティ
- ユーザー入力からのXSS攻撃を防ぐため、適切なサニタイズ処理を行う
- 外部リンクには `rel="noopener noreferrer"` を設定

### パフォーマンス
- 大きなメモの場合のレンダリングパフォーマンスを考慮
- 必要に応じてメモ表示のレンダリングを最適化

### アクセシビリティ
- マークダウンから変換されたHTMLが適切なARIA属性を持つようにする
- キーボードナビゲーションのサポート
- 高コントラストモードでの視認性確保

### 互換性
- 既存のメモデータとの互換性を維持
- モバイルデバイスでの表示最適化

## 将来の拡張性

1. **カスタムマークダウン拡張**
   - タスクIDの自動リンク化（例: #123 → タスク123へのリンク）
   - カスタム絵文字ショートコード

2. **エディタの強化**
   - マークダウンツールバー（太字、斜体などのボタン）
   - ドラッグ&ドロップでの画像添付

3. **検索機能の拡張**
   - メモ内容の全文検索
   - マークダウン構造を考慮した検索

## 結論

リッチタスクメモビューアーの実装により、TodoLogアプリケーションのメモ機能が大幅に強化され、ユーザーはより構造化された情報をタスクに関連付けることができるようになります。マークダウン記法のサポートにより、テキストの書式設定やリンク、コードブロックなどの高度な表現が可能になり、タスク管理の効率と情報の視認性が向上します。
