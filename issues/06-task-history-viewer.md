# Issue06: タスク履歴ビューアーの実装

## 概要

現在のTodoLogでは、完了したタスクはアーカイブセクションに移動され、単純なリスト形式で表示されています。この実装を拡張し、完了したタスクを日付ごとにグルーピングして時系列で閲覧できる「タスク履歴ビューアー」機能を追加します。これにより、ユーザーは過去にどのようなタスクをいつ完了したかを振り返ることができるようになります。

## 目的

- 完了したタスクを日付ごとにグルーピングして表示する
- 時系列順（新しい順）で閲覧できるようにする
- 過去の生産性や活動履歴を視覚的に把握しやすくする
- タスク完了の傾向や習慣を分析できるようにする

## 機能要件

### 1. 日付ごとのグルーピング表示

- 完了したタスクを完了日（updatedAt）に基づいて日付ごとにグルーピング
- 各日付セクションには、その日に完了したタスクの数を表示
- 日付セクションは折りたたみ可能に

### 2. 時系列表示

- 日付グループを新しい順（降順）に表示
- オプションで古い順（昇順）に切り替え可能
- 日付フォーマットは「YYYY年MM月DD日（曜日）」形式

### 3. フィルタリングとナビゲーション

- 特定の期間（今日、今週、今月、カスタム期間）でフィルタリング
- カレンダーUIを使用した日付範囲選択
- 月ごとのクイックナビゲーション

### 4. 統計情報

- 表示期間内の完了タスク総数
- 日ごとの完了タスク数のグラフ表示
- カテゴリ別の完了タスク分布

### 5. エクスポート機能

- 表示中の履歴をCSV形式でエクスポート
- 期間を指定してエクスポート

## UI/UXデザイン

### タスク履歴ビューアー画面

```
+----------------------------------+
| タスク履歴ビューアー             |
+----------------------------------+
| 期間: [今日▼] [カレンダー]       |
| 表示順: [新しい順▼]              |
+----------------------------------+
| 統計: 完了タスク 24件            |
| [グラフ表示]                     |
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
| [CSVエクスポート]                |
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

#### TaskHistoryViewer コンポーネント

```tsx
interface TaskHistoryViewerProps {
  tasks: Task[];
}

const TaskHistoryViewer: React.FC<TaskHistoryViewerProps> = ({ tasks }) => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // 期間に基づいてタスクをフィルタリング
  const filteredTasks = useMemo(() => {
    return filterTasksByPeriod(tasks, period, startDate, endDate);
  }, [tasks, period, startDate, endDate]);
  
  // 日付ごとにグルーピング
  const tasksByDate = useMemo(() => {
    return groupTasksByDate(filteredTasks);
  }, [filteredTasks]);
  
  // 日付の配列を取得（ソート順に応じて）
  const dateKeys = useMemo(() => {
    const keys = Object.keys(tasksByDate);
    return sortOrder === 'desc' ? keys.sort().reverse() : keys.sort();
  }, [tasksByDate, sortOrder]);
  
  return (
    <div className="task-history-viewer">
      <div className="history-controls">
        <PeriodSelector value={period} onChange={setPeriod} />
        <SortOrderSelector value={sortOrder} onChange={setSortOrder} />
        {period === 'custom' && (
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        )}
      </div>
      
      <TaskStatistics tasks={filteredTasks} />
      
      <div className="date-groups">
        {dateKeys.map(dateKey => (
          <DateGroup
            key={dateKey}
            date={new Date(dateKey)}
            tasks={tasksByDate[dateKey]}
          />
        ))}
      </div>
      
      <div className="export-controls">
        <button onClick={() => exportToCSV(filteredTasks)}>
          CSVエクスポート
        </button>
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
            <TaskHistoryItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};
```

### 3. フィルタリングロジック

```typescript
const filterTasksByPeriod = (
  tasks: Task[],
  period: 'today' | 'week' | 'month' | 'custom',
  startDate: Date | null,
  endDate: Date | null
): Task[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // 今週の開始日（日曜日）
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  // 今月の開始日
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  return tasks.filter(task => {
    if (!task.completed) return false;
    
    const taskDate = new Date(task.updatedAt);
    
    switch (period) {
      case 'today':
        return taskDate >= today;
      case 'week':
        return taskDate >= startOfWeek;
      case 'month':
        return taskDate >= startOfMonth;
      case 'custom':
        return (
          (!startDate || taskDate >= startDate) &&
          (!endDate || taskDate <= endDate)
        );
      default:
        return true;
    }
  });
};
```

### 4. 統計情報の表示

```tsx
interface TaskStatisticsProps {
  tasks: Task[];
}

const TaskStatistics: React.FC<TaskStatisticsProps> = ({ tasks }) => {
  // カテゴリ別のタスク数を集計
  const categoryCounts = useMemo(() => {
    return tasks.reduce((counts, task) => {
      const category = task.category || 'カテゴリなし';
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }, [tasks]);
  
  return (
    <div className="task-statistics">
      <h3>統計情報</h3>
      <p>完了タスク: {tasks.length}件</p>
      
      <div className="category-distribution">
        <h4>カテゴリ別</h4>
        <ul>
          {Object.entries(categoryCounts).map(([category, count]) => (
            <li key={category}>
              {category}: {count}件
            </li>
          ))}
        </ul>
      </div>
      
      <button onClick={() => showTaskCompletionGraph(tasks)}>
        グラフ表示
      </button>
    </div>
  );
};
```

### 5. CSVエクスポート機能

```typescript
const exportToCSV = (tasks: Task[]) => {
  // ヘッダー行
  const headers = ['タイトル', 'カテゴリ', '優先度', '完了日時'];
  
  // データ行
  const rows = tasks.map(task => [
    task.title,
    task.category || 'カテゴリなし',
    task.priority,
    new Date(task.updatedAt).toLocaleString()
  ]);
  
  // CSVフォーマットに変換
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // ダウンロード処理
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `task-history-${new Date().toISOString().split('T')[0]}.csv`);
  link.click();
};
```

## ルーティングの更新

タスク履歴ビューアーへのアクセスを提供するために、ナビゲーションとルーティングを更新します。

```tsx
// App.tsx
<Routes>
  <Route path="/" element={<TaskListPage />} />
  <Route path="/history" element={<TaskHistoryPage />} />
  {/* 他のルート */}
</Routes>

// Navigation.tsx
<nav>
  <NavLink to="/">タスク一覧</NavLink>
  <NavLink to="/history">履歴</NavLink>
  {/* 他のナビゲーション項目 */}
</nav>
```

## テスト計画

### 単体テスト

1. タスクのグルーピングロジックのテスト
   - 日付ごとに正しくグルーピングされるか
   - 空のタスクリストを処理できるか

2. フィルタリングロジックのテスト
   - 各期間（今日、今週、今月、カスタム）で正しくフィルタリングされるか
   - 日付範囲が正しく適用されるか

3. コンポーネントのテスト
   - TaskHistoryViewer コンポーネントが正しくレンダリングされるか
   - DateGroup コンポーネントの折りたたみ/展開が機能するか
   - 統計情報が正しく計算されるか

### 統合テスト

1. 期間選択とタスク表示の連携テスト
   - 期間を変更すると表示されるタスクが更新されるか

2. ソート順変更のテスト
   - ソート順を変更すると日付グループの順序が更新されるか

3. CSVエクスポート機能のテスト
   - 正しいフォーマットでCSVファイルが生成されるか

### アクセシビリティテスト

1. キーボードナビゲーションのテスト
2. スクリーンリーダー対応のテスト
3. 色のコントラスト比のテスト

## 期待される成果

- ユーザーが過去の活動履歴を時系列で振り返ることができる
- 日々の生産性や活動パターンを視覚的に把握できる
- 完了したタスクの記録を整理された形式で閲覧できる
- 必要に応じてタスク履歴をエクスポートして外部で分析できる

## 注意点

- 大量のタスク履歴がある場合のパフォーマンス最適化
- モバイル表示での使いやすさの確保
- 日付フォーマットの国際化対応
- プライバシーとデータ保持ポリシーの考慮

## 実装ステップ

### フェーズ1: 基本実装 (2-3日)

1. データ処理ロジックの実装
   - タスクの日付ごとのグルーピング
   - 期間によるフィルタリング
   - ソート機能

2. 基本UIコンポーネントの実装
   - TaskHistoryViewer コンポーネント
   - DateGroup コンポーネント
   - TaskHistoryItem コンポーネント

3. ルーティングとナビゲーションの更新
   - 履歴ビューアーページの追加
   - ナビゲーションリンクの追加

### フェーズ2: 拡張機能 (2-3日)

1. 統計情報の実装
   - 完了タスク数の集計
   - カテゴリ別分布の表示
   - 簡易グラフ表示

2. フィルタリングUIの拡張
   - 期間選択コンポーネント
   - カレンダーによる日付範囲選択
   - ソート順切り替え

3. CSVエクスポート機能の実装
   - データフォーマット変換
   - ファイルダウンロード機能

### フェーズ3: UI/UX改善 (1-2日)

1. レスポンシブデザインの最適化
   - モバイル表示の調整
   - タッチ操作の対応

2. アニメーションとトランジション
   - 日付グループの展開/折りたたみアニメーション
   - フィルター変更時のトランジション

3. アクセシビリティ対応
   - キーボードナビゲーション
   - スクリーンリーダー対応
   - 適切なARIA属性の追加

### フェーズ4: テストとドキュメント (1-2日)

1. 単体テストの実装
2. 統合テストの実装
3. アクセシビリティテスト
4. ドキュメントの更新
   - 開発者向けドキュメント
   - ユーザーマニュアル
