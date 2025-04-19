# TodoLog API ドキュメント

## 概要

TodoLog APIは、タスク管理アプリケーションのバックエンドAPIです。このドキュメントでは、APIの使用方法、エンドポイント、リクエスト/レスポンスの形式について説明します。

## API仕様書

API仕様の詳細は、OpenAPI形式で記述されています。以下の方法で閲覧できます：

1. **Swagger UI**を使用する場合:
   ```bash
   # Swagger UIをグローバルにインストール
   npm install -g swagger-ui-cli
   
   # Swagger UIを起動
   swagger-ui-cli serve ./docs/openapi.yaml
   ```

2. **オンラインエディタ**を使用する場合:
   - [Swagger Editor](https://editor.swagger.io/)にアクセス
   - `docs/openapi.yaml`ファイルの内容をコピー＆ペースト

## 認証

現在のバージョンでは認証は実装されていません。将来のバージョンでは、JWT認証が実装される予定です。

## レート制限

APIには以下のレート制限が設定されています：

- 全体のリクエスト: 15分あたり100リクエスト
- 書き込み操作（POST, PUT, DELETE）: 1時間あたり50リクエスト

レート制限を超過した場合、`429 Too Many Requests`レスポンスが返されます。

## キャッシュ

APIはキャッシュ制御ヘッダーを使用して、クライアント側のキャッシュを最適化しています：

- 読み取り操作（GET）: `Cache-Control: private, max-age=10`
- 書き込み操作（POST, PUT, DELETE）: `Cache-Control: no-store, must-revalidate`

また、ETags を使用して条件付きリクエストをサポートしています。

## エラーレスポンス

エラーレスポンスは以下の形式で返されます：

```json
{
  "error": "ERROR_CODE",
  "message": "エラーの詳細メッセージ",
  "timestamp": "2025-04-19T01:57:24Z"
}
```

一般的なエラーコード：

| ステータスコード | エラーコード | 説明 |
|--------------|------------|------|
| 400 | BAD_REQUEST | リクエストの形式が不正 |
| 400 | VALIDATION_ERROR | 入力値のバリデーションエラー |
| 404 | NOT_FOUND | リソースが見つからない |
| 429 | TOO_MANY_REQUESTS | レート制限を超過 |
| 500 | INTERNAL_SERVER_ERROR | サーバー内部エラー |

## 主要なエンドポイント

### タスク管理

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | /api/tasks | タスク一覧の取得 |
| GET | /api/tasks/:id | 特定のタスクの取得 |
| POST | /api/tasks | 新しいタスクの作成 |
| PUT | /api/tasks/:id | タスクの更新 |
| DELETE | /api/tasks/:id | タスクの削除 |
| PUT | /api/tasks/:id/toggle | タスクの完了状態の切り替え |
| PUT | /api/tasks/:id/memo | タスクのメモ更新 |

### カテゴリ管理

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | /api/categories | カテゴリ一覧の取得 |

### バックアップ管理

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| POST | /api/backups | バックアップの作成 |
| GET | /api/backups | バックアップ一覧の取得 |
| POST | /api/backups/:filename/restore | バックアップからの復元 |

### データインポート/エクスポート

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | /api/export | タスクデータのエクスポート |
| POST | /api/import | タスクデータのインポート |

### ヘルスチェック

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | /health | APIサーバーの状態確認 |

## 使用例

### タスク一覧の取得

```bash
curl -X GET http://localhost:3001/api/tasks
```

### フィルタリングを使用したタスク一覧の取得

```bash
# 完了済みタスクのみ取得
curl -X GET http://localhost:3001/api/tasks?completed=true

# 優先度が高いタスクのみ取得
curl -X GET http://localhost:3001/api/tasks?priority=high

# カテゴリでフィルタリング
curl -X GET http://localhost:3001/api/tasks?category=仕事
```

### 新しいタスクの作成

```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "買い物に行く",
    "priority": "medium",
    "category": "買い物",
    "dueDate": "2025-04-25T15:00:00Z",
    "memo": "牛乳、卵、パンを買う"
  }'
```

### タスクの更新

```bash
curl -X PUT http://localhost:3001/api/tasks/5b41bf03-50f9-42d5-b11c-48e43ef18f47 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "スーパーで買い物",
    "priority": "high",
    "completed": true
  }'
```

### タスクの削除

```bash
curl -X DELETE http://localhost:3001/api/tasks/5b41bf03-50f9-42d5-b11c-48e43ef18f47
```

### バックアップの作成

```bash
curl -X POST http://localhost:3001/api/backups
```

### バックアップからの復元

```bash
curl -X POST http://localhost:3001/api/backups/tasks.json.2025-04-19T01-57-24.bak/restore
```

## 変更履歴

| バージョン | 日付 | 変更内容 |
|----------|------|---------|
| 1.0.0 | 2025-04-19 | 初期バージョン |
