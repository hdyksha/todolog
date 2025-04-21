# カスタムストレージロケーション機能の実装

## 概要

カスタムストレージロケーション機能は、ユーザーがタスクデータの保存先ディレクトリを指定し、複数のタスクファイルを管理できるようにする機能です。この文書では、フロントエンド側の実装について説明します。

## アーキテクチャ

カスタムストレージロケーション機能は、以下のコンポーネントで構成されています：

1. **ServerSettingsContext**
   - サーバー側の設定を管理するコンテキスト
   - データディレクトリやタスクファイル名などの設定を保持

2. **TaskFilesContext**
   - タスクファイル一覧を管理するコンテキスト
   - ファイルの切り替えや新規作成などの機能を提供

3. **StorageSettings**
   - ストレージ設定画面のコンポーネント
   - データディレクトリの変更や新規ファイル作成のUIを提供

4. **settingsApi**
   - サーバーの設定APIとの通信を担当するサービス

## コンポーネント詳細

### ServerSettingsContext

サーバー側の設定を管理するコンテキストです。主に以下の機能を提供します：

- サーバー設定の取得と更新
- データディレクトリの設定
- 現在のタスクファイルの設定

```tsx
// ServerSettingsContext.tsx
export const ServerSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [serverSettings, setServerSettings] = useState<ServerSettings>(defaultServerSettings);
  
  // データディレクトリを設定する
  const setDataDirectory = async (dataDir: string) => {
    try {
      const updatedSettings = await settingsApi.setDataDirectory(dataDir);
      setServerSettings(updatedSettings);
    } catch (err) {
      // エラー処理
    }
  };
  
  // 現在のタスクファイルを設定する
  const setCurrentTaskFile = async (filename: string) => {
    try {
      const updatedSettings = await settingsApi.setCurrentTaskFile(filename);
      setServerSettings(updatedSettings);
    } catch (err) {
      // エラー処理
    }
  };
  
  // コンテキスト値を提供
  return (
    <ServerSettingsContext.Provider
      value={{
        serverSettings,
        setDataDirectory,
        setCurrentTaskFile,
        // その他のプロパティとメソッド
      }}
    >
      {children}
    </ServerSettingsContext.Provider>
  );
};
```

### TaskFilesContext

タスクファイル一覧を管理するコンテキストです。主に以下の機能を提供します：

- タスクファイル一覧の取得
- 最近使用したファイル一覧の取得
- 新しいタスクファイルの作成
- タスクファイルの切り替え

```tsx
// TaskFilesContext.tsx
export const TaskFilesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [taskFiles, setTaskFiles] = useState<string[]>([]);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const { refreshSettings } = useServerSettings();
  
  // タスクファイル一覧を取得する
  const fetchTaskFiles = async () => {
    try {
      const files = await settingsApi.fetchTaskFiles('.json');
      setTaskFiles(files);
    } catch (err) {
      // エラー処理
    }
  };
  
  // 新しいタスクファイルを作成する
  const createNewTaskFile = async (filename: string) => {
    try {
      const result = await settingsApi.createTaskFile(filename);
      await fetchTaskFiles();
      await fetchRecentFiles();
      await refreshSettings();
      return result;
    } catch (err) {
      // エラー処理
      throw err;
    }
  };
  
  // コンテキスト値を提供
  return (
    <TaskFilesContext.Provider
      value={{
        taskFiles,
        recentFiles,
        fetchTaskFiles,
        createNewTaskFile,
        // その他のプロパティとメソッド
      }}
    >
      {children}
    </TaskFilesContext.Provider>
  );
};
```

### StorageSettings

ストレージ設定画面のコンポーネントです。データディレクトリの変更や新規ファイル作成のUIを提供します。

```tsx
// StorageSettings.tsx
const StorageSettings: React.FC = () => {
  const { serverSettings, setDataDirectory } = useServerSettings();
  const { createNewTaskFile, refreshFiles } = useTaskFiles();
  const { showNotification } = useNotification();
  
  const [dataDir, setDataDir] = useState(serverSettings.storage.dataDir);
  const [newFileName, setNewFileName] = useState('');
  
  // データディレクトリを変更する
  const handleDataDirChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await setDataDirectory(dataDir);
      showNotification('データディレクトリを変更しました', 'success');
      await refreshFiles();
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'データディレクトリの変更に失敗しました',
        'error'
      );
    }
  };
  
  // 新しいタスクファイルを作成する
  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createNewTaskFile(newFileName);
      showNotification(`タスクファイル ${newFileName} を作成しました`, 'success');
      setNewFileName('');
      await refreshFiles();
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'タスクファイルの作成に失敗しました',
        'error'
      );
    }
  };
  
  return (
    <div className="storage-settings">
      {/* UIコンポーネント */}
    </div>
  );
};
```

### settingsApi

サーバーの設定APIとの通信を担当するサービスです。主に以下の機能を提供します：

- サーバー設定の取得と更新
- データディレクトリの設定
- タスクファイル一覧の取得
- 新しいタスクファイルの作成

```typescript
// settingsApi.ts
export async function setDataDirectory(dataDir: string): Promise<ServerSettings> {
  const response = await fetch(`${API_BASE_URL}/settings/storage/data-dir`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ dataDir }),
  });
  
  if (!response.ok) {
    throw new Error('データディレクトリの設定に失敗しました');
  }
  
  return response.json();
}

export async function fetchTaskFiles(extension?: string): Promise<string[]> {
  const url = extension 
    ? `${API_BASE_URL}/storage/files?extension=${encodeURIComponent(extension)}`
    : `${API_BASE_URL}/storage/files`;
    
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('ファイル一覧の取得に失敗しました');
  }
  
  return response.json();
}

export async function createTaskFile(filename: string): Promise<{ filename: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/storage/files`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filename }),
  });
  
  if (!response.ok) {
    throw new Error('タスクファイルの作成に失敗しました');
  }
  
  return response.json();
}
```

## データフロー

1. ユーザーがデータディレクトリを変更する
   - `StorageSettings` コンポーネントで入力を受け付ける
   - `ServerSettingsContext` の `setDataDirectory` メソッドを呼び出す
   - `settingsApi.setDataDirectory` を使ってサーバーに変更を通知
   - サーバーから返された設定で `serverSettings` を更新
   - `TaskFilesContext` の `refreshFiles` メソッドを呼び出してファイル一覧を更新

2. ユーザーが新しいタスクファイルを作成する
   - `StorageSettings` コンポーネントで入力を受け付ける
   - `TaskFilesContext` の `createNewTaskFile` メソッドを呼び出す
   - `settingsApi.createTaskFile` を使ってサーバーに作成を通知
   - `fetchTaskFiles` と `fetchRecentFiles` を呼び出してファイル一覧を更新
   - `ServerSettingsContext` の `refreshSettings` メソッドを呼び出して設定を更新

3. ユーザーがタスクファイルを切り替える
   - ドロップダウンメニューからファイルを選択
   - `TaskFilesContext` の `switchTaskFile` メソッドを呼び出す
   - `settingsApi.setCurrentTaskFile` を使ってサーバーに変更を通知
   - `fetchRecentFiles` を呼び出して最近使用したファイル一覧を更新
   - `ServerSettingsContext` の `refreshSettings` メソッドを呼び出して設定を更新

## エラーハンドリング

各コンポーネントでは、APIエラーを適切に処理し、ユーザーに通知します：

```tsx
try {
  await setDataDirectory(dataDir);
  showNotification('データディレクトリを変更しました', 'success');
} catch (error) {
  showNotification(
    error instanceof Error ? error.message : 'データディレクトリの変更に失敗しました',
    'error'
  );
}
```

## テスト戦略

1. **コンテキストのテスト**
   - `ServerSettingsContext` と `TaskFilesContext` の機能をテスト
   - APIモックを使用して、サーバーとの通信をシミュレート

2. **コンポーネントのテスト**
   - `StorageSettings` コンポーネントのレンダリングとユーザー操作をテスト
   - コンテキストモックを使用して、コンテキストの機能をシミュレート

3. **APIサービスのテスト**
   - `settingsApi` の各関数をテスト
   - `fetch` モックを使用して、サーバーレスポンスをシミュレート

## 今後の改善点

1. **ファイル名の変更・削除機能**
   - 既存のタスクファイルの名前を変更する機能
   - 不要なタスクファイルを削除する機能

2. **ディレクトリ選択UI**
   - ファイルシステムブラウザを使用したディレクトリ選択UI
   - よく使うディレクトリのブックマーク機能

3. **ファイル切り替え時の未保存変更の処理**
   - ファイル切り替え時に未保存の変更がある場合の警告
   - 自動保存オプション
