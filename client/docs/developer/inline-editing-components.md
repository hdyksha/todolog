# インライン編集コンポーネントの設計と実装

## 概要

TodoLogアプリケーションでは、ユーザーがタスクの詳細情報を直接編集できるインライン編集コンポーネントを実装しています。このドキュメントでは、インライン編集コンポーネントの設計思想、実装方法、および使用例について説明します。

## 設計思想

インライン編集コンポーネントは、以下の原則に基づいて設計されています：

1. **シームレスなユーザー体験** - ユーザーが別のページに移動することなく、コンテンツを直接編集できる
2. **一貫性のあるインターフェース** - すべてのインライン編集コンポーネントが同じパターンに従う
3. **アクセシビリティ** - キーボードでの操作やスクリーンリーダーでの使用に対応
4. **フィードバック** - ユーザーの操作に対して適切なフィードバックを提供
5. **エラーハンドリング** - エラーが発生した場合に適切に対応

## 基本構造

インライン編集コンポーネントは、以下の2つのモードを持ちます：

1. **表示モード** - 通常時の表示状態
2. **編集モード** - ユーザーが編集している状態

これらのモードの切り替えは、`InlineEditableField`という基本コンポーネントによって管理されます。

## InlineEditableField コンポーネント

`InlineEditableField`は、インライン編集の基本的な動作を提供する再利用可能なコンポーネントです。

### インターフェース

```typescript
interface InlineEditableFieldProps {
  value: React.ReactNode;
  onSave: (newValue: any) => Promise<void> | void;
  renderDisplay: (value: React.ReactNode, onClick: () => void) => React.ReactNode;
  renderEdit: (value: any, onSave: (newValue: any) => void, onCancel: () => void) => React.ReactNode;
  className?: string;
}
```

### 主な機能

- 表示モードと編集モードの状態管理
- 編集モードへの切り替え
- 変更の保存とキャンセル
- 外部クリックによる編集のキャンセル
- エスケープキーによる編集のキャンセル
- エラーハンドリングとローディング状態の管理

### 実装例

```tsx
const InlineEditableField: React.FC<InlineEditableFieldProps> = ({
  value,
  onSave,
  renderDisplay,
  renderEdit,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 編集モードを開始
  const handleStartEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  // 編集をキャンセル
  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  // 変更を保存
  const handleSave = async (newValue: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onSave(newValue);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 外部クリックとエスケープキーで編集モードを終了
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node)
      ) {
        handleCancel();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isEditing]);

  return (
    <div 
      className={`inline-editable-field ${className} ${isEditing ? 'is-editing' : ''}`}
      ref={containerRef}
    >
      {isEditing ? (
        <div className="inline-editable-field-edit">
          {renderEdit(value, handleSave, handleCancel)}
          {error && <div className="inline-editable-field-error">{error}</div>}
          {isLoading && <div className="inline-editable-field-loading">保存中...</div>}
        </div>
      ) : (
        <div className="inline-editable-field-display">
          {renderDisplay(value, handleStartEdit)}
        </div>
      )}
    </div>
  );
};
```

## 具体的な実装例

### 1. EditablePriority

優先度を編集するためのコンポーネントです。

```tsx
const EditablePriority: React.FC<EditablePriorityProps> = ({
  priority,
  onSave,
  disabled = false,
}) => {
  const [selectedPriority, setSelectedPriority] = useState<Priority>(priority);

  // 表示モードのレンダリング
  const renderDisplay = (value: Priority, onClick: () => void) => {
    if (disabled) {
      return (
        <span className={`priority-badge priority-${value}`}>
          {value === Priority.High ? '高' : value === Priority.Medium ? '中' : '低'}
        </span>
      );
    }

    return (
      <div
        className="priority-badge editable"
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="優先度を編集"
      >
        {value === Priority.High ? '高' : value === Priority.Medium ? '中' : '低'}
        <span className="edit-icon">✎</span>
      </div>
    );
  };

  // 編集モードのレンダリング
  const renderEdit = (
    value: Priority,
    onSave: (newValue: Priority) => void,
    onCancel: () => void
  ) => {
    const handleChange = (newPriority: Priority) => {
      setSelectedPriority(newPriority);
      onSave(newPriority);
    };

    return (
      <div className="priority-selector">
        <button
          type="button"
          className={`priority-option priority-${Priority.High} ${
            selectedPriority === Priority.High ? 'selected' : ''
          }`}
          onClick={() => handleChange(Priority.High)}
          aria-pressed={selectedPriority === Priority.High}
        >
          高
        </button>
        <button
          type="button"
          className={`priority-option priority-${Priority.Medium} ${
            selectedPriority === Priority.Medium ? 'selected' : ''
          }`}
          onClick={() => handleChange(Priority.Medium)}
          aria-pressed={selectedPriority === Priority.Medium}
        >
          中
        </button>
        <button
          type="button"
          className={`priority-option priority-${Priority.Low} ${
            selectedPriority === Priority.Low ? 'selected' : ''
          }`}
          onClick={() => handleChange(Priority.Low)}
          aria-pressed={selectedPriority === Priority.Low}
        >
          低
        </button>
      </div>
    );
  };

  return (
    <InlineEditableField
      value={priority}
      onSave={onSave}
      renderDisplay={renderDisplay}
      renderEdit={renderEdit}
      className="editable-priority"
    />
  );
};
```

### 2. EditableDueDate

締切日を編集するためのコンポーネントです。

```tsx
const EditableDueDate: React.FC<EditableDueDateProps> = ({
  dueDate,
  onSave,
  disabled = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    dueDate ? new Date(dueDate).toISOString().split('T')[0] : null
  );

  // dueDateが変更されたら選択日付を更新
  useEffect(() => {
    setSelectedDate(dueDate ? new Date(dueDate).toISOString().split('T')[0] : null);
  }, [dueDate]);

  // 表示モードのレンダリング
  const renderDisplay = (value: string | null | undefined, onClick: () => void) => {
    if (disabled) {
      return (
        <span className="due-date-display">
          {value ? new Date(value).toLocaleDateString() : '期限なし'}
        </span>
      );
    }

    return (
      <div
        className="due-date-display editable"
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="締切日を編集"
      >
        {value ? new Date(value).toLocaleDateString() : '期限なし'}
        <span className="edit-icon">✎</span>
      </div>
    );
  };

  // 編集モードのレンダリング
  const renderEdit = (
    value: string | null | undefined,
    onSave: (newValue: string | null) => void,
    onCancel: () => void
  ) => {
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedDate(e.target.value || null);
    };

    const handleRemoveDueDate = () => {
      setSelectedDate(null);
    };

    const handleSave = () => {
      onSave(selectedDate);
    };

    return (
      <div className="due-date-edit animate-fade-in">
        <div className="due-date-input-container">
          <input
            type="date"
            value={selectedDate || ''}
            onChange={handleDateChange}
            className="due-date-input"
            aria-label="締切日"
          />
          <button
            type="button"
            onClick={handleRemoveDueDate}
            className="remove-due-date-button"
            aria-label="締切日を削除"
          >
            クリア
          </button>
        </div>
        <div className="due-date-actions">
          <button
            type="button"
            onClick={handleSave}
            className="save-button"
            aria-label="締切日を保存"
          >
            保存
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
            aria-label="キャンセル"
          >
            キャンセル
          </button>
        </div>
      </div>
    );
  };

  return (
    <InlineEditableField
      value={dueDate}
      onSave={onSave}
      renderDisplay={renderDisplay}
      renderEdit={renderEdit}
      className="editable-due-date"
    />
  );
};
```

## パフォーマンス最適化

インライン編集コンポーネントのパフォーマンスを最適化するために、以下の技術を使用しています：

### デバウンス

頻繁に発生する可能性のあるAPIリクエストを最適化するために、`debounce`関数を使用します。

```typescript
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}
```

### メモ化

不要な再レンダリングを防ぐために、`useCallback`と`useMemo`を使用します。

```typescript
const handleSave = useCallback(async (newValue: any) => {
  // 実装
}, [dependencies]);
```

## アクセシビリティ対応

インライン編集コンポーネントは、以下のアクセシビリティ機能を備えています：

1. **キーボード操作** - すべての機能はキーボードでも操作可能
2. **ARIA属性** - 適切なARIA属性を使用して、スクリーンリーダーでの使用をサポート
3. **フォーカス管理** - 編集モードに入るとフォーカスが適切に移動
4. **エスケープキー** - エスケープキーで編集をキャンセル可能

## まとめ

インライン編集コンポーネントは、ユーザーがコンテンツを直接編集できる直感的なインターフェースを提供します。`InlineEditableField`コンポーネントを基盤として、様々な種類のインライン編集コンポーネントを一貫性のある方法で実装できます。

アクセシビリティ、エラーハンドリング、パフォーマンス最適化に注意を払うことで、すべてのユーザーにとって使いやすいインターフェースを実現しています。
