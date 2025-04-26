# Issue10 フェーズ3: バックエンドのクリーンアップ

## 概要

フェーズ1で特定した問題点に基づいて、バックエンドのコードをクリーンアップします。主な目標は、未使用のコードの削除、重複コードのリファクタリング、エラーハンドリングの統一、およびパフォーマンスの最適化です。

## 実施内容

### 1. 未使用のインポートと変数の削除

#### 対象ファイル

- `server/src/services/fileService.ts`
  - fs/promises から必要なメソッドのみをインポート
- `server/src/controllers/taskController.ts`
  - 未使用の変数とインポートを削除

#### 実装

```typescript
// server/src/services/fileService.ts
// 変更前
import { promises as fs } from 'fs';

// 変更後
import { readFile, writeFile, mkdir, access } from 'fs/promises';
```

### 2. APIエンドポイントの最適化

#### 対象ファイル

- `server/src/routes/taskRoutes.ts`
  - 重複したエンドポイントの統合
- `server/src/controllers/taskController.ts`
  - レスポンスデータの最適化

#### 実装方針

1. 類似した機能を持つエンドポイントを統合
2. レスポンスから不要なフィールドを削除

```typescript
// server/src/controllers/taskController.ts
// レスポンスデータの最適化例
const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await taskService.getAllTasks();
    
    // 必要なフィールドのみを含むタスクリストを返す
    const simplifiedTasks = tasks.map(({ id, title, completed, priority, tags, dueDate, createdAt, updatedAt }) => ({
      id,
      title,
      completed,
      priority,
      tags,
      dueDate,
      createdAt,
      updatedAt,
      // メモは一覧表示時には不要なので含めない
    }));
    
    res.json(simplifiedTasks);
  } catch (error) {
    handleApiError(error, res, 'タスク一覧の取得');
  }
};
```

### 3. サービスレイヤーの整理

#### 対象ファイル

- `server/src/services/dataService.ts`
  - 複雑な関数の分割
- `server/src/services/taskService.ts`
  - 重複ロジックの統合

#### 実装方針

1. 大きな関数を複数の小さな関数に分割
2. 共通ロジックを抽出してユーティリティ関数化

```typescript
// server/src/services/dataService.ts
// 変更前
const saveData = async (data: any, filename: string): Promise<void> => {
  // 100行近い複雑な処理
};

// 変更後
const validateData = (data: any): boolean => {
  // データ検証ロジック
};

const prepareDataDirectory = async (): Promise<void> => {
  // ディレクトリ準備ロジック
};

const writeDataToFile = async (data: any, filePath: string): Promise<void> => {
  // ファイル書き込みロジック
};

const saveData = async (data: any, filename: string): Promise<void> => {
  if (!validateData(data)) {
    throw new Error('無効なデータ形式です');
  }
  
  await prepareDataDirectory();
  const filePath = path.join(dataDir, filename);
  await writeDataToFile(data, filePath);
};
```

### 4. ミドルウェアの最適化

#### 対象ファイル

- `server/src/middleware/errorHandler.ts`
  - エラーハンドリングの改善
- `server/src/middleware/requestLogger.ts`
  - ロギングの最適化

#### 実装方針

1. 不要なミドルウェアの削除
2. ミドルウェアの実行順序の最適化
3. エラーハンドリングの強化

```typescript
// server/src/middleware/errorHandler.ts
// エラーハンドリングの改善例
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'サーバーエラーが発生しました';
  
  // エラーの種類に基づいて適切なレスポンスを返す
  if (statusCode === 400) {
    logger.warn(`クライアントエラー: ${message}`, { path: req.path, method: req.method });
  } else {
    logger.error(`サーバーエラー: ${message}`, { path: req.path, method: req.method, stack: err.stack });
  }
  
  res.status(statusCode).json({
    error: {
      message,
      code: err.code || 'UNKNOWN_ERROR',
      // 開発環境でのみスタックトレースを含める
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    }
  });
};
```

### 5. エラーハンドリングの統一

#### 対象ファイル

- すべてのコントローラーとサービス

#### 実装方針

1. 共通のエラーハンドリングユーティリティを作成
2. カスタムエラークラスの導入
3. 一貫したエラーメッセージ形式の実現

```typescript
// server/src/utils/errorUtils.ts（新規作成）
export class AppError extends Error {
  statusCode: number;
  code: string;
  
  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const handleApiError = (error: unknown, res: Response, operation: string) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        code: error.code,
      }
    });
  } else {
    const message = error instanceof Error ? error.message : '不明なエラー';
    logger.error(`${operation}に失敗しました: ${message}`);
    res.status(500).json({
      error: {
        message: `${operation}に失敗しました: ${message}`,
        code: 'INTERNAL_ERROR',
      }
    });
  }
};
```

### 6. テストの更新

変更したコードに対応するテストを更新し、すべてのテストが正常に通ることを確認します。

## 実装計画

1. 未使用のインポートと変数の削除
2. APIエンドポイントの最適化
3. サービスレイヤーの整理
4. ミドルウェアの最適化
5. エラーハンドリングの統一
6. テストの更新と実行

## 成果物

- クリーンアップされたバックエンドコード
- 最適化されたAPIエンドポイント
- 統一されたエラーハンドリング
- 更新されたテスト

## 評価基準

- 静的解析ツールによるエラーと警告の削減
- テストの成功率
- コードの複雑性メトリクスの改善
- APIレスポンス時間の改善

## 進捗状況

### 計画中の作業
- [x] 未使用のインポートと変数の削除
- [x] APIエンドポイントの最適化
- [x] サービスレイヤーの整理
- [x] ミドルウェアの最適化
- [x] エラーハンドリングの統一
- [x] テストの更新

## 実装スケジュール

- 未使用のインポートと変数の削除: 2025-04-29
- APIエンドポイントの最適化: 2025-04-29
- サービスレイヤーの整理: 2025-04-30
- ミドルウェアの最適化: 2025-04-30
- エラーハンドリングの統一: 2025-05-01
- テストの更新と実行: 2025-05-01
