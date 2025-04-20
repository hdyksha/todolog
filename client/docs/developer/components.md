# TodoLog コンポーネント仕様書

## 基本UIコンポーネント

### Button

汎用的なボタンコンポーネント。様々なスタイルバリアントとサイズをサポートしています。

#### Props

| プロパティ名 | 型 | デフォルト値 | 説明 |
|------------|------|-------------|------|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'text'` | `'primary'` | ボタンのスタイルバリアント |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | ボタンのサイズ |
| `fullWidth` | `boolean` | `false` | 親要素の幅いっぱいに広げるかどうか |
| `isLoading` | `boolean` | `false` | ローディング状態を表示するかどうか |
| `icon` | `React.ReactNode` | `undefined` | ボタン内に表示するアイコン |
| `disabled` | `boolean` | `false` | ボタンを無効化するかどうか |
| `onClick` | `(e: React.MouseEvent) => void` | `undefined` | クリック時のコールバック関数 |

#### 使用例

```tsx
// 基本的な使用方法
<Button onClick={handleClick}>クリック</Button>

// バリアントとサイズの指定
<Button variant="danger" size="large">削除</Button>

// ローディング状態
<Button isLoading>保存中...</Button>

// アイコン付きボタン
<Button icon={<StarIcon />}>お気に入り</Button>
```

### Input

フォーム入力用のテキストフィールドコンポーネント。ラベル、エラーメッセージ、ヘルパーテキストをサポートしています。

#### Props

| プロパティ名 | 型 | デフォルト値 | 説明 |
|------------|------|-------------|------|
| `label` | `string` | `undefined` | 入力フィールドのラベル |
| `error` | `string` | `undefined` | エラーメッセージ |
| `helperText` | `string` | `undefined` | 補助テキスト |
| `fullWidth` | `boolean` | `false` | 親要素の幅いっぱいに広げるかどうか |
| `type` | `string` | `'text'` | 入力フィールドのタイプ |
| `value` | `string` | `undefined` | 入力値 |
| `onChange` | `(e: React.ChangeEvent<HTMLInputElement>) => void` | `undefined` | 値変更時のコールバック関数 |

#### 使用例

```tsx
// 基本的な使用方法
<Input 
  label="ユーザー名" 
  value={username} 
  onChange={handleUsernameChange} 
/>

// エラーメッセージ付き
<Input 
  label="メールアドレス" 
  value={email} 
  onChange={handleEmailChange}
  error="有効なメールアドレスを入力してください" 
/>

// ヘルパーテキスト付き
<Input 
  label="パスワード" 
  type="password" 
  value={password} 
  onChange={handlePasswordChange}
  helperText="8文字以上の英数字を含むパスワードを設定してください" 
/>
```

### Select

ドロップダウン選択コンポーネント。単一選択と複数選択をサポートしています。

#### Props

| プロパティ名 | 型 | デフォルト値 | 説明 |
|------------|------|-------------|------|
| `name` | `string` | 必須 | フィールド名 |
| `label` | `string` | `undefined` | 選択フィールドのラベル |
| `value` | `string \| string[]` | 必須 | 選択値 |
| `options` | `Array<{ value: string, label: string }>` | 必須 | 選択肢の配列 |
| `onChange` | `(e: React.ChangeEvent<HTMLSelectElement>) => void` | 必須 | 値変更時のコールバック関数 |
| `error` | `string` | `undefined` | エラーメッセージ |
| `disabled` | `boolean` | `false` | 選択を無効化するかどうか |
| `required` | `boolean` | `false` | 必須フィールドかどうか |
| `multiple` | `boolean` | `false` | 複数選択を許可するかどうか |
| `placeholder` | `string` | `undefined` | プレースホルダーテキスト |

#### 使用例

```tsx
// 基本的な使用方法
<Select
  name="category"
  label="カテゴリ"
  value={category}
  options={categoryOptions}
  onChange={handleCategoryChange}
/>

// 複数選択
<Select
  name="tags"
  label="タグ"
  value={selectedTags}
  options={tagOptions}
  onChange={handleTagsChange}
  multiple
/>

// エラーメッセージ付き
<Select
  name="priority"
  label="優先度"
  value={priority}
  options={priorityOptions}
  onChange={handlePriorityChange}
  error="優先度を選択してください"
  required
/>
```

### Modal

モーダルダイアログコンポーネント。タイトル、コンテンツ、フッターをカスタマイズ可能です。

#### Props

| プロパティ名 | 型 | デフォルト値 | 説明 |
|------------|------|-------------|------|
| `isOpen` | `boolean` | 必須 | モーダルを表示するかどうか |
| `onClose` | `() => void` | 必須 | モーダルを閉じる際のコールバック関数 |
| `title` | `string` | 必須 | モーダルのタイトル |
| `children` | `React.ReactNode` | 必須 | モーダルのコンテンツ |
| `footer` | `React.ReactNode` | `undefined` | モーダルのフッター |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | モーダルのサイズ |
| `closeOnEsc` | `boolean` | `true` | Escキーで閉じるかどうか |
| `closeOnOverlayClick` | `boolean` | `true` | オーバーレイクリックで閉じるかどうか |

#### 使用例

```tsx
// 基本的な使用方法
<Modal
  isOpen={isModalOpen}
  onClose={closeModal}
  title="確認"
>
  <p>本当に削除しますか？</p>
</Modal>

// フッター付きモーダル
<Modal
  isOpen={isModalOpen}
  onClose={closeModal}
  title="タスクの編集"
  footer={
    <div>
      <Button variant="text" onClick={closeModal}>キャンセル</Button>
      <Button onClick={handleSave}>保存</Button>
    </div>
  }
>
  <TaskForm task={currentTask} onSubmit={handleSubmit} />
</Modal>
```

## タスク関連コンポーネント

### TaskItem

個々のタスクを表示するコンポーネント。タスクの基本情報と操作ボタンを提供します。

#### Props

| プロパティ名 | 型 | デフォルト値 | 説明 |
|------------|------|-------------|------|
| `task` | `Task` | 必須 | タスクオブジェクト |
| `onToggleComplete` | `(id: string) => void` | 必須 | 完了状態切り替え時のコールバック関数 |
| `onEdit` | `(task: Task) => void` | 必須 | 編集ボタンクリック時のコールバック関数 |
| `onDelete` | `(id: string) => void` | 必須 | 削除ボタンクリック時のコールバック関数 |
| `onMemoEdit` | `(id: string, memo: string) => void` | `undefined` | メモ編集時のコールバック関数 |

#### 使用例

```tsx
<TaskItem
  task={task}
  onToggleComplete={handleToggleComplete}
  onEdit={handleEditTask}
  onDelete={handleDeleteTask}
  onMemoEdit={handleMemoEdit}
/>
```

### TaskList

タスクのリストを表示するコンポーネント。フィルタリングとソートをサポートしています。

#### Props

| プロパティ名 | 型 | デフォルト値 | 説明 |
|------------|------|-------------|------|
| `tasks` | `Task[]` | 必須 | タスクの配列 |
| `onToggleComplete` | `(id: string) => void` | 必須 | 完了状態切り替え時のコールバック関数 |
| `onEdit` | `(task: Task) => void` | 必須 | 編集ボタンクリック時のコールバック関数 |
| `onDelete` | `(id: string) => void` | 必須 | 削除ボタンクリック時のコールバック関数 |
| `onMemoEdit` | `(id: string, memo: string) => void` | `undefined` | メモ編集時のコールバック関数 |
| `filter` | `TaskFilter` | `{}` | フィルタリング条件 |
| `sortBy` | `SortOption` | `{ field: 'createdAt', direction: 'desc' }` | ソート条件 |
| `emptyMessage` | `string` | `'タスクがありません'` | タスクがない場合に表示するメッセージ |

#### 使用例

```tsx
<TaskList
  tasks={tasks}
  onToggleComplete={handleToggleComplete}
  onEdit={handleEditTask}
  onDelete={handleDeleteTask}
  onMemoEdit={handleMemoEdit}
  filter={{ completed: false, category: 'work' }}
  sortBy={{ field: 'priority', direction: 'asc' }}
/>
```

### TaskForm

タスクの作成・編集用フォームコンポーネント。

#### Props

| プロパティ名 | 型 | デフォルト値 | 説明 |
|------------|------|-------------|------|
| `task` | `Task` | `undefined` | 編集対象のタスク（新規作成時は未指定） |
| `onSubmit` | `(taskData: Partial<Task>) => void` | 必須 | フォーム送信時のコールバック関数 |
| `onCancel` | `() => void` | 必須 | キャンセル時のコールバック関数 |
| `isSubmitting` | `boolean` | `false` | 送信中かどうか |

#### 使用例

```tsx
// 新規タスク作成フォーム
<TaskForm
  onSubmit={handleCreateTask}
  onCancel={closeModal}
/>

// タスク編集フォーム
<TaskForm
  task={currentTask}
  onSubmit={handleUpdateTask}
  onCancel={closeModal}
  isSubmitting={isSubmitting}
/>
```

## レイアウトコンポーネント

### Header

アプリケーションのヘッダーコンポーネント。タイトル、ナビゲーション、アクションボタンを表示します。

#### Props

| プロパティ名 | 型 | デフォルト値 | 説明 |
|------------|------|-------------|------|
| `title` | `string` | `'TodoLog'` | アプリケーションのタイトル |
| `onCreateTask` | `() => void` | 必須 | タスク作成ボタンクリック時のコールバック関数 |
| `onToggleTheme` | `() => void` | 必須 | テーマ切り替えボタンクリック時のコールバック関数 |
| `isDarkMode` | `boolean` | 必須 | ダークモードかどうか |

#### 使用例

```tsx
<Header
  title="TodoLog"
  onCreateTask={openCreateTaskModal}
  onToggleTheme={toggleTheme}
  isDarkMode={isDarkMode}
/>
```

### Sidebar

サイドバーコンポーネント。カテゴリリストとフィルターオプションを表示します。

#### Props

| プロパティ名 | 型 | デフォルト値 | 説明 |
|------------|------|-------------|------|
| `categories` | `string[]` | 必須 | カテゴリの配列 |
| `selectedCategory` | `string \| null` | `null` | 選択中のカテゴリ |
| `onSelectCategory` | `(category: string \| null) => void` | 必須 | カテゴリ選択時のコールバック関数 |
| `filter` | `TaskFilter` | 必須 | 現在のフィルター設定 |
| `onFilterChange` | `(filter: TaskFilter) => void` | 必須 | フィルター変更時のコールバック関数 |
| `isOpen` | `boolean` | `true` | サイドバーを表示するかどうか（モバイル用） |
| `onClose` | `() => void` | `undefined` | サイドバーを閉じる際のコールバック関数（モバイル用） |

#### 使用例

```tsx
<Sidebar
  categories={categories}
  selectedCategory={selectedCategory}
  onSelectCategory={handleSelectCategory}
  filter={filter}
  onFilterChange={handleFilterChange}
  isOpen={isSidebarOpen}
  onClose={closeSidebar}
/>
```

## ユーティリティコンポーネント

### Notification

通知メッセージを表示するコンポーネント。成功、エラー、警告、情報の4種類のタイプをサポートしています。

#### Props

| プロパティ名 | 型 | デフォルト値 | 説明 |
|------------|------|-------------|------|
| `type` | `'success' \| 'error' \| 'warning' \| 'info'` | `'info'` | 通知のタイプ |
| `message` | `string` | 必須 | 通知メッセージ |
| `duration` | `number` | `3000` | 表示時間（ミリ秒） |
| `onClose` | `() => void` | 必須 | 閉じるボタンクリック時のコールバック関数 |

#### 使用例

```tsx
<Notification
  type="success"
  message="タスクが正常に作成されました"
  onClose={closeNotification}
/>
```

### EmptyState

データが空の状態を表示するコンポーネント。

#### Props

| プロパティ名 | 型 | デフォルト値 | 説明 |
|------------|------|-------------|------|
| `message` | `string` | `'データがありません'` | 表示するメッセージ |
| `icon` | `React.ReactNode` | `undefined` | 表示するアイコン |
| `action` | `React.ReactNode` | `undefined` | アクションボタンなど |

#### 使用例

```tsx
<EmptyState
  message="タスクがありません"
  icon={<TaskIcon />}
  action={<Button onClick={openCreateTaskModal}>タスクを作成</Button>}
/>
```

### SearchInput

検索入力フィールドコンポーネント。

#### Props

| プロパティ名 | 型 | デフォルト値 | 説明 |
|------------|------|-------------|------|
| `value` | `string` | 必須 | 検索クエリ |
| `onChange` | `(e: React.ChangeEvent<HTMLInputElement>) => void` | 必須 | 値変更時のコールバック関数 |
| `placeholder` | `string` | `'検索...'` | プレースホルダーテキスト |
| `onClear` | `() => void` | 必須 | クリアボタンクリック時のコールバック関数 |

#### 使用例

```tsx
<SearchInput
  value={searchQuery}
  onChange={handleSearchChange}
  placeholder="タスクを検索..."
  onClear={clearSearch}
/>
```

## コンポーネント間の関係

TodoLogのコンポーネントは、以下のような階層構造で組み合わされています。

```
App
├── Header
├── Sidebar
└── MainContent
    ├── TaskListContainer
    │   ├── SearchInput
    │   ├── TaskFilters
    │   └── TaskList
    │       └── TaskItem (複数)
    ├── TaskFormModal
    │   └── TaskForm
    └── Notification
```

この構造により、関心の分離と再利用性を実現しています。
