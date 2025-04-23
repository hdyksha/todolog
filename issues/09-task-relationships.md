# Issue09: タスク関連付け機能の実装

## 概要

TodoLogアプリケーションに、タスク間の関連付け機能を追加します。この機能により、ユーザーはタスクを分割したり、関連するタスクをグループ化したりすることができるようになります。特に、大きなタスクを小さなサブタスクに分割し、それらの関係性を維持しながら管理できるようにします。

## ユースケース

1. **タスク分割**
   - 大きなタスクを複数の小さなタスクに分割する
   - 分割したタスク間の親子関係を維持する
   - ワンクリックでタスクを分割して新しいサブタスクを作成する

2. **関連タスクの参照**
   - 親タスクから子タスク（サブタスク）の一覧を確認する
   - 子タスクから親タスクへ簡単に移動する
   - 関連するタスクをまとめて表示する

3. **タスク関連付け管理**
   - 既存のタスク間に後から関連性を追加する
   - タスク間の関連性を編集・削除する
   - 複数の関連タイプ（親子、関連、依存など）をサポートする

## 機能要件

### 1. データモデルの拡張

現在のタスクモデルを拡張し、関連付け情報を保存できるようにします：

```typescript
// 関連タイプの定義
export enum RelationshipType {
  Parent = 'parent',   // 親タスク
  Child = 'child',     // 子タスク（サブタスク）
  Related = 'related', // 関連タスク
  Blocks = 'blocks',   // ブロックする（このタスクが完了しないと他のタスクが進められない）
  BlockedBy = 'blockedBy', // ブロックされる（他のタスクが完了しないとこのタスクが進められない）
}

// タスク関連付けの型定義
export interface TaskRelationship {
  taskId: string;           // 関連先タスクのID
  type: RelationshipType;   // 関連タイプ
  createdAt: string;        // 関連付けが作成された日時
}

// 拡張されたタスクの型定義
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  memo?: string;
  relationships?: TaskRelationship[]; // 追加: タスク関連付け情報
}
```

### 2. UI機能

#### 2.1 タスク分割機能

- タスク詳細画面に「分割」ボタンを追加
- 分割ダイアログで新しいサブタスクのタイトルと詳細を入力
- 分割時に自動的に親子関係を設定

#### 2.2 関連タスク表示

- タスク詳細画面に関連タスクセクションを追加
- 関連タイプ別にグループ化して表示
- 関連タスクへのクイックナビゲーション

#### 2.3 タスク関連付け管理

- 「関連タスクを追加」機能
- 既存タスクの検索と関連付け
- 関連タイプの選択
- 関連付けの削除

### 3. API拡張

#### 3.1 新しいエンドポイント

- `GET /api/tasks/:id/relationships` - タスクの関連付け情報を取得
- `POST /api/tasks/:id/relationships` - 新しい関連付けを追加
- `DELETE /api/tasks/:id/relationships/:relationshipId` - 関連付けを削除
- `POST /api/tasks/:id/split` - タスクを分割して新しいサブタスクを作成

#### 3.2 既存エンドポイントの拡張

- `GET /api/tasks` - 関連付け情報を含めて取得するオプションを追加
- `GET /api/tasks/:id` - 関連付け情報を含めて取得

## 技術的アプローチ

### 1. データ構造設計

タスク関連付けを表現するために、以下の2つのアプローチを検討します：

#### オプション1: 埋め込みアプローチ
各タスクオブジェクト内に関連付け情報を直接埋め込みます。

**メリット**:
- 単一のタスク取得で関連情報も取得できる
- 実装がシンプル

**デメリット**:
- 双方向の関連付けを維持するのが難しい
- データの整合性を保つのが複雑になる可能性がある

#### オプション2: 分離アプローチ
タスク関連付けを別のコレクション/テーブルで管理します。

**メリット**:
- 関連付けの一貫性を保ちやすい
- 複雑な関連クエリに対応しやすい

**デメリット**:
- 追加のデータ取得が必要になる
- 実装が若干複雑になる

**決定**: オプション1の埋め込みアプローチを採用します。TodoLogはファイルベースのデータ保存を使用しているため、シンプルさを優先します。ただし、データの整合性を確保するためのロジックを慎重に実装します。

### 2. フロントエンド実装

#### 2.1 コンポーネント設計

新しいコンポーネントを作成します：

- `TaskRelationships.tsx` - 関連タスク一覧表示
- `TaskSplitDialog.tsx` - タスク分割ダイアログ
- `RelationshipForm.tsx` - 関連付け追加/編集フォーム

#### 2.2 状態管理

TaskContextを拡張して関連付け操作をサポートします：

```typescript
// useTaskActions フックの拡張
export const useTaskActions = () => {
  // 既存のアクション...

  // タスク分割
  const splitTask = useCallback(async (
    parentId: string,
    childTaskData: Partial<Task>
  ) => {
    dispatch({ type: 'SPLIT_TASK_START', payload: parentId });
    
    try {
      const newTask = await apiClient.splitTask(parentId, childTaskData);
      dispatch({ type: 'SPLIT_TASK_SUCCESS', payload: { parentId, childTask: newTask } });
      return newTask;
    } catch (error) {
      dispatch({ 
        type: 'SPLIT_TASK_ERROR', 
        payload: {
          id: parentId,
          error: error instanceof Error ? error : new Error('タスクの分割に失敗しました')
        }
      });
      throw error;
    }
  }, [dispatch]);

  // 関連付け追加
  const addTaskRelationship = useCallback(async (
    taskId: string,
    relatedTaskId: string,
    type: RelationshipType
  ) => {
    // 実装...
  }, [dispatch]);

  // 関連付け削除
  const removeTaskRelationship = useCallback(async (
    taskId: string,
    relationshipId: string
  ) => {
    // 実装...
  }, [dispatch]);

  return {
    // 既存のアクション...
    splitTask,
    addTaskRelationship,
    removeTaskRelationship,
  };
};
```

### 3. バックエンド実装

#### 3.1 データ永続化

タスクデータファイルのスキーマを拡張して関連付け情報を保存します。

#### 3.2 API実装

新しいエンドポイントを実装し、既存のエンドポイントを拡張します。

## 実装計画

### フェーズ1: 基本データモデルとAPI（2日）

1. タスクモデルの拡張
2. 関連付け操作のためのAPIエンドポイント実装
3. データ永続化レイヤーの更新

### フェーズ2: タスク分割機能（2日）

1. タスク分割ダイアログの実装
2. 分割ロジックの実装
3. 親子関係の自動設定

### フェーズ3: 関連タスク表示（2日）

1. タスク詳細画面の拡張
2. 関連タスクコンポーネントの実装
3. 関連タスクのナビゲーション機能

### フェーズ4: タスク関連付け管理（2日）

1. 関連付け追加/編集フォームの実装
2. タスク検索機能の実装
3. 関連付け削除機能

### フェーズ5: テストと最適化（2日）

1. 単体テストの作成
2. 統合テストの作成
3. パフォーマンス最適化
4. エッジケースの処理

**合計予定工数: 10日**

## 詳細設計

### 1. データモデル拡張

```typescript
// server/src/models/task.model.ts

// 関連タイプの定義
export const RelationshipTypeEnum = z.enum([
  'parent',
  'child',
  'related',
  'blocks',
  'blockedBy'
]);
export type RelationshipType = z.infer<typeof RelationshipTypeEnum>;

// タスク関連付けのスキーマ
export const TaskRelationshipSchema = z.object({
  taskId: z.string().uuid('無効なタスクID形式です'),
  type: RelationshipTypeEnum,
  createdAt: z
    .string()
    .refine(isValidDate, { message: '無効な作成日時です' }),
});
export type TaskRelationship = z.infer<typeof TaskRelationshipSchema>;

// タスクスキーマの拡張
export const TaskSchema = CreateTaskSchema.extend({
  id: z.string().uuid('無効なID形式です'),
  createdAt: z
    .string()
    .refine(isValidDate, { message: '無効な作成日時です' }),
  updatedAt: z
    .string()
    .refine(isValidDate, { message: '無効な更新日時です' }),
  relationships: z.array(TaskRelationshipSchema).optional(),
});
```

### 2. タスク分割UI

```tsx
// client/src/components/tasks/TaskSplitDialog.tsx
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Priority } from '../../types';
import './TaskSplitDialog.css';

interface TaskSplitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSplit: (childTaskData: {
    title: string;
    priority: Priority;
    memo?: string;
  }) => Promise<void>;
  parentTaskTitle: string;
  isSubmitting: boolean;
}

const TaskSplitDialog: React.FC<TaskSplitDialogProps> = ({
  isOpen,
  onClose,
  onSplit,
  parentTaskTitle,
  isSubmitting
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [memo, setMemo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await onSplit({
        title,
        priority,
        memo: memo.trim() || undefined
      });
      
      // 成功したらフォームをリセット
      setTitle('');
      setPriority(Priority.Medium);
      setMemo('');
      onClose();
    } catch (error) {
      console.error('タスク分割エラー:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="タスクを分割"
    >
      <div className="task-split-dialog">
        <p className="parent-task-info">
          親タスク: <strong>{parentTaskTitle}</strong>
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="childTaskTitle">サブタスクのタイトル</label>
            <Input
              id="childTaskTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="サブタスクのタイトルを入力"
              required
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="childTaskPriority">優先度</label>
            <select
              id="childTaskPriority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="form-select"
            >
              <option value={Priority.High}>高</option>
              <option value={Priority.Medium}>中</option>
              <option value={Priority.Low}>低</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="childTaskMemo">メモ (オプション)</label>
            <textarea
              id="childTaskMemo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="サブタスクの詳細情報"
              className="form-textarea"
              rows={4}
            />
          </div>
          
          <div className="dialog-actions">
            <Button
              type="button"
              variant="text"
              onClick={onClose}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              分割して作成
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default TaskSplitDialog;
```

### 3. 関連タスク表示コンポーネント

```tsx
// client/src/components/tasks/TaskRelationships.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Task, RelationshipType } from '../../types';
import Button from '../ui/Button';
import './TaskRelationships.css';

interface TaskRelationshipsProps {
  task: Task;
  relatedTasks: Task[];
  onAddRelationship: () => void;
  onRemoveRelationship: (taskId: string, type: RelationshipType) => void;
}

const TaskRelationships: React.FC<TaskRelationshipsProps> = ({
  task,
  relatedTasks,
  onAddRelationship,
  onRemoveRelationship
}) => {
  const navigate = useNavigate();
  
  // 関連タイプ別にタスクをグループ化
  const groupedTasks = {
    parent: relatedTasks.filter(t => 
      task.relationships?.some(r => r.taskId === t.id && r.type === RelationshipType.Parent)
    ),
    child: relatedTasks.filter(t => 
      task.relationships?.some(r => r.taskId === t.id && r.type === RelationshipType.Child)
    ),
    related: relatedTasks.filter(t => 
      task.relationships?.some(r => r.taskId === t.id && r.type === RelationshipType.Related)
    ),
    blocks: relatedTasks.filter(t => 
      task.relationships?.some(r => r.taskId === t.id && r.type === RelationshipType.Blocks)
    ),
    blockedBy: relatedTasks.filter(t => 
      task.relationships?.some(r => r.taskId === t.id && r.type === RelationshipType.BlockedBy)
    ),
  };
  
  // 関連タスクが1つもない場合
  const hasRelatedTasks = Object.values(groupedTasks).some(group => group.length > 0);
  
  if (!hasRelatedTasks) {
    return (
      <div className="task-relationships">
        <div className="task-relationships-header">
          <h2>関連タスク</h2>
          <Button
            variant="secondary"
            size="small"
            onClick={onAddRelationship}
          >
            関連タスクを追加
          </Button>
        </div>
        <p className="no-relationships">関連するタスクはありません</p>
      </div>
    );
  }
  
  return (
    <div className="task-relationships">
      <div className="task-relationships-header">
        <h2>関連タスク</h2>
        <Button
          variant="secondary"
          size="small"
          onClick={onAddRelationship}
        >
          関連タスクを追加
        </Button>
      </div>
      
      {groupedTasks.parent.length > 0 && (
        <div className="relationship-group">
          <h3>親タスク</h3>
          <ul className="related-tasks-list">
            {groupedTasks.parent.map(parentTask => (
              <li key={parentTask.id} className="related-task-item">
                <div className="related-task-info">
                  <span 
                    className="related-task-title"
                    onClick={() => navigate(`/tasks/${parentTask.id}`)}
                  >
                    {parentTask.title}
                  </span>
                  <span className={`task-status ${parentTask.completed ? 'completed' : 'active'}`}>
                    {parentTask.completed ? '完了' : '未完了'}
                  </span>
                </div>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => onRemoveRelationship(parentTask.id, RelationshipType.Parent)}
                >
                  解除
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {groupedTasks.child.length > 0 && (
        <div className="relationship-group">
          <h3>サブタスク</h3>
          <ul className="related-tasks-list">
            {groupedTasks.child.map(childTask => (
              <li key={childTask.id} className="related-task-item">
                <div className="related-task-info">
                  <span 
                    className="related-task-title"
                    onClick={() => navigate(`/tasks/${childTask.id}`)}
                  >
                    {childTask.title}
                  </span>
                  <span className={`task-status ${childTask.completed ? 'completed' : 'active'}`}>
                    {childTask.completed ? '完了' : '未完了'}
                  </span>
                </div>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => onRemoveRelationship(childTask.id, RelationshipType.Child)}
                >
                  解除
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* 他の関連タイプも同様に表示 */}
    </div>
  );
};

export default TaskRelationships;
```

## 期待される成果

1. **ユーザー体験の向上**
   - 大きなタスクを管理しやすい小さなタスクに分割できる
   - タスク間の関連性を視覚的に把握できる
   - 関連するタスク間を簡単に移動できる

2. **タスク管理の効率化**
   - 階層的なタスク構造による整理
   - 依存関係の明確化
   - 関連タスクのグループ化

3. **機能の拡張性**
   - 将来的なガントチャート表示などの基盤となる
   - タスクの依存関係に基づいた自動スケジューリングの可能性

## リスクと対策

1. **データ整合性の問題**
   - **リスク**: 双方向の関連付けで不整合が発生する可能性
   - **対策**: 関連付け操作時に両方のタスクを更新する一貫したロジックを実装

2. **UI複雑化**
   - **リスク**: 関連タスクの表示でUIが複雑になる
   - **対策**: 折りたたみ可能なセクションやタブなどで整理し、必要に応じて情報を表示

3. **パフォーマンス低下**
   - **リスク**: 関連タスクの取得でデータ量が増加
   - **対策**: 必要に応じた遅延読み込みと効率的なキャッシュ戦略

## 結論

タスク関連付け機能の実装により、TodoLogアプリケーションはより高度なタスク管理ツールへと進化します。特に大きなプロジェクトや複雑なタスクを扱う際に、ユーザーの生産性と組織力を大幅に向上させることが期待できます。
