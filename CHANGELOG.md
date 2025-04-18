# TodoLog 変更履歴

## [未リリース]

### フェーズ6: テストとドキュメント (進行中)

#### 追加
- テスト環境の整備 (2025-04-19完了)
  - Vitestテストフレームワークの設定
  - テスト用のディレクトリ構造の作成
  - モック機能の設定
- 単体テストの実装 (2025-04-19完了)
  - サービスレイヤーのテスト（TaskService, FileService）
  - コントローラーのテスト（TaskController）
  - ミドルウェアのテスト（errorHandler, cache, rate-limiter）
  - ユーティリティのテスト（logger, data-validator）
  - モデルのテスト（task.model）
- 統合テストの実装 (2025-04-19完了)
  - APIエンドポイントのテスト
  - サービス間の連携テスト
  - エンドツーエンドのデータフローテスト
- テストカバレッジの向上 (2025-04-19完了)
  - 全体のテストカバレッジを80%以上に向上
  - コントローラーのテストカバレッジを85%以上に向上
  - ミドルウェアのテストカバレッジを85%以上に向上
  - サービスのテストカバレッジを75%以上に向上
- API仕様書の作成 (2025-04-19完了)
  - OpenAPI/Swagger形式でのAPI仕様書作成
  - エンドポイントの詳細なドキュメント化
  - リクエスト/レスポンスの例と説明
  - エラーコードとステータスコードの説明
- 開発者向けドキュメントの作成 (2025-04-19完了)
  - アーキテクチャの詳細説明
  - 開発環境のセットアップガイド
  - コーディング規約とベストプラクティス
  - テスト実行方法の説明
  - デプロイ手順の説明

#### 変更
- ファイル命名規則の統一
  - ドット区切りからキャメルケースへの変更（例: `task.service.ts` → `taskService.ts`）
  - テストファイルの命名規則も同様に変更
- テスト環境の分離
  - テスト用のデータディレクトリの分離
  - モックを使用したテスト環境の独立性確保
  - 環境変数の適切な設定
- ドキュメント構造の整理
  - docs/ディレクトリの作成
  - ドキュメントの種類ごとのファイル分割
  - マークダウン形式での統一的な記述

### フェーズ5: セキュリティと最適化 (2025-04-18完了)

#### 追加
- キャッシュ制御ミドルウェアの実装
  - `cacheControl` ミドルウェアによるCache-Controlヘッダーの設定
  - `etagMiddleware` によるETagの生成と条件付きリクエストの処理
  - `noCacheAfterMutation` ミドルウェアの追加（更新操作後のキャッシュ制御）
- タスクデータ更新時のタイムスタンプ管理機能
  - `updateTaskDataTimestamp` 関数の実装
  - タスク更新時のETag生成にタイムスタンプを含める機能
- フロントエンドのキャッシュ制御強化
  - APIクライアントにキャッシュ制御オプションを追加
  - オプティミスティックUI更新の実装
  - 通知システムの導入

#### 変更
- キャッシュ戦略の最適化
  - タスク一覧と個別タスク取得のキャッシュ時間を短縮（10秒→5秒）
  - カテゴリ一覧のキャッシュ時間を短縮（300秒→60秒）
- 更新操作後のキャッシュ制御を強化
  - 全ての更新操作（createTask, updateTask, deleteTask, toggleTaskCompletion, updateTaskMemo, restoreFromBackup, importTasks）で明示的にタイムスタンプを更新
  - 更新操作のレスポンスに強力なキャッシュ無効化ヘッダーを設定
  - `Cache-Control: no-store, must-revalidate`, `Pragma: no-cache`, `Expires: 0` ヘッダーの追加
- フロントエンドの状態管理改善
  - すべての操作でオプティミスティックUI更新を実装
  - エラー処理の強化と元の状態への復元機能
  - 不要なデータ再取得を削除し、ユーザー体験を向上

#### 修正
- タスク更新後に変更が即座に反映されない問題を修正
  - ETag生成ロジックの改善（タイムスタンプを含める）
  - 更新操作後のキャッシュ制御の強化
  - フロントエンドでのオプティミスティックUI更新の実装
  - ブラウザキャッシュを確実に無効化する仕組みの追加
- タスク更新時に読み込み中画面が表示される問題を修正
  - オプティミスティックUI更新の完全活用
  - 不要なデータ再取得の削除

### フェーズ4: APIエンドポイントの実装（拡張機能） (2025-04-18完了)

#### 追加
- バックアップ関連のエンドポイント
  - `POST /api/backups` - バックアップの作成
  - `GET /api/backups` - バックアップ一覧の取得
  - `POST /api/backups/:filename/restore` - バックアップからの復元
- エクスポート/インポート機能
  - `GET /api/export` - タスクデータのエクスポート
  - `POST /api/import` - タスクデータのインポート
- カテゴリ管理機能
  - `GET /api/categories` - カテゴリ一覧の取得

### フェーズ3: APIエンドポイントの実装（基本機能） (2025-04-18完了)

#### 追加
- タスク管理の基本エンドポイント
  - `GET /api/tasks` - タスク一覧の取得
  - `GET /api/tasks/:id` - 特定のタスクの取得
  - `POST /api/tasks` - 新しいタスクの作成
  - `PUT /api/tasks/:id` - タスクの更新
  - `DELETE /api/tasks/:id` - タスクの削除
  - `PUT /api/tasks/:id/toggle` - タスクの完了状態の切り替え
  - `PUT /api/tasks/:id/memo` - タスクのメモ更新
- エラーハンドリングミドルウェア
  - バリデーションエラー、404エラー、一般エラーの処理

### フェーズ2: データ永続化レイヤーの実装 (2025-04-18完了)

#### 追加
- ファイルシステムを使用したデータ永続化
  - `FileService` クラスの実装
  - JSONファイルの読み書き機能
- タスクサービスの実装
  - `TaskService` クラスの実装
  - タスクのCRUD操作の実装
- データモデルとバリデーション
  - Zodスキーマによるデータバリデーション
  - タスクモデルの型定義

### フェーズ1: プロジェクト構造とベース実装 (2025-04-18完了)

#### 追加
- プロジェクト初期化
  - TypeScriptの設定
  - ESLintとPrettierの設定
  - ディレクトリ構造の作成
- Express.jsサーバーの基本設定
  - ミドルウェアの設定
  - ルーティングの基本構造
  - エラーハンドリングの基本設定
- ロギング機能
  - Winstonロガーの設定
  - リクエストロギングミドルウェア

### Issue01: フロントエンドとバックエンドの分離 (2025-04-18完了)

#### 追加
- プロジェクト構造の設計
  - クライアント（React + TypeScript）
  - サーバー（Node.js + Express + TypeScript）
- 開発環境の設定
  - Viteによるフロントエンド開発サーバー
  - ts-node-devによるバックエンド開発サーバー
  - 並行実行のためのnpm-run-allの設定
