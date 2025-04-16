# TODOログ

TypeScript + Reactで作成したシンプルなTODOタスク管理アプリケーションです。タスクデータはバックエンドサーバーを通じてファイルに永続化されます。

## 機能

- タスクの追加
- タスクの完了/未完了の切り替え
- タスクの削除
- タスクデータのファイル永続化

## 使用技術

- フロントエンド: React, TypeScript, CSS
- バックエンド: Node.js, Express

## 始め方

このプロジェクトを実行するには：

```bash
# 依存関係のインストール
npm install

# 開発サーバーとバックエンドの同時起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くとアプリケーションが表示されます。
バックエンドサーバーは [http://localhost:3001](http://localhost:3001) で実行されます。

## ビルド方法

```bash
# フロントエンドのビルド
npm run build
```

`build` フォルダに本番用のフロントエンドアプリケーションがビルドされます。

## バックエンドサーバーのみの起動

```bash
npm run server
```

## 設定

バックエンドの設定は `server/config.json` ファイルで管理されています：

```json
{
  "dataStoragePath": "data",
  "tasksFileName": "tasks.json",
  "autoSaveInterval": 60000
}
```

- `dataStoragePath`: タスクデータを保存するディレクトリのパス（相対パスまたは絶対パス）
- `tasksFileName`: タスクデータを保存するファイル名
- `autoSaveInterval`: 自動保存の間隔（ミリ秒）
