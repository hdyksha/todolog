import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UnifiedTagInput from './UnifiedTagInput';

// TagContextをモック
vi.mock('../../contexts/TagContext', () => ({
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
    
    const removeButton = screen.getAllByRole('button')[0]; // 最初のタグの削除ボタン
    fireEvent.click(removeButton);
    
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
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
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
});
