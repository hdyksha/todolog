# Issue06: アーカイブタスクの日付別グルーピング表示

## 概要

現在のTodoLogでは、完了したタスクはアーカイブセクションに移動され、単純なリスト形式で表示されています。この実装を拡張し、アーカイブされたタスクを完了日ごとにグルーピングして時系列で閲覧できるようにします。これにより、ユーザーは過去にどのようなタスクをいつ完了したかを視覚的に把握しやすくなります。

## 目的

- アーカイブされたタスクを完了日ごとにグルーピングして表示する
- 時系列順（新しい順）で閲覧できるようにする
- 過去の活動履歴を視覚的に把握しやすくする
- 既存のアーカイブ機能を拡張し、使いやすさを向上させる

## 機能要件

### 1. 日付ごとのグルーピング表示

- 完了したタスクを完了日（updatedAt）に基づいて日付ごとにグルーピング
- 各日付セクションには、その日に完了したタスクの数を表示
- 日付セクションは折りたたみ可能に

### 2. 時系列表示

- 日付グループを新しい順（降順）に表示
- 日付フォーマットは「YYYY年MM月DD日（曜日）」形式

## UI/UXデザイン

### アーカイブタスク表示画面

```
+----------------------------------+
| アーカイブ済みタスク             |
+----------------------------------+
| 2025年4月20日（日）- 5件         |
| ▼                               |
+----------------------------------+
| ✓ プロジェクト計画書を作成       |
| ✓ クライアントにメール送信       |
| ✓ 会議の議事録をまとめる         |
| ✓ 予算案の見直し                 |
| ✓ チームミーティングの準備       |
+----------------------------------+
| 2025年4月19日（土）- 3件         |
| ▼                               |
+----------------------------------+
| ✓ 週次レポートの提出             |
| ✓ プレゼン資料の作成             |
| ✓ バグ修正                       |
+----------------------------------+
| 2025年4月18日（金）- 4件         |
| ▶                               |
+----------------------------------+
| ...                              |
+----------------------------------+
```

### 日付セクションのスタイル

- ヘッダー背景色: 薄い青 (#e3f2fd)
- 日付テキスト: 太字、中サイズ
- 完了タスク数: 丸囲み数字またはバッジ
- 展開/折りたたみアイコン: ▼/▶

### タスク項目のスタイル

- 背景色: 白 (#ffffff)
- 区切り線: 薄いグレー (#f0f0f0)
- 完了アイコン: チェックマーク (✓)
- タスク情報: タイトル、カテゴリ、優先度を表示

## 技術的な実装

### 1. データ処理

タスクの完了日に基づいてグルーピングするロジックを実装します。

```typescript
interface TasksByDate {
  [date: string]: Task[];
}

const groupTasksByDate = (tasks: Task[]): TasksByDate => {
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

### 2. コンポーネントの作成

#### ArchivedTaskList コンポーネント

```tsx
interface ArchivedTaskListProps {
  tasks: Task[];
}

const ArchivedTaskList: React.FC<ArchivedTaskListProps> = ({ tasks }) => {
  // 日付ごとにグルーピング
  const tasksByDate = useMemo(() => {
    return groupTasksByDate(tasks);
  }, [tasks]);
  
  // 日付の配列を取得（新しい順）
  const dateKeys = useMemo(() => {
    return Object.keys(tasksByDate).sort().reverse();
  }, [tasksByDate]);
  
  return (
    <div className="archived-task-list">
      <div className="date-groups">
        {dateKeys.map(dateKey => (
          <DateGroup
            key={dateKey}
            date={new Date(dateKey)}
            tasks={tasksByDate[dateKey]}
          />
        ))}
      </div>
    </div>
  );
};
```

#### DateGroup コンポーネント

```tsx
interface DateGroupProps {
  date: Date;
  tasks: Task[];
}

const DateGroup: React.FC<DateGroupProps> = ({ date, tasks }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const formattedDate = formatDate(date); // YYYY年MM月DD日（曜日）形式
  
  return (
    <div className="date-group">
      <div 
        className="date-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="date-text">{formattedDate}</span>
        <span className="task-count">{tasks.length}件</span>
        <button className="toggle-button">
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="date-tasks">
          {tasks.map(task => (
            <ArchivedTaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};
```

### 3. 日付フォーマット

```typescript
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
  
  return `${year}年${month}月${day}日（${dayOfWeek}）`;
};
```

## テスト計画

### 単体テスト

1. タスクのグルーピングロジックのテスト
   - 日付ごとに正しくグルーピングされるか
   - 空のタスクリストを処理できるか

2. コンポーネントのテスト
   - ArchivedTaskList コンポーネントが正しくレンダリングされるか
   - DateGroup コンポーネントの折りたたみ/展開が機能するか

### 統合テスト

1. アーカイブ済みタスクの表示テスト
   - 日付ごとに正しくグループ化されて表示されるか
   - 日付が新しい順に表示されるか

### アクセシビリティテスト

1. キーボードナビゲーションのテスト
2. スクリーンリーダー対応のテスト
3. 色のコントラスト比のテスト

## 期待される成果

- ユーザーが過去の活動履歴を時系列で振り返ることができる
- 完了したタスクの記録を整理された形式で閲覧できる
- アーカイブ機能の使いやすさが向上する

## 注意点

- 大量のタスク履歴がある場合のパフォーマンス最適化
- モバイル表示での使いやすさの確保
- 日付フォーマットの国際化対応

## 実装ステップ

### フェーズ1: 基本実装 (1-2日)

1. [x] データ処理ロジックの実装
   - [x] タスクの日付ごとのグルーピング
   - [x] 日付の降順ソート

2. [x] 基本UIコンポーネントの実装
   - [x] ArchivedTaskList コンポーネント
   - [x] DateGroup コンポーネント
   - [x] ArchivedTaskItem コンポーネント

### フェーズ2: UI/UX改善 (1日)

1. [ ] レスポンシブデザインの最適化
   - [ ] モバイル表示の調整
   - [ ] タッチ操作の対応

2. [ ] アニメーションとトランジション
   - [ ] 日付グループの展開/折りたたみアニメーション

3. [ ] アクセシビリティ対応
   - [ ] キーボードナビゲーション
   - [ ] スクリーンリーダー対応
   - [ ] 適切なARIA属性の追加

### フェーズ3: テストとドキュメント (1日)

1. [x] 単体テストの実装
2. [x] 統合テストの実装
3. [ ] アクセシビリティテスト
4. [ ] ドキュメントの更新
