# Issue07: キーボードショートカット機能の修復

## 概要

TodoLogアプリケーションでキーボードショートカットが機能していない問題を調査し、修復するための計画を策定します。ショートカットはユーザーの生産性向上に重要な機能であり、早急に対応する必要があります。

## 現状の問題

アプリケーション上でキーボードショートカットが効かなくなっています。`useKeyboardShortcuts` フックは実装されていますが、実際のアプリケーション内で正しく統合されていない可能性があります。

## 調査計画

### フェーズ1: 問題の特定と原因分析

1. **現在のショートカット実装の調査**
   - `useKeyboardShortcuts` フックの実装を確認
   - ショートカットを使用しているコンポーネントの特定
   - イベントリスナーの登録状況の確認

2. **問題の切り分け**
   - グローバルショートカットとコンポーネント固有ショートカットの区別
   - イベント伝播の問題の有無
   - モーダルやフォーカス状態による影響

3. **テスト環境での検証**
   - 既存のテストケースの確認
   - 手動テストによる問題の再現

### フェーズ2: 解決策の設計

1. **アーキテクチャの見直し**
   - グローバルなキーボードショートカット管理の検討
   - `KeyboardShortcutsContext` の導入検討

2. **実装方針の決定**
   - イベントリスナーの適切な登録場所
   - コンポーネント間の責任分担
   - ショートカットの優先順位付け

### フェーズ3: 実装

1. **KeyboardShortcutsContextの作成**
   ```typescript
   // src/contexts/KeyboardShortcutsContext.tsx
   import React, { createContext, useContext, ReactNode } from 'react';
   import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

   interface ShortcutInfo {
     shortcut: string;
     description: string;
   }

   interface KeyboardShortcutsContextType {
     shortcuts: ShortcutInfo[];
   }

   const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

   export const KeyboardShortcutsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
     // グローバルショートカットの定義
     const globalShortcuts = [
       { key: 'n', action: () => {/* 新規タスク作成 */}, description: '新規タスク作成' },
       { key: '/', action: () => {/* 検索フォーカス */}, description: '検索' },
       { key: 'h', action: () => {/* ヘルプ表示 */}, description: 'ヘルプ表示' },
       // 他のグローバルショートカット
     ];

     // useKeyboardShortcutsフックを使用
     const { getShortcutList } = useKeyboardShortcuts(globalShortcuts);
     const shortcuts = getShortcutList();

     return (
       <KeyboardShortcutsContext.Provider value={{ shortcuts }}>
         {children}
       </KeyboardShortcutsContext.Provider>
     );
   };

   export const useKeyboardShortcutsContext = () => {
     const context = useContext(KeyboardShortcutsContext);
     if (context === undefined) {
       throw new Error('useKeyboardShortcutsContext must be used within a KeyboardShortcutsProvider');
     }
     return context;
   };
   ```

2. **App.tsxへの統合**
   ```typescript
   // src/App.tsx の修正
   import { KeyboardShortcutsProvider } from './contexts/KeyboardShortcutsContext';

   const App: React.FC = () => {
     return (
       <BrowserRouter>
         <ThemeProvider>
           <NotificationProvider>
             <SettingsProvider>
               <ServerSettingsProvider>
                 <TaskFilesProvider>
                   <KeyboardShortcutsProvider> {/* 追加 */}
                     <TaskProvider>
                       <NotificationContainer />
                       <Routes>
                         {/* ... */}
                       </Routes>
                     </TaskProvider>
                   </KeyboardShortcutsProvider>
                 </TaskFilesProvider>
               </ServerSettingsProvider>
             </SettingsProvider>
           </NotificationProvider>
         </ThemeProvider>
       </BrowserRouter>
     );
   };
   ```

3. **ショートカットヘルプコンポーネントの統合**
   ```typescript
   // src/components/layouts/MainLayout.tsx の修正
   import { useKeyboardShortcutsContext } from '../../contexts/KeyboardShortcutsContext';
   import ShortcutHelp from '../ui/ShortcutHelp';

   const MainLayout: React.FC = () => {
     const { shortcuts } = useKeyboardShortcutsContext();
     
     // ...

     return (
       <div className={`app-container ${theme}`}>
         <header className="header">
           {/* ... */}
           <div className="header__actions">
             <TaskFileSelector />
             <ShortcutHelp shortcuts={shortcuts} /> {/* 追加 */}
             {/* ... */}
           </div>
         </header>
         
         {/* ... */}
       </div>
     );
   };
   ```

4. **useKeyboardShortcutsフックの修正（必要に応じて）**
   - イベント伝播の問題があれば修正
   - フォーカス管理の改善

### フェーズ4: テストと検証

1. **単体テスト**
   - `KeyboardShortcutsContext` のテスト
   - 修正した `useKeyboardShortcuts` フックのテスト

2. **統合テスト**
   - 実際のコンポーネントでのショートカット動作確認
   - モーダル表示時やフォーム入力時の挙動確認

3. **ユーザーテスト**
   - 実際のユースケースでのショートカット動作確認
   - エッジケースの検証

## 実装スケジュール

1. **フェーズ1: 問題の特定と原因分析** - 1日
2. **フェーズ2: 解決策の設計** - 0.5日
3. **フェーズ3: 実装** - 1.5日
4. **フェーズ4: テストと検証** - 1日

**合計予定工数: 4日**

## 期待される成果

- すべてのキーボードショートカットが正常に機能する
- ショートカットヘルプが利用可能で、現在使用可能なショートカットを表示する
- ショートカットの競合がなく、適切な優先順位で動作する
- フォーム入力中など、適切な状況でショートカットが無効化される

## 技術的考慮事項

1. **イベント伝播**
   - イベントバブリングとキャプチャリングの適切な処理
   - `stopPropagation()` と `preventDefault()` の適切な使用

2. **フォーカス管理**
   - フォーカス状態に応じたショートカットの有効/無効の切り替え
   - アクセシビリティへの配慮

3. **パフォーマンス**
   - 過剰なレンダリングの防止
   - イベントリスナーの適切な登録と解除

4. **テスト容易性**
   - モック可能な設計
   - テスト可能なコンポーネント分割

## リスクと対策

1. **リスク**: 既存のコードとの統合で予期せぬ副作用が発生する可能性
   **対策**: 段階的な実装と各段階でのテスト実施

2. **リスク**: ブラウザやOS固有のショートカットとの競合
   **対策**: 一般的なブラウザショートカットを避け、必要に応じて代替手段を提供

3. **リスク**: アクセシビリティの問題
   **対策**: WAI-ARIAガイドラインに従い、スクリーンリーダー対応を確認

## 結論

キーボードショートカット機能の修復は、ユーザー体験向上のために重要な取り組みです。本計画に従って実装を進めることで、効率的かつ堅牢なショートカット機能を提供できると考えられます。
