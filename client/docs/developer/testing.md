# TodoLog テスト戦略とベストプラクティス

このドキュメントでは、TodoLogプロジェクトのテスト戦略とベストプラクティスについて説明します。

## テスト環境

TodoLogでは、以下のテストツールを使用しています：

- **Vitest**: テストランナー
- **React Testing Library**: コンポーネントのテスト
- **MSW (Mock Service Worker)**: APIモック
- **jest-axe**: アクセシビリティテスト

## テスト構造

TodoLogプロジェクトでは、以下のテスト構造を採用しています：

### 1. 単体テスト

個々のコンポーネント、フック、サービスなどの機能単位をテストします。

- **配置場所**: テスト対象のファイルと同じディレクトリ
- **命名規則**: `[対象ファイル名].test.ts(x)`
- **例**: `src/hooks/useArchiveStats.ts` → `src/hooks/useArchiveStats.test.ts`

### 2. 統合テスト

複数のコンポーネントやフックが連携する機能をテストします。

- **配置場所**: `src/tests/integration/` ディレクトリ
- **命名規則**: `[機能名].test.tsx`
- **例**: `src/tests/integration/TaskCreationFlow.test.tsx`

### 3. アクセシビリティテスト

コンポーネントのアクセシビリティを検証します。

- **配置場所**: テスト対象のファイルと同じディレクトリ
- **命名規則**: `[対象ファイル名].a11y.test.tsx`
- **例**: `src/components/ui/Button.a11y.test.tsx`

### 4. モックとテストヘルパー

テスト用のモックデータやヘルパー関数を提供します。

- **配置場所**: `src/tests/mocks/` ディレクトリ
- **例**: `src/tests/mocks/taskMocks.ts`, `src/tests/mocks/api.ts`

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
npm test -- src/components/Button.test.tsx

# 特定のパターンに一致するテストを実行
npm test -- --testNamePattern="Button"
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

## テスト作成のベストプラクティス

### 1. コンポーネントのテスト

- レンダリング結果の検証
- ユーザーインタラクションのテスト
- プロップスの変更に対する反応のテスト
- エラー状態のテスト
- ユーザーの視点からテストを書く（ボタンのクリック、テキストの入力など）
- 実装の詳細ではなく、動作をテストする

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskItem } from './TaskItem';

describe('TaskItem', () => {
  it('タスクのタイトルが表示される', () => {
    render(<TaskItem task={{ id: '1', title: 'テストタスク', completed: false }} />);
    expect(screen.getByText('テストタスク')).toBeInTheDocument();
  });
  
  it('タスクが完了としてマークされること', () => {
    const handleToggle = vi.fn();
    render(<TaskItem task={mockTask} onToggleComplete={handleToggle} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(handleToggle).toHaveBeenCalledWith(mockTask.id);
  });
});
```

### 2. フックのテスト

- フックの初期状態のテスト
- フック関数の呼び出し結果のテスト
- 副作用のテスト
- `renderHook` を使用してフックをテストする
- 状態の変化を `act` でラップする

```tsx
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('カウントを増加できる', () => {
    const { result } = renderHook(() => useCounter());
    act(() => {
      result.current.increment();
    });
    expect(result.current.count).toBe(1);
  });
  
  it('フィルターを設定できること', () => {
    const { result } = renderHook(() => useTaskFilters());
    
    act(() => {
      result.current.setFilter({ completed: true });
    });
    
    expect(result.current.filter).toEqual({ completed: true });
  });
});
```

### 3. APIサービスのテスト

- API呼び出しのテスト
- エラーハンドリングのテスト
- レスポンス処理のテスト
- MSWを使用してAPIリクエストをモックする
- 成功ケースと失敗ケースの両方をテストする

```tsx
import { api } from './api';

// fetchのモック
vi.mock('global', () => ({
  fetch: vi.fn()
}));

describe('api', () => {
  it('タスク一覧を取得できる', async () => {
    // モックの設定
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ id: '1', title: 'テスト' }])
    } as Response);
    
    const tasks = await api.fetchTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('テスト');
  });
  
  it('APIエラー時にエラーメッセージが表示されること', async () => {
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
});
```

### 4. 統合テスト

- ユーザーフローのテスト
- コンポーネント間の連携のテスト
- データフローのテスト

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskProvider } from '../contexts/TaskContext';
import { TaskList } from './TaskList';
import { TaskForm } from './TaskForm';

describe('タスク管理フロー', () => {
  it('新しいタスクを作成して一覧に表示される', async () => {
    render(
      <TaskProvider>
        <TaskForm />
        <TaskList />
      </TaskProvider>
    );
    
    // タスク作成
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '新しいタスク' } });
    fireEvent.click(screen.getByText('作成'));
    
    // タスク一覧に表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('新しいタスク')).toBeInTheDocument();
    });
  });
});
```

### 5. アクセシビリティテスト

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
});
```

## モックの使用方法

### 1. APIモック

`src/tests/mocks/api.ts` を使用して、APIサービスをモックします。

```tsx
import { apiMock } from '../tests/mocks/api';

// テスト内でモックを使用
vi.mock('../services/api', () => ({
  default: apiMock
}));
```

### 2. タスクデータのモック

`src/tests/mocks/taskMocks.ts` を使用して、タスクデータをモックします。

```tsx
import { mockTask, mockTasks } from '../tests/mocks/taskMocks';

// テスト内でモックデータを使用
it('タスクを表示できる', () => {
  render(<TaskItem task={mockTask} />);
  expect(screen.getByText(mockTask.title)).toBeInTheDocument();
});
```

### 3. MSWを使用したAPIモック

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
];

// src/tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
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

## テストカバレッジ

テストカバレッジレポートは `npm run coverage` コマンドで生成できます。
カバレッジレポートは以下の項目を確認します：

- **ステートメントカバレッジ**: コード内のステートメントがテストで実行された割合
- **ブランチカバレッジ**: 条件分岐がテストで実行された割合
- **関数カバレッジ**: 関数がテストで呼び出された割合
- **行カバレッジ**: コード行がテストで実行された割合

詳細なカバレッジレポートは `client/coverage` ディレクトリに生成され、ブラウザで確認できます：

```bash
open client/coverage/index.html
```

目標カバレッジ率は80%以上を目指します。

## テスト改善のためのヒント

1. **テストの独立性を保つ**: 各テストは他のテストに依存せず、独立して実行できるようにする
   ```typescript
   // 各テストの前にモックをリセット
   beforeEach(() => {
     vi.clearAllMocks();
     server.resetHandlers();
   });
   ```

2. **テストの可読性を高める**: テスト名は何をテストしているかを明確に示す
3. **テストの保守性を高める**: テストコードも本番コードと同様に保守しやすく書く
4. **テストの実行速度を意識する**: テストは高速に実行できるようにする
5. **テストの信頼性を高める**: フラッキーテスト（不安定なテスト）を避ける
6. **テスト駆動開発 (TDD) の採用**:
   - テストを先に書く
   - テストが失敗することを確認する
   - テストが成功するようにコードを実装する
   - リファクタリングする
   - テストが成功することを確認する

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

## 参考資料

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest](https://vitest.dev/)
- [Testing JavaScript](https://testingjavascript.com/)
- [MSW (Mock Service Worker)](https://mswjs.io/)
- [jest-axe](https://github.com/nickcolley/jest-axe)

## まとめ

TodoLogのテスト戦略は、単体テスト、統合テスト、アクセシビリティテストを組み合わせて、アプリケーションの品質を確保しています。テスト駆動開発のアプローチを採用し、ユーザーの視点からテストを書くことで、より堅牢なアプリケーションを実現しています。

テストを書くことは、バグの早期発見、コードの品質向上、リファクタリングの安全性確保など、多くのメリットをもたらします。TodoLogの開発に参加する際は、このガイドに従ってテストを作成し、アプリケーションの品質向上に貢献してください。
