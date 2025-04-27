# Issue10 フェーズ1: コード分析と問題点の特定

## 実施内容

TodoLogアプリケーションのコードベースを分析し、冗長な記述、重複した機能、未使用のコード、不要なインポートなどを特定します。

## 静的解析ツールの設定と実行

### 現状分析

- フロントエンド（client）: Biomeが導入済み（@biomejs/biome@1.5.3）
- バックエンド（server）: 静的解析ツールが未導入
- ルートディレクトリに`biome.json`が存在するが、未使用のインポートや変数を検出するための設定が不十分

### 改善計画

1. **Biomeの設定強化**
   - 未使用のインポートや変数を検出するルールを追加
   - コード複雑性を検出するルールを追加

2. **バックエンドへのBiome導入**
   - serverディレクトリにもBiomeを導入
   - TypeScriptの厳格なチェックを有効化

3. **重複コード検出ツールの導入**
   - jscpdを導入して重複コードを検出

## Biome設定の強化

以下のルールを追加して、未使用のコードや潜在的な問題を検出します：

```json
{
  "$schema": "https://biomejs.dev/schemas/1.5.3/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedImports": "error"
      },
      "complexity": {
        "noForEach": "warn",
        "useOptionalChain": "warn"
      },
      "performance": {
        "noDelete": "warn"
      },
      "style": {
        "noNegationElse": "warn",
        "useShorthandArrayType": "warn"
      },
      "suspicious": {
        "noConsoleLog": "warn",
        "noEmptyInterface": "warn",
        "noExplicitAny": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingComma": "es5",
      "semicolons": "always"
    }
  }
}
```

## バンドル分析

フロントエンドのバンドルサイズを分析するために、`rollup-plugin-visualizer`を導入します：

```bash
cd client
npm install --save-dev rollup-plugin-visualizer
```

Vite設定ファイルに以下を追加：

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    // 他のプラグイン...
    visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

## 手動コードレビュー

以下の観点でコードを手動レビューします：

1. **共通パターンと重複ロジック**
   - 類似した機能を持つコンポーネント
   - 複数の場所で実装されている同様のロジック
   - 統合可能なユーティリティ関数

2. **複雑なコード**
   - 長すぎる関数（30行以上）
   - 深いネストを持つ条件分岐
   - 複雑な状態管理

3. **未使用コード**
   - デッドコード（到達不能なコード）
   - コメントアウトされたコード
   - 使用されていない機能やコンポーネント

## 問題点のドキュメント化

特定された問題点を以下のカテゴリに分類してドキュメント化します：

### フロントエンド（client）

| カテゴリ | 問題点 | ファイル | 行番号 | 優先度 | 対応方針 |
|---------|-------|---------|-------|-------|---------|
| 未使用インポート | React のデフォルトインポート | 複数ファイル | - | 高 | 型インポートに変更 |
| 未使用変数 | id 変数が未使用 | Notification.tsx | 15 | 高 | 削除 |
| 重複コード | タスクアクション処理 | HomePage.tsx, TaskItem.tsx | - | 中 | 共通コンポーネント化 |
| 複雑なコンポーネント | TaskDetailPage が大きすぎる | TaskDetailPage.tsx | - | 中 | 複数コンポーネントに分割 |
| 非効率なレンダリング | メモ化されていないコンポーネント | TaskList.tsx | - | 低 | React.memo の適用 |
| アクセシビリティ | ボタンに type 属性がない | 複数ファイル | - | 高 | type="button" を追加 |

### バックエンド（server）

| カテゴリ | 問題点 | ファイル | 行番号 | 優先度 | 対応方針 |
|---------|-------|---------|-------|-------|---------|
| 未使用インポート | fs/promises の一部メソッド | fileService.ts | 3 | 中 | 必要なメソッドのみインポート |
| 重複コード | エラーハンドリングロジック | 複数ファイル | - | 中 | ユーティリティ関数化 |
| 複雑な関数 | saveData 関数が複雑 | dataService.ts | 45-80 | 中 | 複数の小さな関数に分割 |
| エラー処理 | 一貫性のないエラーメッセージ | 複数ファイル | - | 中 | エラーメッセージの統一 |

### 共通ユーティリティ

| カテゴリ | 問題点 | ファイル | 行番号 | 優先度 | 対応方針 |
|---------|-------|---------|-------|-------|---------|
| 重複ユーティリティ | 日付フォーマット関数 | 複数ファイル | - | 中 | 共通ユーティリティに統合 |
| 未使用関数 | 古いヘルパー関数 | utils/helpers.ts | 25-40 | 低 | 削除 |

## 分析結果

コード分析の結果、以下の主要な問題点が特定されました：

1. **フロントエンド**
   - React のデフォルトインポートが型として使用されている
   - 未使用の変数やインポートが複数存在
   - コンポーネント間で重複するロジックが多い
   - 大きすぎるコンポーネントがいくつか存在
   - アクセシビリティの問題（ボタンの type 属性など）

2. **バックエンド**
   - エラーハンドリングの一貫性がない
   - 複雑な関数がいくつか存在
   - 重複するロジックがある

3. **共通**
   - 日付フォーマットなどのユーティリティ関数が重複
   - 型定義の一部に重複がある

## 次のステップ

1. フロントエンドのクリーンアップを優先的に実施
   - 未使用のインポートと変数の削除
   - アクセシビリティの問題の修正
   - 共通コンポーネントの作成と重複コードの統合

2. バックエンドのクリーンアップを計画
   - エラーハンドリングの統一
   - 複雑な関数のリファクタリング

3. 共通ユーティリティの最適化を計画
   - 重複するユーティリティ関数の統合
   - 型定義の整理
