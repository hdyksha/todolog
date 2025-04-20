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
5. useArchiveStats フックが統計情報を計算

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
  
  // アーカイブされたタスク（完了済みタスク）のみをフィルタリング
  const archivedTasks = tasks.filter(task => task.completed);
  
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
        archivedTasksCount={archivedTasks.length}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
        stats={archiveStats}
      />
      
      {isExpanded && (
        <div className="archived-tasks">
          {archivedTasks.length === 0 ? (
            <p className="no-tasks">アーカイブされたタスクはありません</p>
          ) : (
            <div className="task-list">
              {archivedTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isArchived={true}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onEditMemo={onEditMemo}
                />
              ))}
            </div>
          )}
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

アーカイブされたタスクには、通常のタスクとは異なるスタイルが適用されます。

```css
/* アーカイブセクションのスタイル */
.archive-section {
  margin-top: 2rem;
  border-top: 1px solid #e0e0e0;
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
```

## アクセシビリティ対応

アーカイブ機能は、以下のアクセシビリティ対応を行っています。

- 適切なARIA属性の使用
- キーボードナビゲーション対応
- 十分なコントラスト比の確保
- スクリーンリーダー対応

## テスト

アーカイブ機能のテストは、以下のファイルで実装されています。

```
components/archive/ArchiveSection.test.tsx
components/archive/ArchiveHeader.test.tsx
components/archive/ArchiveStats.test.tsx
components/archive/ArchiveSettings.test.tsx
hooks/useArchiveStats.test.ts
```

## 今後の拡張予定

- アーカイブ内のタスクを一括削除する機能
- アーカイブ内のタスクをフィルタリングする機能
- アーカイブデータのエクスポート機能
