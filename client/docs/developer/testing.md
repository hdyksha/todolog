# TodoLog テストガイド

## テスト環境

TodoLogでは、以下のテストツールを使用しています：

- **Vitest**: テストランナー
- **React Testing Library**: コンポーネントのテスト
- **MSW (Mock Service Worker)**: APIモック
- **jest-axe**: アクセシビリティテスト

## テスト実行方法

### すべてのテストを実行

```bash
# プロジェクトルートから
npm run test

# クライアントディレクトリから
cd client
npm run test
```

### 特定のテストファイルを実行

```bash
# 特定のファイルのテストを実行
npm run test -- src/components/Button.test.tsx

# 特定のパターンに一致するテストを実行
npm run test -- --testNamePattern="Button"
```

### ウォッチモードでテストを実行

```bash
npm run test:watch
```

### テストカバレッジを確認

```bash
npm run test:coverage
```

カバレッジレポートは `client/coverage` ディレクトリに生成されます。

## テストの種類

### 1. 単体テスト

個々のコンポーネント、フック、ユーティリティ関数の動作を検証します。

#### コンポーネントのテスト

```typescript
// src/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from './Button';

describe('Button コンポーネント', () => {
  it('ボタンがレンダリングされること', () => {
    render(<Button>クリック</Button>);
    expect(screen.getByRole('button', { name: 'クリック' })).toBeInTheDocument();
  });

  it('クリックイベントが発火すること', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>クリック</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'クリック' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('無効状態のボタンがレンダリングされること', () => {
    render(<Button disabled>クリック</Button>);
    expect(screen.getByRole('button', { name: 'クリック' })).toBeDisabled();
  });

  it('ローディング状態のボタンがレンダリングされること', () => {
    render(<Button isLoading>クリック</Button>);
    expect(screen.getByRole('button', { name: 'クリック' })).toBeDisabled();
    expect(screen.getByRole('button')).toHaveClass('button-loading');
  });
});
```

#### カスタムフックのテスト

```typescript
// src/hooks/useTaskFilters.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTaskFilters } from './useTaskFilters';
import { Priority } from '../types';

describe('useTaskFilters フック', () => {
  it('初期状態が正しいこと', () => {
    const { result } = renderHook(() => useTaskFilters());
    
    expect(result.current.filter).toEqual({});
    expect(result.current.sortBy).toEqual({
      field: 'createdAt',
      direction: 'desc',
    });
  });

  it('フィルターを設定できること', () => {
    const { result } = renderHook(() => useTaskFilters());
    
    act(() => {
      result.current.setFilter({ completed: true });
    });
    
    expect(result.current.filter).toEqual({ completed: true });
  });

  it('ソート条件を設定できること', () => {
    const { result } = renderHook(() => useTaskFilters());
    
    act(() => {
      result.current.setSortBy({ field: 'priority', direction: 'asc' });
    });
    
    expect(result.current.sortBy).toEqual({
      field: 'priority',
      direction: 'asc',
    });
  });

  it('フィルターをリセットできること', () => {
    const { result } = renderHook(() => useTaskFilters());
    
    act(() => {
      result.current.setFilter({ 
        completed: true,
        priority: Priority.High,
        category: 'work',
      });
    });
    
    act(() => {
      result.current.resetFilters();
    });
    
    expect(result.current.filter).toEqual({});
  });
});
```

#### ユーティリティ関数のテスト

```typescript
// src/utils/date.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, isOverdue, getDaysRemaining } from './date';

describe('日付ユーティリティ関数', () => {
  it('formatDate が正しい形式で日付をフォーマットすること', () => {
    const date = new Date('2023-04-15T12:00:00Z');
    expect(formatDate(date)).toBe('2023年4月15日');
  });

  it('isOverdue が期限切れを正しく判定すること', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // 昨日
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1); // 明日
    
    expect(isOverdue(pastDate.toISOString())).toBe(true);
    expect(isOverdue(futureDate.toISOString())).toBe(false);
  });

  it('getDaysRemaining が残り日数を正しく計算すること', () => {
    const today = new Date();
    
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    expect(getDaysRemaining(tomorrow.toISOString())).toBe(1);
    expect(getDaysRemaining(nextWeek.toISOString())).toBe(7);
  });
});
```

### 2. 統合テスト

複数のコンポーネントやサービスの連携を検証します。

```typescript
// src/tests/integration/TaskCreationFlow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TasksProvider } from '../../contexts/TasksContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import TasksPage from '../../pages/TasksPage';
import { server } from '../mocks/server';
import { rest } from 'msw';

describe('タスク作成フロー', () => {
  it('新しいタスクを作成できること', async () => {
    // APIモックの設定
    server.use(
      rest.post('/api/tasks', (req, res, ctx) => {
        return res(
          ctx.status(201),
          ctx.json({
            id: 'new-task-id',
            title: 'テストタスク',
            priority: 'medium',
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        );
      })
    );
    
    // コンポーネントのレンダリング
    render(
      <NotificationProvider>
        <TasksProvider>
          <TasksPage />
        </TasksProvider>
      </NotificationProvider>
    );
    
    // タスク作成ボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: /タスクを作成/i }));
    
    // モーダルが表示されることを確認
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // フォームに入力
    fireEvent.change(screen.getByLabelText(/タイトル/i), {
      target: { value: 'テストタスク' },
    });
    
    // 優先度を選択
    fireEvent.click(screen.getByLabelText(/中/i));
    
    // フォームを送信
    fireEvent.click(screen.getByRole('button', { name: /作成/i }));
    
    // タスクが作成され、リストに表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('テストタスク')).toBeInTheDocument();
    });
    
    // 成功通知が表示されることを確認
    expect(screen.getByText(/タスクが作成されました/i)).toBeInTheDocument();
  });
});
```

### 3. アクセシビリティテスト

コンポーネントのアクセシビリティを検証します。

```typescript
// src/components/ui/Button.a11y.test.tsx
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe } from '../../tests/axe-helper';
import Button from './Button';

describe('Button コンポーネントのアクセシビリティ', () => {
  it('通常状態でアクセシビリティ違反がないこと', async () => {
    const { container } = render(<Button>クリック</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('無効状態でもアクセシビリティ違反がないこと', async () => {
    const { container } = render(<Button disabled>クリック</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ローディング状態でもアクセシビリティ違反がないこと', async () => {
    const { container } = render(<Button isLoading>クリック</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## テストユーティリティ

### テスト用のレンダリングヘルパー

```typescript
// src/tests/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { TasksProvider } from '../contexts/TasksContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { UIProvider } from '../contexts/UIContext';

// すべてのプロバイダーをラップするカスタムレンダー関数
function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <NotificationProvider>
        <UIProvider>
          <TasksProvider>
            {children}
          </TasksProvider>
        </UIProvider>
      </NotificationProvider>
    ),
    ...options,
  });
}

export * from '@testing-library/react';
export { renderWithProviders as render };
```

### APIモックの設定

```typescript
// src/tests/mocks/handlers.ts
import { rest } from 'msw';
import { mockTasks } from './mockData';

export const handlers = [
  // タスク一覧の取得
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockTasks));
  }),
  
  // 特定のタスクの取得
  rest.get('/api/tasks/:id', (req, res, ctx) => {
    const { id } = req.params;
    const task = mockTasks.find(task => task.id === id);
    
    if (task) {
      return res(ctx.status(200), ctx.json(task));
    } else {
      return res(ctx.status(404), ctx.json({ message: 'Task not found' }));
    }
  }),
  
  // 新しいタスクの作成
  rest.post('/api/tasks', async (req, res, ctx) => {
    const taskData = await req.json();
    
    const newTask = {
      id: `task-${Date.now()}`,
      ...taskData,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return res(ctx.status(201), ctx.json(newTask));
  }),
  
  // タスクの更新
  rest.put('/api/tasks/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const taskData = await req.json();
    const taskIndex = mockTasks.findIndex(task => task.id === id);
    
    if (taskIndex !== -1) {
      const updatedTask = {
        ...mockTasks[taskIndex],
        ...taskData,
        updatedAt: new Date().toISOString(),
      };
      
      return res(ctx.status(200), ctx.json(updatedTask));
    } else {
      return res(ctx.status(404), ctx.json({ message: 'Task not found' }));
    }
  }),
  
  // タスクの削除
  rest.delete('/api/tasks/:id', (req, res, ctx) => {
    const { id } = req.params;
    const taskIndex = mockTasks.findIndex(task => task.id === id);
    
    if (taskIndex !== -1) {
      return res(ctx.status(204));
    } else {
      return res(ctx.status(404), ctx.json({ message: 'Task not found' }));
    }
  }),
  
  // タスクの完了状態の切り替え
  rest.put('/api/tasks/:id/toggle', (req, res, ctx) => {
    const { id } = req.params;
    const taskIndex = mockTasks.findIndex(task => task.id === id);
    
    if (taskIndex !== -1) {
      const updatedTask = {
        ...mockTasks[taskIndex],
        completed: !mockTasks[taskIndex].completed,
        updatedAt: new Date().toISOString(),
      };
      
      return res(ctx.status(200), ctx.json(updatedTask));
    } else {
      return res(ctx.status(404), ctx.json({ message: 'Task not found' }));
    }
  }),
  
  // カテゴリ一覧の取得
  rest.get('/api/categories', (req, res, ctx) => {
    const categories = [...new Set(mockTasks.map(task => task.category).filter(Boolean))];
    return res(ctx.status(200), ctx.json(categories));
  }),
];

// src/tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### モックデータ

```typescript
// src/tests/mocks/mockData.ts
import { Task, Priority } from '../../types';

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'プロジェクト計画を作成する',
    completed: false,
    priority: Priority.High,
    category: '仕事',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2日後
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1日前
    updatedAt: new Date(Date.now() - 86400000).toISOString(), // 1日前
    memo: 'プロジェクトの目標と期限を明確にする',
  },
  {
    id: 'task-2',
    title: '買い物リストを作成する',
    completed: true,
    priority: Priority.Medium,
    category: '個人',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2日前
    updatedAt: new Date(Date.now() - 86400000).toISOString(), // 1日前
  },
  {
    id: 'task-3',
    title: '予約を確認する',
    completed: false,
    priority: Priority.Low,
    category: '個人',
    dueDate: new Date(Date.now() + 86400000).toISOString(), // 1日後
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3日前
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3日前
    memo: 'レストランの予約時間を確認する',
  },
];
```

### アクセシビリティテストのヘルパー

```typescript
// src/tests/axe-helper.ts
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { expect } from 'vitest';

// カスタムマッチャーを追加
expect.extend(toHaveNoViolations);

// axe-coreの設定をカスタマイズ
export const axe = configureAxe({
  rules: {
    // 必要に応じてルールをカスタマイズ
    // 例: 'color-contrast': { enabled: false }
  },
});

// アクセシビリティテスト用のヘルパー関数
export const testAccessibility = async (container: HTMLElement) => {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};
```

## テストカバレッジの確認方法

テストカバレッジレポートを生成するには、以下のコマンドを実行します：

```bash
npm run test:coverage
```

これにより、以下のカバレッジ情報が表示されます：

- **Statements**: 実行されたステートメントの割合
- **Branches**: 実行された条件分岐の割合
- **Functions**: 実行された関数の割合
- **Lines**: 実行されたコード行の割合

詳細なカバレッジレポートは `client/coverage` ディレクトリに生成され、ブラウザで確認できます：

```bash
open client/coverage/index.html
```

## テスト作成のベストプラクティス

### 1. テスト駆動開発 (TDD) の採用

1. テストを先に書く
2. テストが失敗することを確認する
3. テストが成功するようにコードを実装する
4. リファクタリングする
5. テストが成功することを確認する

### 2. コンポーネントのテスト

- ユーザーの視点からテストを書く（ボタンのクリック、テキストの入力など）
- 実装の詳細ではなく、動作をテストする
- アクセシビリティを考慮したテストを書く

```typescript
// 良い例
test('タスクが完了としてマークされること', () => {
  render(<TaskItem task={mockTask} onToggleComplete={handleToggle} />);
  fireEvent.click(screen.getByRole('checkbox'));
  expect(handleToggle).toHaveBeenCalledWith(mockTask.id);
});

// 悪い例
test('toggleComplete関数が呼ばれること', () => {
  const { getByTestId } = render(<TaskItem task={mockTask} onToggleComplete={handleToggle} />);
  fireEvent.click(getByTestId('complete-checkbox'));
  expect(handleToggle).toHaveBeenCalled();
});
```

### 3. フックのテスト

- `renderHook` を使用してフックをテストする
- 状態の変化を `act` でラップする
- 初期状態と更新後の状態を検証する

```typescript
test('フィルターを設定できること', () => {
  const { result } = renderHook(() => useTaskFilters());
  
  act(() => {
    result.current.setFilter({ completed: true });
  });
  
  expect(result.current.filter).toEqual({ completed: true });
});
```

### 4. APIモックの活用

- MSWを使用してAPIリクエストをモックする
- 成功ケースと失敗ケースの両方をテストする
- エッジケース（空のレスポンス、エラーなど）を考慮する

```typescript
test('APIエラー時にエラーメッセージが表示されること', async () => {
  // エラーレスポンスをモック
  server.use(
    rest.get('/api/tasks', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'Server error' }));
    })
  );
  
  render(<TaskList />);
  
  // エラーメッセージが表示されることを確認
  await waitFor(() => {
    expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
  });
});
```

### 5. テストの独立性を保つ

- テスト間で状態が共有されないようにする
- 各テストの前後で状態をリセットする
- グローバルな状態に依存しないようにする

```typescript
// 各テストの前にモックをリセット
beforeEach(() => {
  vi.clearAllMocks();
  server.resetHandlers();
});
```

## トラブルシューティング

### テストが失敗する一般的な問題

#### 1. 非同期処理の待機

```typescript
// 問題のあるテスト
test('タスクが読み込まれること', () => {
  render(<TaskList />);
  // APIリクエストが完了する前にアサーションが実行される
  expect(screen.getByText('タスク1')).toBeInTheDocument(); // 失敗する可能性あり
});

// 修正したテスト
test('タスクが読み込まれること', async () => {
  render(<TaskList />);
  // APIリクエストが完了するのを待つ
  await waitFor(() => {
    expect(screen.getByText('タスク1')).toBeInTheDocument();
  });
});
```

#### 2. 要素が見つからない

```typescript
// 問題のあるテスト
test('ボタンがクリックできること', () => {
  render(<MyComponent />);
  // ボタンが見つからない場合、エラーになる
  fireEvent.click(screen.getByText('送信'));
});

// 修正したテスト
test('ボタンがクリックできること', () => {
  render(<MyComponent />);
  // ボタンが存在するか確認してからクリック
  const button = screen.queryByText('送信');
  expect(button).toBeInTheDocument();
  if (button) {
    fireEvent.click(button);
  }
});
```

#### 3. モックの問題

```typescript
// 問題のあるテスト
test('関数が呼ばれること', () => {
  const mockFn = vi.fn();
  render(<MyComponent onClick={mockFn} />);
  fireEvent.click(screen.getByRole('button'));
  expect(mockFn).toHaveBeenCalled(); // 呼ばれていない場合、失敗する
});

// 修正したテスト
test('関数が呼ばれること', () => {
  const mockFn = vi.fn();
  render(<MyComponent onClick={mockFn} />);
  // 正しい要素をクリックしているか確認
  const button = screen.getByRole('button', { name: '実行' });
  fireEvent.click(button);
  expect(mockFn).toHaveBeenCalled();
});
```

### デバッグ方法

#### 1. screen.debug() の使用

```typescript
test('コンポーネントが正しくレンダリングされること', () => {
  render(<MyComponent />);
  // DOMの現在の状態を出力
  screen.debug();
  // 特定の要素のみをデバッグ
  screen.debug(screen.getByRole('button'));
});
```

#### 2. テストの詳細ログを表示

```bash
# 詳細なログを表示してテストを実行
npm run test -- --verbose
```

#### 3. 特定のテストのみを実行

```typescript
// 特定のテストのみを実行
test.only('このテストのみ実行', () => {
  // テストコード
});

// 特定のテストをスキップ
test.skip('このテストはスキップ', () => {
  // テストコード
});
```

## まとめ

TodoLogのテスト戦略は、単体テスト、統合テスト、アクセシビリティテストを組み合わせて、アプリケーションの品質を確保しています。テスト駆動開発のアプローチを採用し、ユーザーの視点からテストを書くことで、より堅牢なアプリケーションを実現しています。

テストを書くことは、バグの早期発見、コードの品質向上、リファクタリングの安全性確保など、多くのメリットをもたらします。TodoLogの開発に参加する際は、このガイドに従ってテストを作成し、アプリケーションの品質向上に貢献してください。
