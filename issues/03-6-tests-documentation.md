# フェーズ6: フロントエンドのテストとドキュメント実装計画

## 概要

TodoLogフロントエンドの品質と保守性を確保するため、包括的なテストスイートとドキュメントを実装します。テスト駆動開発（TDD）のアプローチを採用し、段階的にテストカバレッジを向上させていきます。

## 目標

- コンポーネント、カスタムフック、ユーティリティ関数の動作を検証するテストの実装
- ユーザーフローを検証する統合テストとE2Eテストの実装
- パフォーマンスとアクセシビリティの検証
- 開発者向けおよびユーザー向けドキュメントの作成

## 実装ステップ

### ステップ1: テスト環境のセットアップ (1日)

- ✅ Vitest、React Testing Library、MSWのセットアップ
  - ⬜ `vitest.config.ts` の作成と設定
  - ⬜ テスト用のヘルパー関数の作成
  - ⬜ モックサービスワーカーの設定
- ⬜ テストユーティリティの作成
  - ⬜ レンダリングヘルパー
  - ⬜ カスタムマッチャー
  - ⬜ テスト用のモックデータ

### ステップ2: 共通コンポーネントのテスト (2-3日)

- ⬜ 基本UIコンポーネントのテスト
  - ⬜ Button コンポーネント
    - ⬜ 通常状態のレンダリングとクリックイベント
    - ⬜ 無効状態のレンダリングと動作
    - ⬜ ローディング状態のレンダリング
  - ⬜ Input コンポーネント
    - ⬜ 入力値の更新
    - ⬜ バリデーションエラーの表示
  - ⬜ Select コンポーネント
    - ⬜ オプション選択の動作
    - ⬜ 複数選択の動作
  - ⬜ Modal コンポーネント
    - ⬜ 表示/非表示の切り替え
    - ⬜ キーボード操作（Escキーでの閉じるなど）
  - ⬜ Toast コンポーネント
    - ⬜ 通知表示と自動消去

- ⬜ タスク関連コンポーネントのテスト
  - ⬜ TaskItem コンポーネント
    - ⬜ タスク情報の表示
    - ⬜ 完了状態の切り替え
  - ⬜ TaskList コンポーネント
    - ⬜ タスクリストのレンダリング
    - ⬜ 空の状態の表示
  - ⬜ TaskForm コンポーネント
    - ⬜ フォーム入力と送信
    - ⬜ バリデーション

### ステップ3: カスタムフックとユーティリティのテスト (2日)

- ⬜ カスタムフックのテスト
  - ⬜ useTasksState
    - ⬜ タスクデータの取得
    - ⬜ タスク状態の更新
  - ⬜ useForm
    - ⬜ フォーム状態管理
    - ⬜ バリデーション
  - ⬜ useTheme
    - ⬜ テーマ切り替え

- ⬜ ユーティリティ関数のテスト
  - ⬜ 日付処理関数
    - ⬜ フォーマット
    - ⬜ 比較
  - ⬜ フィルタリング/ソート関数
    - ⬜ タスクのフィルタリング
    - ⬜ タスクのソート
  - ⬜ APIクライアントラッパー
    - ⬜ リクエスト処理
    - ⬜ エラーハンドリング

### ステップ4: 統合テスト (2-3日)

- ⬜ タスク管理フローのテスト
  - ⬜ タスク作成フロー
    - ⬜ フォーム入力から保存までの流れ
    - ⬜ バリデーションエラー処理
  - ⬜ タスク編集フロー
    - ⬜ 既存データの読み込みと更新
  - ⬜ タスク削除フロー
    - ⬜ 削除確認と実行

- ⬜ フィルタリングとソートのテスト
  - ⬜ 複数条件でのフィルタリング
  - ⬜ ソート順の変更と適用

- ⬜ カテゴリ管理のテスト
  - ⬜ カテゴリによるフィルタリング
  - ⬜ カテゴリ表示の切り替え

- ⬜ 検索機能のテスト
  - ⬜ インクリメンタル検索の動作

### ステップ5: E2Eテスト (2日)

- ⬜ Playwright のセットアップ
  - ⬜ 設定ファイルの作成
  - ⬜ テスト環境の準備

- ⬜ 主要ユーザーフローのテスト
  - ⬜ タスクの作成から完了までの一連の流れ
  - ⬜ フィルタリングとソートの操作
  - ⬜ 設定変更の操作

- ⬜ レスポンシブ動作のテスト
  - ⬜ モバイル表示の確認
  - ⬜ デスクトップ表示の確認

### ステップ6: パフォーマンステスト (1-2日)

- ⬜ レンダリングパフォーマンスの測定
  - ⬜ 初期ロード時間
  - ⬜ 再レンダリング時間

- ⬜ バンドルサイズの分析
  - ⬜ コード分割の効果測定
  - ⬜ 依存関係の最適化

- ⬜ メモリ使用量の監視
  - ⬜ メモリリークの検出
  - ⬜ 長時間使用時のパフォーマンス

### ステップ7: アクセシビリティテスト (1-2日)

- ⬜ キーボードナビゲーションのテスト
  - ⬜ フォーカス順序
  - ⬜ ショートカットキー

- ⬜ スクリーンリーダー互換性のテスト
  - ⬜ ARIA属性の検証
  - ⬜ 意味のある見出し構造

- ⬜ コントラスト比のチェック
  - ⬜ WCAG AAレベルの達成確認

### ステップ8: ドキュメント作成 (2-3日)

- ⬜ 開発者向けドキュメント
  - ⬜ コンポーネント仕様書
  - ⬜ APIクライアント使用方法
  - ⬜ 状態管理の概要
  - ⬜ テスト実行方法

- ⬜ ユーザーマニュアル
  - ⬜ 機能別ガイド
  - ⬜ チュートリアル
  - ⬜ FAQ
  - ⬜ トラブルシューティング

## テスト優先順位

テストは以下の優先順位で実装します：

1. **最高優先度**
   - Button、Input、TaskItem などの基本コンポーネント
   - タスクの作成・編集・削除の基本フロー
   - 日付処理やフィルタリングなどの重要なユーティリティ関数

2. **高優先度**
   - TaskList、TaskForm などの複合コンポーネント
   - カスタムフック（useTasksState、useForm など）
   - フィルタリングとソート機能

3. **中優先度**
   - Modal、Toast などの補助的なコンポーネント
   - 検索機能
   - テーマ切り替え機能

4. **低優先度**
   - アニメーションとトランジション
   - E2Eテスト
   - パフォーマンステスト

## テスト実装の段階的アプローチ

各ステップで以下のサイクルを繰り返します：

1. 2-4個のテストケースを選択
2. テストを実装（失敗する状態から始める）
3. テストが通るようにコードを修正または実装
4. リファクタリング
5. テストが通ることを確認
6. 次のテストケースに進む

## テスト技術詳細

### ユニットテスト（Vitest + React Testing Library）

```typescript
// Button コンポーネントのテスト例
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../components/Button';

describe('Button コンポーネント', () => {
  it('クリックイベントが発火する', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>クリック</Button>);
    
    fireEvent.click(screen.getByText('クリック'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('無効状態では操作できない', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>クリック</Button>);
    
    fireEvent.click(screen.getByText('クリック'));
    
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### 統合テスト（MSW を使用した API モック）

```typescript
// タスク作成フローのテスト例
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import TaskForm from '../components/TaskForm';
import { TasksProvider } from '../contexts/TasksContext';

const server = setupServer(
  rest.post('/api/tasks', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ id: '123', ...req.body }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('タスク作成フロー', () => {
  it('フォーム送信後にタスクが作成される', async () => {
    render(
      <TasksProvider>
        <TaskForm />
      </TasksProvider>
    );
    
    fireEvent.change(screen.getByLabelText('タイトル'), {
      target: { value: '新しいタスク' }
    });
    
    fireEvent.click(screen.getByText('保存'));
    
    await waitFor(() => {
      expect(screen.getByText('タスクが作成されました')).toBeInTheDocument();
    });
  });
});
```

### E2Eテスト（Playwright）

```typescript
// タスク管理の基本フローのテスト例
import { test, expect } from '@playwright/test';

test('タスクの作成から完了までの流れ', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // タスク作成
  await page.click('button:has-text("新規タスク")');
  await page.fill('input[name="title"]', 'E2Eテスト用タスク');
  await page.selectOption('select[name="priority"]', 'high');
  await page.click('button:has-text("保存")');
  
  // タスクが一覧に表示されることを確認
  await expect(page.locator('text=E2Eテスト用タスク')).toBeVisible();
  
  // タスクを完了にする
  await page.click('text=E2Eテスト用タスク >> xpath=..//..//input[@type="checkbox"]');
  
  // 完了状態になったことを確認
  await expect(page.locator('text=E2Eテスト用タスク')).toHaveClass(/completed/);
});
```

## テストカバレッジ目標

- ユニットテスト: 80%以上
- 統合テスト: 主要フローをカバー
- E2Eテスト: 重要なユーザーシナリオをカバー

## ドキュメント作成計画

### 開発者向けドキュメント

1. **アーキテクチャ概要**
   - フォルダ構造
   - データフロー
   - 状態管理

2. **コンポーネント仕様**
   - 各コンポーネントの役割と使用方法
   - Props の定義
   - 内部状態

3. **APIクライアント**
   - エンドポイント一覧
   - リクエスト/レスポンスの型定義
   - エラーハンドリング

4. **テスト**
   - テスト実行方法
   - モックの作成方法
   - テストカバレッジの確認方法

### ユーザーマニュアル

1. **基本操作ガイド**
   - タスクの作成・編集・削除
   - タスクの完了状態の変更
   - メモの追加

2. **高度な機能**
   - フィルタリングとソート
   - カテゴリ管理
   - 検索機能

3. **カスタマイズ**
   - テーマ設定
   - 表示オプション
   - キーボードショートカット

4. **トラブルシューティング**
   - よくある問題と解決方法
   - エラーメッセージの説明

## 結論

このテスト実装計画に従って段階的にテストを実装することで、TodoLogフロントエンドの品質と保守性を確保します。テスト駆動開発のアプローチを採用し、小さな単位でテストを実装・検証しながら進めることで、確実にテストカバレッジを向上させていきます。
