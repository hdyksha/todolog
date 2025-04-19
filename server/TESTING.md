# TodoLog テスト戦略

このドキュメントでは、TodoLogバックエンドのテスト戦略と実装方法について説明します。

## テスト環境

- **テストフレームワーク**: Vitest
- **テストランナー**: Vitest
- **アサーションライブラリ**: Vitest組み込み
- **モック/スタブ**: Vitest組み込み
- **HTTPテスト**: SuperTest

## テストの種類

### 1. 単体テスト (Unit Tests)

個々のコンポーネント（関数、クラス、モジュール）を分離してテストします。外部依存関係はモックまたはスタブに置き換えます。

#### 対象コンポーネント

- **サービス**: `TaskService`, `FileService`
- **コントローラー**: `TaskController`
- **ミドルウェア**: `errorHandler`, `cache`, `security`, `rate-limiter`
- **ユーティリティ**: `logger`, `data-validator`
- **モデル**: `task.model`

### 2. 統合テスト (Integration Tests)

複数のコンポーネントの連携をテストします。実際のデータフローと相互作用を検証します。

#### 対象シナリオ

- **APIエンドポイント**: 各エンドポイントの動作検証
- **サービス間連携**: `TaskService`と`FileService`の連携
- **データ永続化**: ファイルシステムへの書き込みと読み込み

### 3. エンドツーエンドテスト (E2E Tests)

システム全体の動作をテストします。実際のユーザーシナリオに基づいたテストケースを作成します。

#### 対象シナリオ

- **タスク管理フロー**: タスクの作成、取得、更新、削除
- **バックアップと復元**: データのバックアップと復元
- **エクスポート/インポート**: データのエクスポート/インポート

## テストディレクトリ構造

```
tests/
├── integration/
│   ├── api/           # APIエンドポイントのテスト
│   ├── services/      # サービス間連携のテスト
│   └── example.integration.test.ts
├── unit/
│   ├── config/        # 設定のテスト
│   ├── controllers/   # コントローラーのテスト
│   ├── middleware/    # ミドルウェアのテスト
│   ├── models/        # モデルのテスト
│   ├── services/      # サービスのテスト
│   ├── utils/         # ユーティリティのテスト
│   └── example.unit.test.ts
└── example.test.ts
```

## テスト実行方法

```bash
# すべてのテストを実行
npm test

# 単体テストのみ実行
npm run test:unit

# 統合テストのみ実行
npm run test:integration

# 特定のファイルのテストを実行
npx vitest tests/unit/services/taskService.test.ts

# テストカバレッジの確認
npm run test:coverage
```

## テスト環境の分離

テスト実行時には、本番環境のデータに影響を与えないよう、テスト専用の環境を使用します。

### 環境変数

テスト実行時には以下の環境変数が設定されます：

```
NODE_ENV=test
DATA_DIR=./test-data
LOG_LEVEL=error
```

### テストデータ

- 単体テストでは、モックデータを使用
- 統合テストでは、テスト専用のディレクトリにデータを保存
- テスト終了後は、テストデータを自動的にクリーンアップ

## モックの使用方法

Vitestの`vi.mock()`を使用して、外部依存関係をモックします。

```typescript
// FileServiceのモック例
vi.mock('../../src/services/fileService.js', () => {
  return {
    FileService: vi.fn().mockImplementation(() => ({
      readFile: vi.fn().mockResolvedValue([]),
      writeFile: vi.fn().mockResolvedValue(undefined),
    })),
  };
});
```

## テストの命名規則

- **ファイル名**: `[対象コンポーネント名].test.ts`
- **テストスイート**: 対象コンポーネントの機能や責任を説明する名前
- **テストケース**: 「〜するべき」という形式で期待される動作を説明

```typescript
describe('TaskService', () => {
  describe('createTask', () => {
    it('有効なデータでタスクを作成するべき', () => {
      // ...
    });
    
    it('無効なデータの場合はエラーを投げるべき', () => {
      // ...
    });
  });
});
```

## アサーション戦略

- **等価性**: `expect(actual).toBe(expected)` または `expect(actual).toEqual(expected)`
- **プロパティ**: `expect(object).toHaveProperty('property', value)`
- **例外**: `expect(() => { ... }).toThrow()`
- **非同期**: `await expect(promise).resolves.toBe(value)` または `await expect(promise).rejects.toThrow()`

## テストカバレッジ目標

- **ステートメントカバレッジ**: 80%以上
- **ブランチカバレッジ**: 70%以上
- **関数カバレッジ**: 90%以上
- **行カバレッジ**: 80%以上

## 継続的インテグレーション

CI/CDパイプラインでは、以下のステップを実行します：

1. 依存関係のインストール
2. リントチェック
3. 型チェック
4. 単体テスト
5. 統合テスト
6. テストカバレッジレポートの生成
7. ビルド

## ベストプラクティス

- **テストの独立性**: 各テストは他のテストに依存せず、独立して実行できるようにする
- **テストの再現性**: 同じ条件で何度実行しても同じ結果になるようにする
- **テストの可読性**: テストコードは自己文書化し、何をテストしているかが明確になるようにする
- **テストの保守性**: テスト対象のコードが変更されても、テストコードの変更が最小限で済むようにする
- **テストの速度**: テストは高速に実行できるようにする（特に単体テスト）
