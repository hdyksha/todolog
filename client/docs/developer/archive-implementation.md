# アーカイブ機能の実装

## 概要

アーカイブ機能は、完了したタスクを視覚的に分離し、ユーザーがアクティブなタスクに集中できるようにするための機能です。このドキュメントでは、アーカイブ機能の技術的な実装について説明します。

## アーキテクチャ

アーカイブ機能は、既存のタスク管理システムを拡張する形で実装されています。完了したタスクを別のデータ構造に移動するのではなく、既存の `completed` フラグを活用し、UIレベルでの表示分離を行っています。

### コンポーネント構成

```
components/
└── archive/
    ├── ArchiveSection.tsx       # アーカイブセクション全体
    ├── ArchiveHeader.tsx        # アーカイブのヘッダー部分
    ├── ArchivedTaskList.tsx     # アーカイブされたタスクのリスト
    ├── DateGroup.tsx            # 日付ごとのタスクグループ
    ├── ArchiveStats.tsx         # 統計情報の表示
    └── ArchiveSettings.tsx      # アーカイブ関連の設定UI
```

### カスタムフック

```
hooks/
└── useArchiveStats.ts           # アーカイブ統計を計算するフック
```

## データフロー

1. TaskList コンポーネントがタスクを `completed` フラグに基づいて分類
2. アクティブなタスクは通常のリストに表示
3. 完了したタスクは ArchiveSection コンポーネントに渡される
4. ArchiveSection は設定に基づいて表示/非表示を切り替え
5. ArchivedTaskList が完了したタスクを日付ごとにグループ化
6. DateGroup コンポーネントが各日付のタスクを表示
7. useArchiveStats フックが統計情報を計算

## 主要コンポーネントの説明

### ArchiveSection

アーカイブセクション全体を管理するコンポーネントです。

```tsx
interface ArchiveSectionProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onEditMemo?: (id: string) => void;
}

const ArchiveSection: React.FC<ArchiveSectionProps> = ({
  tasks,
  onToggleComplete,
  onDelete,
  onEdit,
  onEditMemo,
}) => {
  const { settings } = useSettings();
  const [isExpanded, setIsExpanded] = useState(settings.autoExpandArchive);
  const archiveStats = useArchiveStats(tasks);
  
  // 設定が変更されたときに展開状態を更新
  useEffect(() => {
    setIsExpanded(settings.autoExpandArchive);
  }, [settings.autoExpandArchive]);
  
  // アーカイブ表示設定がオフの場合は何も表示しない
  if (!settings.showArchive) {
    return null;
  }

  return (
    <div className="archive-section">
      <ArchiveHeader
        archivedTasksCount={tasks.filter(task => task.completed).length}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
        stats={archiveStats}
      />
      
      {isExpanded && (
        <ArchivedTaskList
          tasks={tasks}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onEdit={onEdit}
          onEditMemo={onEditMemo}
        />
      )}
    </div>
  );
};
```

### ArchivedTaskList

アーカイブされたタスクを日付ごとにグループ化して表示するコンポーネントです。

```tsx
interface ArchivedTaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onEditMemo?: (id: string) => void;
}

const ArchivedTaskList: React.FC<ArchivedTaskListProps> = ({
  tasks,
  onToggleComplete,
  onDelete,
  onEdit,
  onEditMemo,
}) => {
  // 完了済みタスクのみをフィルタリング
  const archivedTasks = useMemo(() => {
    return tasks.filter(task => task.completed);
  }, [tasks]);
  
  // 日付ごとにグルーピング
  const tasksByDate = useMemo(() => {
    return groupTasksByDate(archivedTasks);
  }, [archivedTasks]);
  
  // 日付の配列を取得（新しい順）
  const dateKeys = useMemo(() => {
    return Object.keys(tasksByDate).sort().reverse();
  }, [tasksByDate]);
  
  if (archivedTasks.length === 0) {
    return (
      <div 
        className="no-archived-tasks"
        role="status"
        aria-live="polite"
      >
        アーカイブされたタスクはありません
      </div>
    );
  }
  
  return (
    <div 
      className="archived-task-list"
      role="region"
      aria-label="アーカイブされたタスク一覧"
    >
      {dateKeys.map(dateKey => (
        <DateGroup
          key={dateKey}
          date={new Date(dateKey)}
          tasks={tasksByDate[dateKey]}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onEdit={onEdit}
          onEditMemo={onEditMemo}
        />
      ))}
    </div>
  );
};
```

### DateGroup

日付ごとのタスクグループを表示するコンポーネントです。

```tsx
interface DateGroupProps {
  date: Date;
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onEditMemo?: (id: string) => void;
}

const DateGroup: React.FC<DateGroupProps> = ({
  date,
  tasks,
  onToggleComplete,
  onDelete,
  onEdit,
  onEditMemo,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // 日付を「YYYY年MM月DD日（曜日）」形式でフォーマット
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    
    return `${year}年${month}月${day}日（${dayOfWeek}）`;
  };
  
  const formattedDate = formatDate(date);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpand();
    }
  };
  
  const dateString = date.toISOString().split('T')[0];
  const tasksId = `date-tasks-${dateString}`;
  
  return (
    <div className="date-group">
      <div 
        className="date-header"
        onClick={toggleExpand}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={tasksId}
      >
        <span className="date-text">{formattedDate}</span>
        <span className="task-count">{tasks.length}件</span>
        <span 
          className="toggle-button" 
          aria-hidden="true"
        >
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>
      
      {isExpanded && (
        <div 
          className="date-tasks" 
          id={tasksId}
        >
          <ul className="task-list">
            {tasks.map(task => (
              <li key={task.id} className="task-list-item">
                <TaskItem
                  task={task}
                  isArchived={true}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onEditMemo={onEditMemo}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

### useArchiveStats フック

アーカイブ統計を計算するカスタムフックです。

```tsx
export interface ArchiveStats {
  total: number;
  today: number;
  thisWeek: number;
}

export const useArchiveStats = (tasks: Task[]): ArchiveStats => {
  return useMemo(() => {
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
};
```

## 日付ごとのグルーピング

タスクを日付ごとにグルーピングするユーティリティ関数です。

```typescript
interface TasksByDate {
  [date: string]: Task[];
}

export const groupTasksByDate = (tasks: Task[]): TasksByDate => {
  return tasks.reduce((groups, task) => {
    // タスクの完了日（updatedAt）から日付部分のみを抽出
    const dateStr = new Date(task.updatedAt).toISOString().split('T')[0];
    
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    
    groups[dateStr].push(task);
    return groups;
  }, {} as TasksByDate);
};
```

## 設定管理

アーカイブ機能の設定は、アプリケーション全体の設定コンテキストで管理されています。

```tsx
interface Settings {
  // 既存の設定...
  showArchive: boolean;
  autoExpandArchive: boolean;
  showArchiveStats: boolean;
}

const defaultSettings: Settings = {
  // 既存の設定...
  showArchive: true,
  autoExpandArchive: false,
  showArchiveStats: true
};
```

## スタイリング

アーカイブ機能のスタイルは、以下のCSSファイルで定義されています。

```
components/archive/ArchiveSection.css
components/archive/ArchiveHeader.css
components/archive/ArchivedTaskList.css
components/archive/DateGroup.css
```

主なスタイリングの特徴：

```css
/* アーカイブセクションのスタイル */
.archive-section {
  margin-top: 2rem;
  border-top: 1px solid #e0e0e0;
}

/* 日付グループのスタイル */
.date-group {
  margin-bottom: 1rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.date-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: #e3f2fd;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
  color: #0d47a1;
  position: relative;
}

/* アーカイブされたタスクのスタイル */
.task-archived {
  background-color: #f5f5f5;
  opacity: 0.8;
}

.task-archived .task-title {
  color: #666666;
}
```

## アクセシビリティ対応

アーカイブ機能は、以下のアクセシビリティ対応を行っています。

### キーボードナビゲーション

- 日付ヘッダーは `tabIndex={0}` で設定され、キーボードでフォーカス可能
- Enter/Space キーで日付グループの展開/折りたたみが可能
- 適切なフォーカス表示のためのCSSスタイル

### スクリーンリーダー対応

- 適切なARIA属性の使用
  - `role="button"` - 日付ヘッダーの役割を明示
  - `aria-expanded` - 展開状態を示す
  - `aria-controls` - 制御対象の要素を指定
  - `aria-hidden="true"` - 装飾的な要素を非表示
  - `role="region"` - アーカイブリスト全体の役割を明示
  - `aria-label` - 要素の説明を提供
  - `role="status"` - ステータスメッセージの役割を明示
  - `aria-live="polite"` - 動的な変更を通知

### HTML構造

- セマンティックなHTML要素の使用
- リスト項目には適切な `<ul>` と `<li>` の構造

## テスト

アーカイブ機能のテストは、以下のファイルで実装されています。

```
components/archive/ArchiveSection.test.tsx
components/archive/ArchiveHeader.test.tsx
components/archive/ArchivedTaskList.test.tsx
components/archive/DateGroup.test.tsx
components/archive/ArchiveStats.test.tsx
components/archive/ArchiveSettings.test.tsx
hooks/useArchiveStats.test.ts
```

アクセシビリティテストも実装されています。

```
components/archive/ArchivedTaskList.a11y.test.tsx
components/archive/DateGroup.a11y.test.tsx
```

## パフォーマンス最適化

- `useMemo` を使用して不要な再計算を防止
- 条件付きレンダリングによる効率化
- 適切なキーの使用によるリストの最適化

## 今後の拡張予定

- アーカイブ内のタスクを一括削除する機能
- アーカイブ内のタスクをフィルタリングする機能
- 日付範囲によるフィルタリング機能
- カテゴリ別のグルーピングオプション
- アーカイブデータのエクスポート機能
