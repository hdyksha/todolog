# Issue09: タグベースのタスク関連付け機能の実装

## 概要

TodoLogアプリケーションに、タグベースのタスク関連付け機能を追加します。現在の単一カテゴリ機能を廃止し、複数のタグを付けられるようにすることで、より柔軟なタスクの分類と関連付けを可能にします。これにより、ユーザーは様々な視点からタスクをグループ化し、効率的に管理できるようになります。

## ユースケース

1. **複数タグによる分類**
   - 1つのタスクに複数のタグを付与できる
   - タグによるフィルタリングでタスクをグループ化
   - タグの組み合わせによる高度な検索

2. **タグの管理**
   - タグの作成、編集、削除
   - タグの色分けによる視覚的な区別
   - 使用頻度の高いタグの優先表示

3. **関連タスクの発見**
   - 同じタグを持つタスクの一覧表示
   - タグクラウドによる関連タスクの発見
   - タグベースのナビゲーション

## 機能要件

### 1. データモデルの変更

現在のタスクモデルを変更し、単一カテゴリから複数のタグを保存できるようにします：

```typescript
// 現在のモデル
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category?: string;  // 単一カテゴリ（廃止予定）
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  memo?: string;
}

// 変更後のモデル
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  tags: string[];  // 複数タグ（新規追加）
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  memo?: string;
}

// タグの型定義
export interface Tag {
  name: string;
  color?: string;
  description?: string;
}
```

### 2. UI機能

#### 2.1 タグ入力コンポーネント

- 複数タグの入力と表示
- タグの追加/削除インターフェース
- オートコンプリート機能
- タグの色表示

#### 2.2 タグ管理機能

- タグ一覧の表示と管理
- タグの色設定
- タグの説明追加
- 未使用タグのクリーンアップ

#### 2.3 タグベースのフィルタリング

- 単一または複数タグによるフィルタリング
- タグの包含/除外条件
- タグクラウド表示

### 3. API拡張

#### 3.1 新しいエンドポイント

- `GET /api/tags` - 利用可能なタグ一覧を取得
- `POST /api/tags` - 新しいタグを作成
- `PUT /api/tags/:name` - タグ情報を更新
- `DELETE /api/tags/:name` - タグを削除

#### 3.2 既存エンドポイントの変更

- `GET /api/tasks` - カテゴリパラメータを廃止し、タグによるフィルタリングパラメータを追加
- `POST /api/tasks` - カテゴリフィールドを廃止し、複数タグのサポートを追加
- `PUT /api/tasks/:id` - カテゴリフィールドを廃止し、タグの更新サポートを追加

## 技術的アプローチ

### 1. データ構造設計

タグを効率的に管理するために、以下のアプローチを採用します：

#### タグ情報の管理

タグ自体の情報（名前、色、説明など）は別のコレクション/ファイルで管理し、タスクにはタグ名の配列のみを保存します。これにより：

- タグ情報の一元管理が可能
- タグの更新が全タスクに反映される
- タグ使用状況の集計が容易

```json
// tags.json
{
  "プロジェクトA": {
    "color": "#ff5722",
    "description": "プロジェクトAに関連するタスク"
  },
  "緊急": {
    "color": "#f44336",
    "description": "緊急対応が必要なタスク"
  },
  "会議": {
    "color": "#2196f3",
    "description": "会議に関連するタスク"
  }
}

// tasks.json (一部)
[
  {
    "id": "task-1",
    "title": "プロジェクトAのキックオフ会議",
    "tags": ["プロジェクトA", "会議"],
    // 他のフィールド...
  }
]
```

### 2. カテゴリからタグへの移行

既存のカテゴリデータをタグに変換するためのマイグレーション戦略：

1. 各タスクの `category` フィールドの値を `tags` 配列の最初の要素として設定
2. 使用されているすべてのカテゴリ名をタグとして登録（色などの初期設定を含む）
3. バックエンドAPIを更新して、古いクライアントからのカテゴリベースのリクエストをタグベースに変換

## 実装計画

### フェーズ1: 基本データモデルとAPI（3日）

- [x] タスクモデルの変更（カテゴリからタグへ）
  - [x] `Task` インターフェースの更新（`category` を削除し、`tags` 配列を追加）
  - [x] 関連する型定義の更新
  - [x] バリデーションスキーマの更新

- [x] タグ管理のためのAPIエンドポイント実装
  - [x] タグ一覧取得 API
  - [x] タグ作成/更新/削除 API

- [x] データ永続化レイヤーの更新
  - [x] タグ情報保存用の新しいファイル構造の作成
  - [x] 既存のカテゴリデータをタグに変換するマイグレーションロジック

- [x] バックエンドのタスク関連APIの更新
  - [x] タスク作成/更新APIでタグをサポート
  - [x] タスク取得APIでタグによるフィルタリングをサポート

### フェーズ2: フロントエンドの基本コンポーネント（2日）

- [x] TagInputコンポーネントの実装
  - [x] 複数タグの入力と表示
  - [x] オートコンプリート機能
  - [x] タグの追加/削除UI

- [x] 既存のカテゴリ選択UIの置き換え
  - [x] TaskFormコンポーネントの更新
  - [x] カテゴリ選択ドロップダウンをTagInputに置き換え
  - [x] 既存のカテゴリフィルターをタグフィルターに置き換え

- [x] タグ表示コンポーネントの実装
  - [x] タスクリスト内でのタグ表示
  - [x] タスク詳細画面でのタグ表示

### フェーズ3: タグ管理機能（2日）

- [x] タグ管理画面の実装
  - [x] タグ一覧表示
  - [x] タグの作成/編集/削除機能
  - [x] タグの色設定機能
  - [x] タグの説明追加機能

- [x] タグ使用状況の表示
  - [x] タグごとの使用タスク数の表示
  - [x] 未使用タグの識別と管理

- [x] 設定画面へのタグ管理セクション追加
  - [x] 既存の設定UIとの統合
  - [x] タグ管理へのナビゲーション

### フェーズ4: タグベースのフィルタリングと検索（2日）

- [x] フィルタリングロジックの拡張
  - [x] 複数タグによるフィルタリング
  - [x] タグの包含/除外条件
  - [x] 既存のフィルター（優先度、完了状態など）との組み合わせ

- [x] タグクラウドの実装
  - [x] 使用頻度に基づく表示
  - [x] タグクラウドからのフィルタリング
  - [x] 視覚的なフィードバック

- [x] 検索機能の拡張
  - [x] タグを含めた検索
  - [x] 検索結果のタグによるグループ化

### フェーズ5: UI/UXの最適化とテスト（2日）

- [x] UI/UXの改善
  - [x] タグ選択の使いやすさ向上
  - [x] タグ表示の視認性向上
  - [x] レスポンシブデザインの最適化

- [x] パフォーマンス最適化
  - [x] タグフィルタリングの効率化
  - [x] タグ関連操作のキャッシュ戦略

- [x] テスト
  - [x] 単体テストの作成
  - [x] 統合テストの作成
  - [x] エッジケースの処理

### フェーズ6: ドキュメントとフィードバック対応（1日）

- [ ] ドキュメント作成
  - [ ] タグ機能の使用方法ガイド
  - [ ] APIドキュメントの更新
  - [ ] 開発者向けドキュメントの更新

- [ ] フィードバック対応の準備
  - [ ] フィードバック収集メカニズムの実装
  - [ ] 問題報告フォームの更新

**合計予定工数: 12日**

## 詳細設計

### 1. TagContext の実装

```typescript
// contexts/TagContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Tag } from '../types';

interface TagState {
  tags: Record<string, Tag>;
  loading: boolean;
  error: Error | null;
}

type TagAction =
  | { type: 'FETCH_TAGS_START' }
  | { type: 'FETCH_TAGS_SUCCESS'; payload: Record<string, Tag> }
  | { type: 'FETCH_TAGS_ERROR'; payload: Error }
  | { type: 'ADD_TAG_SUCCESS'; payload: { name: string; tag: Tag } }
  | { type: 'UPDATE_TAG_SUCCESS'; payload: { name: string; tag: Tag } }
  | { type: 'DELETE_TAG_SUCCESS'; payload: string };

const TagContext = createContext<
  { state: TagState; dispatch: React.Dispatch<TagAction> } | undefined
>(undefined);

const tagReducer = (state: TagState, action: TagAction): TagState => {
  switch (action.type) {
    case 'FETCH_TAGS_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_TAGS_SUCCESS':
      return { tags: action.payload, loading: false, error: null };
    case 'FETCH_TAGS_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_TAG_SUCCESS':
      return {
        ...state,
        tags: {
          ...state.tags,
          [action.payload.name]: action.payload.tag
        }
      };
    case 'UPDATE_TAG_SUCCESS':
      return {
        ...state,
        tags: {
          ...state.tags,
          [action.payload.name]: action.payload.tag
        }
      };
    case 'DELETE_TAG_SUCCESS':
      const { [action.payload]: _, ...remainingTags } = state.tags;
      return {
        ...state,
        tags: remainingTags
      };
    default:
      return state;
  }
};

export const TagProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tagReducer, {
    tags: {},
    loading: false,
    error: null
  });

  return (
    <TagContext.Provider value={{ state, dispatch }}>
      {children}
    </TagContext.Provider>
  );
};

export const useTagContext = () => {
  const context = useContext(TagContext);
  if (context === undefined) {
    throw new Error('useTagContext must be used within a TagProvider');
  }
  return context;
};
```

### 2. タグ入力コンポーネント

```tsx
// components/tags/TagInput.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useTagContext } from '../../contexts/TagContext';
import './TagInput.css';

interface TagInputProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  selectedTags,
  onChange,
  placeholder = 'タグを追加...'
}) => {
  const { state: { tags } } = useTagContext();
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 利用可能なタグから、すでに選択されているタグを除外
  const availableTags = Object.keys(tags).filter(
    tag => !selectedTags.includes(tag)
  );

  // 入力値に基づいてフィルタリングされたタグ候補
  const filteredSuggestions = inputValue
    ? availableTags.filter(tag =>
        tag.toLowerCase().includes(inputValue.toLowerCase())
      )
    : availableTags;

  // タグを追加
  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      onChange([...selectedTags, tag]);
    }
    setInputValue('');
  };

  // タグを削除
  const removeTag = (tagToRemove: string) => {
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  // 候補からタグを選択
  const selectSuggestion = (suggestion: string) => {
    addTag(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // クリックイベントのハンドラ（候補リストの外側をクリックしたら閉じる）
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current !== event.target
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="tag-input-container">
      <div className="selected-tags">
        {selectedTags.map(tag => (
          <div
            key={tag}
            className="tag-item"
            style={{
              backgroundColor: tags[tag]?.color || '#e0e0e0'
            }}
          >
            <span className="tag-text">{tag}</span>
            <button
              type="button"
              className="tag-remove"
              onClick={() => removeTag(tag)}
              aria-label={`${tag}を削除`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="tag-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="tag-input"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={e => {
            if (e.key === 'Enter' && inputValue) {
              e.preventDefault();
              addTag(inputValue);
            } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
              removeTag(selectedTags[selectedTags.length - 1]);
            }
          }}
          placeholder={selectedTags.length === 0 ? placeholder : ''}
        />

        {showSuggestions && filteredSuggestions.length > 0 && (
          <div ref={suggestionsRef} className="tag-suggestions">
            {filteredSuggestions.map(suggestion => (
              <div
                key={suggestion}
                className="tag-suggestion-item"
                onClick={() => selectSuggestion(suggestion)}
                style={{
                  borderLeft: `4px solid ${tags[suggestion]?.color || '#e0e0e0'}`
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagInput;
```

### 3. タグフィルターコンポーネント

```tsx
// components/filters/TagFilter.tsx
import React from 'react';
import { useTagContext } from '../../contexts/TagContext';
import './TagFilter.css';

interface TagFilterProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ selectedTags, onChange }) => {
  const { state: { tags } } = useTagContext();
  
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };
  
  const clearTags = () => {
    onChange([]);
  };
  
  return (
    <div className="tag-filter">
      <div className="tag-filter-header">
        <h3>タグでフィルター</h3>
        {selectedTags.length > 0 && (
          <button
            type="button"
            className="clear-tags-button"
            onClick={clearTags}
          >
            クリア
          </button>
        )}
      </div>
      
      <div className="tag-filter-list">
        {Object.keys(tags).length === 0 ? (
          <p className="no-tags-message">タグがありません</p>
        ) : (
          Object.entries(tags).map(([tagName, tagInfo]) => (
            <div
              key={tagName}
              className={`tag-filter-item ${selectedTags.includes(tagName) ? 'selected' : ''}`}
              onClick={() => toggleTag(tagName)}
              style={{
                borderLeft: `4px solid ${tagInfo.color || '#e0e0e0'}`
              }}
            >
              <span className="tag-name">{tagName}</span>
              {selectedTags.includes(tagName) && (
                <span className="tag-selected-indicator">✓</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TagFilter;
```

## 期待される成果

1. **柔軟なタスク分類**
   - 複数の視点からタスクを分類できる
   - より細かく、かつ多角的なタスク管理が可能
   - 関連するタスクを簡単に見つけられる

2. **視覚的な整理**
   - 色分けされたタグによる視覚的な区別
   - タグクラウドによる全体像の把握
   - 重要なタグの強調表示

3. **検索性の向上**
   - タグベースの高度な検索
   - 複数条件による絞り込み
   - 関連タスクの発見

## リスクと対策

1. **タグの乱立**
   - **リスク**: ユーザーが多数のタグを作成し、管理が難しくなる
   - **対策**: タグの使用状況の可視化、未使用タグのクリーンアップ機能

2. **パフォーマンス低下**
   - **リスク**: 多数のタグによるフィルタリングでパフォーマンスが低下
   - **対策**: 効率的なインデックス作成、クライアント側でのキャッシュ

3. **移行に伴う混乱**
   - **リスク**: カテゴリからタグへの移行でユーザーが混乱する
   - **対策**: 明確なUI表示と説明、初回表示時のガイダンス

## 結論

カテゴリからタグベースのシステムへの移行により、TodoLogアプリケーションはより柔軟で強力なタスク管理ツールへと進化します。単一カテゴリの制限を取り払い、複数タグによる多角的な分類が可能になることで、ユーザーの多様なニーズに対応できるようになります。また、視覚的な要素を強化することで、タスク管理の効率と使いやすさが向上します。
