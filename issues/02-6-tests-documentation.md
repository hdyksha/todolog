# フェーズ6: テストとドキュメント

## 目標

アプリケーションの品質を確保するためのテストを拡充し、APIドキュメントを生成して、プロジェクトの利用と保守を容易にします。

## タスク

### 6.1 ユニットテストの拡充

- 既存のテストの改善
- テストカバレッジの向上
- エッジケースのテスト追加
- モックとスタブの適切な活用

### 6.2 統合テストの実装

- APIエンドポイントの統合テスト
- エンドツーエンドのワークフローテスト
- テスト環境の分離と独立性の確保
- テストデータの管理

### 6.3 API ドキュメントの生成

- OpenAPI (Swagger) 仕様の作成
- API エンドポイントの詳細な説明
- リクエスト/レスポンスの例の提供
- エラーレスポンスの文書化

### 6.4 README の更新

- プロジェクト概要の充実
- インストールと実行手順の詳細化
- 機能一覧の更新
- スクリーンショットの追加

### 6.5 デプロイ手順の文書化

- 開発環境のセットアップ手順
- 本番環境へのデプロイ手順
- 環境変数の設定ガイド
- トラブルシューティングガイド

## 実装詳細

### 6.1 ユニットテストの拡充

ユニットテストは、アプリケーションの個々のコンポーネントが期待通りに動作することを確認するために重要です。以下の点に注意してテストを拡充します：

```typescript
// tests/unit/services/task.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskService } from '../../../src/services/task.service.js';
import { FileService } from '../../../src/services/file.service.js';

// テストの例
describe('TaskService', () => {
  let taskService: TaskService;
  let fileService: FileService;
  
  beforeEach(() => {
    // テスト前の準備
    fileService = new FileService();
    taskService = new TaskService(fileService);
  });
  
  // エッジケースのテスト例
  it('空のタイトルでタスクを作成しようとするとエラーになるべき', async () => {
    const taskData = {
      title: '',
      priority: 'medium' as const,
    };
    
    await expect(taskService.createTask(taskData)).rejects.toThrow();
  });
  
  // 境界値のテスト例
  it('101文字のタイトルでタスクを作成しようとするとエラーになるべき', async () => {
    const longTitle = 'a'.repeat(101);
    const taskData = {
      title: longTitle,
      priority: 'medium' as const,
    };
    
    await expect(taskService.createTask(taskData)).rejects.toThrow();
  });
});
```

### 6.2 統合テストの実装

統合テストは、複数のコンポーネントが連携して正しく動作することを確認するために重要です。特にAPIエンドポイントのテストに焦点を当てます：

```typescript
// tests/integration/api/tasks.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app.js';
import fs from 'fs/promises';
import path from 'path';

describe('タスクAPI', () => {
  const app = createApp();
  const TEST_DATA_DIR = path.join(__dirname, '../../../test-integration-data');
  const TEST_TASKS_FILE = path.join(TEST_DATA_DIR, 'tasks.json');
  
  beforeEach(async () => {
    // テスト用ディレクトリの作成
    await fs.mkdir(TEST_DATA_DIR, { recursive: true });
    // 空のタスクリストで初期化
    await fs.writeFile(TEST_TASKS_FILE, JSON.stringify([]), 'utf-8');
  });
  
  afterEach(async () => {
    // テスト後のクリーンアップ
    await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
  });
  
  it('GET /api/tasks は空の配列を返すべき', async () => {
    const response = await request(app).get('/api/tasks');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
  
  it('POST /api/tasks は新しいタスクを作成するべき', async () => {
    const taskData = {
      title: 'テストタスク',
      priority: 'high',
    };
    
    const response = await request(app)
      .post('/api/tasks')
      .send(taskData)
      .set('Accept', 'application/json');
      
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('title', 'テストタスク');
    expect(response.body).toHaveProperty('priority', 'high');
  });
});
```

### 6.3 API ドキュメントの生成

OpenAPI (Swagger) 仕様を使用して、APIドキュメントを生成します：

```typescript
// src/utils/swagger.ts
import swaggerJSDoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TodoLog API',
      version: '1.0.0',
      description: 'TodoLog アプリケーションのAPI仕様',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: '開発サーバー',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // ルートファイルのパス
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express): void {
  // Swagger UIのセットアップ
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Swagger JSONエンドポイント
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}
```

ルートファイルにSwaggerドキュメントのコメントを追加：

```typescript
// src/routes/taskRoutes.ts

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: タスク一覧を取得
 *     description: すべてのタスクのリストを取得します
 *     responses:
 *       200:
 *         description: タスクの配列
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.get('/', taskController.getAllTasks);
```

### 6.4 README の更新

READMEを更新して、プロジェクトの概要、インストール手順、使用方法などを詳細に記載します：

```markdown
# TodoLog - タスク管理アプリケーション

## 概要

TodoLogは、シンプルで使いやすいタスク管理アプリケーションです。各タスクにメモを追加する機能を備え、データはローカルファイルに保存されるため、可搬性と利便性を両立しています。

## 機能

- タスクの作成、表示、編集、削除
- タスクへのメモ追加
- タスクの完了状態の切り替え
- タスクの優先度設定
- タスクのカテゴリ分け
- タスクの期限設定

## スクリーンショット

![タスク一覧画面](./docs/images/task-list.png)
![タスク詳細画面](./docs/images/task-detail.png)

## インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/todolog.git
cd todolog

# 依存関係のインストール
npm run install:all
```

## 使用方法

```bash
# 開発サーバーの起動
npm run dev

# ブラウザで開く
# http://localhost:5173
```
```

### 6.5 デプロイ手順の文書化

デプロイ手順を文書化して、開発者や運用担当者がアプリケーションを簡単にデプロイできるようにします：

```markdown
# デプロイガイド

## 前提条件

- Node.js 18.x 以上
- npm 9.x 以上

## 開発環境のセットアップ

1. リポジトリをクローン
   ```bash
   git clone https://github.com/yourusername/todolog.git
   cd todolog
   ```

2. 依存関係のインストール
   ```bash
   npm run install:all
   ```

3. 環境変数の設定
   ```bash
   cp .env.example .env
   # .envファイルを編集して環境に合わせて設定
   ```

4. 開発サーバーの起動
   ```bash
   npm run dev
   ```

## 本番環境へのデプロイ

1. アプリケーションのビルド
   ```bash
   npm run build
   ```

2. サーバーへのファイル転送
   ```bash
   # 例: SCPを使用した転送
   scp -r dist/* user@your-server:/path/to/deployment
   ```

3. サーバーでの環境変数の設定
   ```bash
   # サーバー上で.envファイルを作成
   nano .env
   ```

4. アプリケーションの起動
   ```bash
   # 直接起動
   node dist/server.js
   
   # または、PM2を使用した起動
   pm2 start dist/server.js --name todolog
   ```

## トラブルシューティング

### よくある問題と解決策

1. **ポートが既に使用されている**
   - 別のポートを.envファイルで指定してください
   - `PORT=3002` のように設定

2. **データディレクトリへのアクセス権限エラー**
   - データディレクトリのパーミッションを確認
   - `chmod 755 /path/to/data` で権限を設定

3. **APIエンドポイントに接続できない**
   - CORSの設定を確認
   - ファイアウォールの設定を確認
```

## テスト

### ユニットテストの実行

```bash
# すべてのユニットテストを実行
npm run test:unit

# 特定のテストファイルを実行
npm run test:unit -- tests/unit/services/task.service.test.ts

# ウォッチモードでテストを実行
npm run test:unit -- --watch
```

### 統合テストの実行

```bash
# すべての統合テストを実行
npm run test:integration

# 特定のテストファイルを実行
npm run test:integration -- tests/integration/api/tasks.test.ts
```

### テストカバレッジの確認

```bash
# テストカバレッジレポートの生成
npm run test:coverage
```

## 実装結果

フェーズ6の実装が完了すると、以下の成果物が得られます：

1. **拡充されたテスト**
   - 高いテストカバレッジ
   - エッジケースのテスト
   - 統合テスト

2. **APIドキュメント**
   - OpenAPI (Swagger) 仕様
   - エンドポイントの詳細な説明
   - リクエスト/レスポンスの例

3. **充実したドキュメント**
   - 詳細なREADME
   - デプロイガイド
   - トラブルシューティングガイド

4. **スクリーンショットと例**
   - アプリケーションの使用例
   - 主要機能のスクリーンショット

これらの成果物により、プロジェクトの品質が向上し、新しい開発者がプロジェクトに参加しやすくなります。また、ユーザーがアプリケーションを理解し使用するのも容易になります。

## 次のステップ

すべてのフェーズが完了したら、アプリケーションのリリースと継続的な改善に進みます。
