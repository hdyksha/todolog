# Issue04: タスクアーカイブ機能の実装

## 概要

現在のTodoLogでは、完了したタスクは通常のタスク一覧内に表示され、タイトルに打消し線が適用されています。この実装を改善し、完了したタスクを別のアーカイブセクションに移動させ、打消し線を使用しない新しいデザインを適用します。

## 目的

- 完了したタスクとアクティブなタスクを視覚的に明確に分離する
- タスク一覧をよりクリーンに保ち、アクティブなタスクに集中しやすくする
- 完了したタスクの履歴を保持しつつ、メインのタスク一覧をシンプルに保つ
- 打消し線を使わない、よりモダンなデザインを適用する

## 機能要件

### 1. アーカイブセクションの作成

- タスク一覧の下部に「アーカイブ」セクションを新設
- アーカイブセクションは折りたたみ可能に
- アーカイブセクションのヘッダーには完了タスク数を表示

### 2. タスクの自動アーカイブ

- タスクが完了としてマークされたとき、自動的にアーカイブセクションに移動
- アーカイブされたタスクを未完了に戻した場合、メインのタスク一覧に戻る

### 3. アーカイブタスクのデザイン

- 打消し線を使用せず、視覚的に完了状態を表現
- 透明度を下げる（opacity: 0.7など）
- 背景色を変更（薄いグレーなど）
- 完了アイコンを表示（チェックマークなど）

### 4. アーカイブ管理機能

- アーカイブ内のタスクを一括削除する機能
- アーカイブ内のタスクをフィルタリングする機能
- アーカイブの表示/非表示を切り替える設定

### 5. アーカイブ統計

- アーカイブされたタスクの統計情報を表示
  - 今日完了したタスク数
  - 今週完了したタスク数
  - 合計完了タスク数

## UI/UXデザイン

### メインタスクリスト

```
+----------------------------------+
| アクティブなタスク (3)           |
+----------------------------------+
| ○ プロジェクト計画を作成する     |
| ○ ミーティングの準備をする       |
| ○ レポートを提出する             |
+----------------------------------+

+----------------------------------+
| アーカイブ済み (5) ▼             |
+----------------------------------+
| ✓ デザイン案を確認する           |
| ✓ 予算を計算する                 |
| ✓ クライアントに連絡する         |
| ✓ プレゼン資料を作成する         |
| ✓ 週次レポートを提出する         |
+----------------------------------+
```

### アーカイブタスクのスタイル

- 背景色: 薄いグレー (#f5f5f5)
- テキスト色: 通常より少し薄い (#666666)
- 透明度: 0.8
- アイコン: チェックマーク (✓)
- タイトル: 打消し線なし
- その他の情報（日付、カテゴリなど）: 若干小さめのフォントサイズ

## 技術的な実装

### 1. データモデルの更新

現在のタスクモデルに `archived` フラグを追加する必要はなく、既存の `completed` フラグを使用します。

### 2. コンポーネントの変更

#### TaskList コンポーネントの更新

```tsx
const TaskList: React.FC<TaskListProps> = ({ tasks, ...props }) => {
  // タスクをアクティブとアーカイブに分類
  const activeTasks = tasks.filter(task => !task.completed);
  const archivedTasks = tasks.filter(task => task.completed);
  
  // アーカイブセクションの表示状態
  const [isArchiveVisible, setIsArchiveVisible] = useState(true);
  
  return (
    <div className="task-list-container">
      {/* アクティブなタスクセクション */}
      <div className="task-list-section">
        <h2>アクティブなタスク ({activeTasks.length})</h2>
        <div className="task-list">
          {activeTasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              {...props} 
            />
          ))}
          {activeTasks.length === 0 && (
            <EmptyState message="アクティブなタスクはありません" />
          )}
        </div>
      </div>
      
      {/* アーカイブセクション */}
      <div className="archive-section">
        <div 
          className="archive-header"
          onClick={() => setIsArchiveVisible(!isArchiveVisible)}
        >
          <h2>アーカイブ済み ({archivedTasks.length})</h2>
          <button className="toggle-button">
            {isArchiveVisible ? '▼' : '▶'}
          </button>
        </div>
        
        {isArchiveVisible && (
          <div className="archived-tasks">
            {archivedTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                isArchived={true}
                {...props} 
              />
            ))}
            {archivedTasks.length === 0 && (
              <EmptyState message="アーカイブされたタスクはありません" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
```

#### TaskItem コンポーネントの更新

```tsx
interface TaskItemProps {
  task: Task;
  isArchived?: boolean;
  onToggleComplete: (id: string) => void;
  // その他のprops
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  isArchived = false,
  onToggleComplete,
  // その他のprops
}) => {
  // タスクのクラス名を動的に設定
  const taskClassName = classNames('task-item', {
    'task-archived': isArchived,
    // 'task-completed': task.completed, // 打消し線スタイルを削除
  });
  
  return (
    <div className={taskClassName}>
      <div className="task-checkbox">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleComplete(task.id)}
        />
        {isArchived && <span className="check-icon">✓</span>}
      </div>
      
      <div className="task-content">
        <div className="task-title">{task.title}</div>
        {/* その他のタスク情報 */}
      </div>
      
      {/* タスク操作ボタン */}
    </div>
  );
};
```

#### CSS の更新

```css
/* アーカイブセクションのスタイル */
.archive-section {
  margin-top: 2rem;
  border-top: 1px solid #e0e0e0;
}

.archive-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  cursor: pointer;
}

.archive-header h2 {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.toggle-button {
  background: none;
  border: none;
  font-size: 1rem;
  color: #666;
  cursor: pointer;
}

/* アーカイブされたタスクのスタイル */
.task-archived {
  background-color: #f5f5f5;
  opacity: 0.8;
}

.task-archived .task-title {
  color: #666666;
  /* text-decoration: line-through; */ /* 打消し線を削除 */
}

.task-archived .task-meta {
  font-size: 0.9em;
}

.check-icon {
  margin-left: 0.5rem;
  color: #4caf50;
}
```

### 3. 状態管理の更新

タスクの状態管理を担当するコンテキストやカスタムフックを更新し、アーカイブ関連の機能を追加します。

```tsx
// useTasksState フックの更新
const useTasksState = () => {
  // 既存のコード...
  
  // アーカイブ関連の機能
  const clearArchive = async () => {
    try {
      // 完了済みタスクをすべて取得
      const archivedTasks = tasks.filter(task => task.completed);
      
      // 各タスクを削除
      for (const task of archivedTasks) {
        await apiClient.tasks.delete(task.id);
      }
      
      // タスク一覧を更新
      fetchTasks();
      
      // 成功通知
      showNotification('success', 'アーカイブを空にしました');
    } catch (error) {
      console.error('Failed to clear archive:', error);
      showNotification('error', 'アーカイブの削除に失敗しました');
    }
  };
  
  // アーカイブ統計
  const archiveStats = useMemo(() => {
    const archivedTasks = tasks.filter(task => task.completed);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const completedToday = archivedTasks.filter(task => {
      const completedDate = new Date(task.updatedAt);
      return completedDate >= today;
    }).length;
    
    const completedThisWeek = archivedTasks.filter(task => {
      const completedDate = new Date(task.updatedAt);
      return completedDate >= startOfWeek;
    }).length;
    
    return {
      total: archivedTasks.length,
      today: completedToday,
      thisWeek: completedThisWeek
    };
  }, [tasks]);
  
  return {
    // 既存の戻り値...
    clearArchive,
    archiveStats
  };
};
```

### 4. 設定オプションの追加

ユーザー設定に新しいオプションを追加します。

```tsx
// UIContext の更新
interface UISettings {
  // 既存の設定...
  showArchive: boolean; // アーカイブセクションの表示/非表示
  autoExpandArchive: boolean; // アーカイブセクションを自動的に展開するかどうか
}

const defaultSettings: UISettings = {
  // 既存の設定...
  showArchive: true,
  autoExpandArchive: false
};
```

## テスト計画

### 単体テスト

1. TaskList コンポーネントのテスト
   - アクティブタスクとアーカイブタスクが正しく分類されるか
   - アーカイブセクションの折りたたみ/展開が機能するか

2. TaskItem コンポーネントのテスト
   - アーカイブされたタスクの表示が正しいか
   - 完了状態の切り替えが正しく動作するか

3. useTasksState フックのテスト
   - clearArchive 関数が正しく動作するか
   - archiveStats が正しく計算されるか

### 統合テスト

1. タスク完了時のアーカイブ動作テスト
   - タスクを完了としてマークすると、アーカイブセクションに移動するか
   - アーカイブされたタスクを未完了に戻すと、アクティブセクションに戻るか

2. アーカイブ管理機能のテスト
   - アーカイブを空にする機能が正しく動作するか
   - アーカイブの表示/非表示設定が保存されるか

### アクセシビリティテスト

1. アーカイブセクションのキーボードアクセシビリティ
2. スクリーンリーダー対応
3. 色のコントラスト比

## 期待される成果

- より整理されたタスク一覧UI
- 完了タスクとアクティブタスクの明確な視覚的分離
- 打消し線を使用しない、よりモダンなデザイン
- アーカイブ管理機能による柔軟なタスク履歴管理
- 完了タスクの統計情報による生産性の可視化

## 注意点

- 既存のフィルタリング機能との整合性を確保する
- パフォーマンスへの影響を最小限に抑える（特に多数のタスクがある場合）
- アクセシビリティを確保する
- モバイル表示での使いやすさを確保する

## 実装ステップ

### フェーズ1: 基本実装 (1-2日) ✅

1. ✅ TaskList コンポーネントの更新
   - ✅ タスクをアクティブとアーカイブに分類
   - ✅ アーカイブセクションの基本レイアウト実装
   - ✅ アーカイブセクションの折りたたみ機能実装

2. ✅ TaskItem コンポーネントの更新
   - ✅ アーカイブされたタスクのスタイル実装
   - ✅ 打消し線を使用しない新しいデザイン適用

3. ✅ CSS の更新
   - ✅ アーカイブセクションのスタイル
   - ✅ アーカイブされたタスクのスタイル

### フェーズ2: 機能拡張 (1-2日)

1. アーカイブ管理機能の実装
   - アーカイブを空にする機能
   - アーカイブのフィルタリング

2. 状態管理の更新
   - アーカイブ関連の機能追加
   - アーカイブ統計の実装

3. 設定オプションの追加
   - アーカイブの表示/非表示設定
   - アーカイブの自動展開設定

### フェーズ3: テストとドキュメント (1日)

1. 単体テストの実装
2. 統合テストの実装
3. アクセシビリティテスト
4. ドキュメントの更新
   - 開発者向けドキュメント
   - ユーザーマニュアル
