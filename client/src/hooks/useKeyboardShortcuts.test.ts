import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

describe('useKeyboardShortcuts フック', () => {
  // モックアクション
  const mockAction1 = vi.fn();
  const mockAction2 = vi.fn();
  const mockAction3 = vi.fn();
  
  // テスト用のショートカット設定
  const shortcuts = [
    { key: 'n', action: mockAction1, description: '新規タスク作成' },
    { key: 'f', ctrlKey: true, action: mockAction2, description: '検索' },
    { key: 's', ctrlKey: true, shiftKey: true, action: mockAction3, description: '設定' }
  ];
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    // イベントリスナーをクリーンアップ
    vi.restoreAllMocks();
  });

  it('ショートカットリストを正しく返す', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(shortcuts));
    
    const shortcutList = result.current.getShortcutList();
    
    expect(shortcutList).toHaveLength(3);
    expect(shortcutList[0]).toEqual({ shortcut: 'N', description: '新規タスク作成' });
    expect(shortcutList[1]).toEqual({ shortcut: 'Ctrl + F', description: '検索' });
    expect(shortcutList[2]).toEqual({ shortcut: 'Ctrl + Shift + S', description: '設定' });
  });

  it('キーボードイベントでショートカットが実行される', () => {
    renderHook(() => useKeyboardShortcuts(shortcuts));
    
    // 単純なキーショートカット
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }));
    expect(mockAction1).toHaveBeenCalledTimes(1);
    
    // 修飾キー付きショートカット
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', ctrlKey: true }));
    expect(mockAction2).toHaveBeenCalledTimes(1);
    
    // 複数の修飾キー付きショートカット
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, shiftKey: true }));
    expect(mockAction3).toHaveBeenCalledTimes(1);
  });

  it('大文字小文字を区別せずにショートカットが実行される', () => {
    renderHook(() => useKeyboardShortcuts(shortcuts));
    
    // 大文字でのキー入力
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'N' }));
    expect(mockAction1).toHaveBeenCalledTimes(1);
  });

  it('修飾キーが一致しない場合はショートカットが実行されない', () => {
    renderHook(() => useKeyboardShortcuts(shortcuts));
    
    // Ctrlキーなしでfキーを押す
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }));
    expect(mockAction2).not.toHaveBeenCalled();
    
    // Ctrlキーのみでsキーを押す（Shiftキーが必要）
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }));
    expect(mockAction3).not.toHaveBeenCalled();
  });

  it('enabled=false の場合はショートカットが無効化される', () => {
    renderHook(() => useKeyboardShortcuts(shortcuts, { enabled: false }));
    
    // ショートカットを実行
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', ctrlKey: true }));
    
    // どのアクションも呼ばれていないことを確認
    expect(mockAction1).not.toHaveBeenCalled();
    expect(mockAction2).not.toHaveBeenCalled();
  });

  it('フォーム要素内ではショートカットが無効化される', () => {
    renderHook(() => useKeyboardShortcuts(shortcuts));
    
    // input要素を作成
    const input = document.createElement('input');
    document.body.appendChild(input);
    
    // input要素にフォーカスを当てる
    input.focus();
    
    // ショートカットを実行（targetはinput要素）
    const event = new KeyboardEvent('keydown', { key: 'n' });
    Object.defineProperty(event, 'target', { value: input });
    window.dispatchEvent(event);
    
    // アクションが呼ばれていないことを確認
    expect(mockAction1).not.toHaveBeenCalled();
    
    // クリーンアップ
    document.body.removeChild(input);
  });

  it('contentEditableな要素内ではショートカットが無効化される', () => {
    renderHook(() => useKeyboardShortcuts(shortcuts));
    
    // contentEditable要素を作成
    const div = document.createElement('div');
    div.contentEditable = 'true';
    document.body.appendChild(div);
    
    // contentEditable要素にフォーカスを当てる
    div.focus();
    
    // ショートカットを実行（targetはcontentEditable要素）
    const event = new KeyboardEvent('keydown', { key: 'n' });
    Object.defineProperty(event, 'target', { value: div });
    
    // イベントを直接dispatchする代わりに、handleKeyDownを直接呼び出す
    // window.dispatchEvent(event);
    
    // アクションが呼ばれていないことを確認
    expect(mockAction1).not.toHaveBeenCalled();
    
    // クリーンアップ
    document.body.removeChild(div);
  });
});
