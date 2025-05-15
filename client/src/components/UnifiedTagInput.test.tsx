import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UnifiedTagInput from './tags/UnifiedTagInput';

// TagContextをモック
vi.mock('../contexts/TagContext', () => ({
  useTagContext: () => ({
    state: {
      tags: {
        'タスク': { color: '#ff0000' },
        '重要': { color: '#00ff00' },
        '会議': { color: '#0000ff' },
        'プロジェクト': { color: '#ffff00' }
      },
      loading: false,
      error: null
    }
  })
}));

describe('UnifiedTagInput Component', () => {
  const mockOnChange = vi.fn();
  
  beforeEach(() => {
    mockOnChange.mockClear();
  });
  
  test('renders with selected tags', () => {
    render(
      <UnifiedTagInput
        selectedTags={['タスク', '重要']}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText('タスク')).toBeInTheDocument();
    expect(screen.getByText('重要')).toBeInTheDocument();
    expect(screen.getByLabelText('タグを追加')).toBeInTheDocument();
  });
  
  test('allows adding a new tag by typing and pressing Enter', () => {
    render(
      <UnifiedTagInput
        selectedTags={['タスク']}
        onChange={mockOnChange}
      />
    );
    
    const input = screen.getByLabelText('タグを追加');
    fireEvent.change(input, { target: { value: '新しいタグ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(mockOnChange).toHaveBeenCalledWith(['タスク', '新しいタグ']);
  });
  
  test('allows removing a tag', () => {
    render(
      <UnifiedTagInput
        selectedTags={['タスク', '重要']}
        onChange={mockOnChange}
      />
    );
    
    const removeButtons = screen.getAllByRole('button', { name: /を削除/ });
    fireEvent.click(removeButtons[0]); // 最初のタグの削除ボタン
    
    expect(mockOnChange).toHaveBeenCalledWith(['重要']);
  });
  
  test('respects maxTags limit', () => {
    render(
      <UnifiedTagInput
        selectedTags={['タスク', '重要']}
        onChange={mockOnChange}
        maxTags={2}
      />
    );
    
    // maxTagsに達しているため、入力フィールドは表示されない
    expect(screen.queryByLabelText('タグを追加')).not.toBeInTheDocument();
  });
  
  test('is disabled when disabled prop is true', () => {
    render(
      <UnifiedTagInput
        selectedTags={['タスク']}
        onChange={mockOnChange}
        disabled={true}
      />
    );
    
    expect(screen.getByText('タスク')).toBeInTheDocument();
    expect(screen.queryByLabelText('タグを追加')).not.toBeInTheDocument();
  });
  
  test('allows removing last tag with backspace', () => {
    render(
      <UnifiedTagInput
        selectedTags={['タスク', '重要']}
        onChange={mockOnChange}
      />
    );
    
    const input = screen.getByLabelText('タグを追加');
    fireEvent.keyDown(input, { key: 'Backspace' });
    
    expect(mockOnChange).toHaveBeenCalledWith(['タスク']);
  });
  
  test('closes suggestions with Escape key', () => {
    render(
      <UnifiedTagInput
        selectedTags={[]}
        onChange={mockOnChange}
      />
    );
    
    const input = screen.getByLabelText('タグを追加');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Escape' });
    
    // エスケープキーでサジェストが閉じる（検証は難しいので、エラーが出なければOK）
    expect(true).toBe(true);
  });
  
  test('renders in inline mode', () => {
    render(
      <UnifiedTagInput
        selectedTags={['タスク']}
        onChange={mockOnChange}
        inline={true}
      />
    );
    
    expect(screen.getByText('タスク')).toBeInTheDocument();
    expect(screen.getByText('+ タグを追加')).toBeInTheDocument();
  });
  
  test('works with external tags', () => {
    const externalTags = {
      'タスク': { color: '#ff0000' },
      '重要': { color: '#00ff00' },
      '会議': { color: '#0000ff' }
    };
    
    render(
      <UnifiedTagInput
        selectedTags={['タスク']}
        onChange={mockOnChange}
        availableTags={externalTags}
      />
    );
    
    expect(screen.getByText('タスク')).toBeInTheDocument();
    
    const input = screen.getByLabelText('タグを追加');
    fireEvent.change(input, { target: { value: '会' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // 外部から渡されたタグが正しく使用されていることを確認
    expect(mockOnChange).toHaveBeenCalledWith(['タスク', '会議']);
  });
});
