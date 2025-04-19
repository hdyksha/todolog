# Issue03: チェックボックス機能の問題調査

## 問題概要

TodoLogアプリケーションのタスク一覧画面において、チェックボックスの視覚的フィードバックが機能していない問題が発生しています。

### 現象
- チェックボックスをクリックしても、UI上でチェックマークが表示されない
- バックエンドには変更が正しく保存され、ページをリロードすると状態が反映される
- タスクの完了状態は正しく切り替わっているが、UIの即時更新が行われていない

### 影響範囲
- タスク一覧画面のすべてのチェックボックス
- ユーザーエクスペリエンスの低下（視覚的フィードバックの欠如）

## 技術的背景

### 実装アーキテクチャ
- フロントエンド: React + TypeScript
- 状態管理: React Query (TanStack Query)
- スタイリング: Tailwind CSS
- APIクライアント: Fetch API

### 関連コード

#### タスク一覧コンポーネント
```tsx
// client/src/pages/HomePage.tsx
<input
  type="checkbox"
  checked={task.completed}
  onChange={() => handleToggleCompletion(task.id)}
  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
/>
```

#### タスク完了状態切り替え処理
```tsx
// client/src/pages/HomePage.tsx
const handleToggleCompletion = async (id: string) => {
  try {
    await toggleTaskMutation.mutateAsync(id);
  } catch (err) {
    showNotification(
      err instanceof Error ? err.message : 'タスクの状態変更に失敗しました',
      'error'
    );
  }
};
```

#### React Query ミューテーション
```tsx
// client/src/services/api/taskApi.ts
export function useToggleTaskCompletion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<Task> => {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return handleApiResponse<Task>(response);
    },
    onMutate: async (id) => {
      // 楽観的更新のために現在のキャッシュを保存
      await queryClient.cancelQueries({ queryKey: ['tasks', id] });
      const previousTask = queryClient.getQueryData<Task>(['tasks', id]);
      
      // 現在のタスクを取得
      let task: Task | undefined;
      
      // 個別タスクのキャッシュから取得
      if (previousTask) {
        task = previousTask;
      } else {
        // タスク一覧から取得
        const tasks = queryClient.getQueryData<Task[]>(['tasks']);
        task = tasks?.find(t => t.id === id);
      }
      
      if (task) {
        // 楽観的に完了状態を更新
        const updatedTask = { 
          ...task, 
          completed: !task.completed,
          updatedAt: new Date().toISOString()
        };
        
        // 個別タスクのキャッシュを更新
        queryClient.setQueryData(['tasks', id], updatedTask);
        
        // タスク一覧を更新
        queryClient.setQueryData<Task[]>(['tasks'], (oldTasks = []) => {
          return oldTasks.map(t => t.id === id ? updatedTask : t);
        });
      }
      
      return { previousTask };
    },
    // エラー処理と成功処理のコードは省略
  });
}
```

## これまでの対応と結果

### 対応1: React Queryの楽観的更新の確認
- `useToggleTaskCompletion`フックの`onMutate`、`onSuccess`、`onError`ハンドラを確認
- キャッシュの更新は正しく行われているが、UIに反映されていない

### 対応2: ローカル状態管理の導入
- コンポーネント内で`localCompletedState`を使用して即時のUI更新を試みた
- 複雑さが増し、問題解決には至らなかった

### 対応3: カスタムCheckboxコンポーネントの作成
- 専用のCheckboxコンポーネントを実装
- スタイリングの問題を解決しようとしたが、効果がなかった

### 対応4: Tailwind CSSのフォームプラグイン追加
- `@tailwindcss/forms`プラグインを追加
- チェックボックスのスタイリングを改善しようとしたが、問題は解決しなかった

### 対応5: コードの簡素化
- 複雑な状態管理を削除し、シンプルな実装に戻した
- 依然として問題は解決していない

## 考えられる原因

1. **React Queryのキャッシュ更新と再レンダリングの問題**
   - キャッシュは更新されているが、コンポーネントの再レンダリングが正しく行われていない可能性

2. **ブラウザ固有の問題**
   - 特定のブラウザでチェックボックスの表示に問題がある可能性
   - ブラウザのデフォルトスタイルとTailwindのスタイルの競合

3. **CSSの問題**
   - チェックボックスのスタイリングが正しく適用されていない可能性
   - Tailwindの設定やクラスの問題

4. **イベント伝播の問題**
   - イベントハンドラが正しく動作していない可能性
   - イベントの発火と状態更新のタイミングの問題

5. **非制御コンポーネントと制御コンポーネントの混在**
   - Reactの制御コンポーネントとして正しく実装されていない可能性

## 調査方針

### 1. React Queryの動作確認
- `useToggleTaskCompletion`の実装を詳細に確認
- デバッグログを追加して、キャッシュの更新が正しく行われているか確認
- React Query DevToolsを使用して、キャッシュの状態を視覚的に確認

### 2. コンポーネントのレンダリング確認
- コンソールログを追加して、コンポーネントの再レンダリングが行われているか確認
- React Developer Toolsを使用して、コンポーネントの状態を確認

### 3. 単純化したテストケース
- 最小限のコードでチェックボックスの動作を確認
- TodoLogのコンテキストから切り離した単純なチェックボックスコンポーネントを作成してテスト

### 4. ブラウザ互換性の確認
- 異なるブラウザでの動作を確認
- ブラウザの開発者ツールを使用して、適用されているCSSを確認

### 5. 代替アプローチの検討
- チェックボックスの代わりにカスタムUIを実装（例：ボタンベースのトグル）
- 別のライブラリやフレームワークの使用を検討

## 解決案

### 解決案1: カスタムトグルコンポーネントの実装
チェックボックスの代わりに、ボタンベースのカスタムトグルコンポーネントを実装する。

```tsx
function TaskToggle({ completed, onChange }: { completed: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-5 h-5 flex items-center justify-center rounded border ${
        completed 
          ? 'bg-blue-600 border-blue-600 text-white' 
          : 'bg-white border-slate-300'
      }`}
      aria-checked={completed}
      role="checkbox"
    >
      {completed && (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}
```

### 解決案2: React Queryの再取得戦略の調整
ミューテーション成功後に強制的にデータを再取得する。

```tsx
const handleToggleCompletion = async (id: string) => {
  try {
    await toggleTaskMutation.mutateAsync(id);
    // 強制的にタスク一覧を再取得
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  } catch (err) {
    showNotification(
      err instanceof Error ? err.message : 'タスクの状態変更に失敗しました',
      'error'
    );
  }
};
```

### 解決案3: ローカル状態と同期したハイブリッドアプローチ
React Queryとローカル状態を組み合わせた、より堅牢なアプローチ。

```tsx
function TaskItem({ task, onToggle }: { task: Task; onToggle: (id: string) => Promise<void> }) {
  const [isCompleted, setIsCompleted] = useState(task.completed);
  
  // タスクの完了状態が変更されたら、ローカル状態を更新
  useEffect(() => {
    setIsCompleted(task.completed);
  }, [task.completed]);
  
  const handleToggle = async () => {
    // 即座にUIを更新
    setIsCompleted(!isCompleted);
    
    try {
      // APIを呼び出し
      await onToggle(task.id);
    } catch (err) {
      // エラー時は元の状態に戻す
      setIsCompleted(task.completed);
      // エラー通知
    }
  };
  
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        checked={isCompleted}
        onChange={handleToggle}
        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
      />
      <span className={isCompleted ? 'line-through' : ''}>{task.title}</span>
    </div>
  );
}
```

## 次のステップ

1. **デバッグ情報の追加**
   - コンソールログを追加して、状態変更のフローを追跡
   - React Query DevToolsを有効化して、キャッシュの状態を確認

2. **単純化したテストケース**
   - 最小限のコードでチェックボックスの動作を確認するテストページを作成

3. **解決案の実装と検証**
   - 上記の解決案を順次実装し、効果を検証
   - 最も効果的な解決策を本番コードに統合

4. **ブラウザ互換性のテスト**
   - 異なるブラウザでの動作確認
   - 必要に応じてブラウザ固有の対応を追加

## 参考リソース

- [React Query ドキュメント - Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [React - フォーム](https://ja.react.dev/reference/react-dom/components/input)
- [Tailwind CSS Forms プラグイン](https://github.com/tailwindlabs/tailwindcss-forms)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
