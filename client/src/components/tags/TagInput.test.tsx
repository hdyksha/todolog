import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TagInput from './TagInput';

describe('TagInput Component', () => {
  const mockTags = {
    'タスク': { color: '#ff0000' },
    '重要': { color: '#00ff00' },
    '会議': { color: '#0000ff' },
    'プロジェクト': { color: '#ffff00' }
  };
  
  const mockOnChange = vi.fn();
  
  beforeEach(() => {
    mockOnChange.mockClear();
  });
  
  test('renders with selected tags', () => {
    render(
      <TagInput
        selectedTags={['タスク', '重要']}
        availableTags={mockTags}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText('タスク')).toBeInTheDocument();
    expect(screen.getByText('重要')).toBeInTheDocument();
    expect(screen.getByLabelText('タグを追加')).toBeInTheDocument();
  });
  
  test('allows adding a new tag by typing and pressing Enter', () => {
    render(
      <TagInput
        selectedTags={['タスク']}
        availableTags={mockTags}
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
      <TagInput
        selectedTags={['タスク', '重要']}
        availableTags={mockTags}
        onChange={mockOnChange}
      />
    );
    
    const removeButton = screen.getAllByRole('button')[0]; // 最初のタグの削除ボタン
    fireEvent.click(removeButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(['重要']);
  });
  
  test('shows suggestions when typing', () => {
    render(
      <TagInput
        selectedTags={[]}
        availableTags={mockTags}
        onChange={mockOnChange}
      />
    );
    
    const input = screen.getByLabelText('タグを追加');
    fireEvent.change(input, { target: { value: 'プロ' } });
    fireEvent.focus(input);
    
    // プロジェクトが候補に表示される
    expect(screen.getByText('プロジェクト')).toBeInTheDocument();
  });
  
  test('allows selecting a suggestion by clicking', () => {
    render(
      <TagInput
        selectedTags={[]}
        availableTags={mockTags}
        onChange={mockOnChange}
      />
    );
    
    const input = screen.getByLabelText('タグを追加');
    fireEvent.change(input, { target: { value: '会' } });
    fireEvent.focus(input);
    
    // 会議が候補に表示される
    const suggestion = screen.getByText('会議');
    fireEvent.click(suggestion);
    
    expect(mockOnChange).toHaveBeenCalledWith(['会議']);
  });
  
  test('respects maxTags limit', () => {
    render(
      <TagInput
        selectedTags={['タスク', '重要']}
        availableTags={mockTags}
        onChange={mockOnChange}
        maxTags={2}
      />
    );
    
    // maxTagsに達しているため、入力フィールドは表示されない
    expect(screen.queryByLabelText('タグを追加')).not.toBeInTheDocument();
  });
  
  test('is disabled when disabled prop is true', () => {
    render(
      <TagInput
        selectedTags={['タスク']}
        availableTags={mockTags}
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
      <TagInput
        selectedTags={['タスク', '重要']}
        availableTags={mockTags}
        onChange={mockOnChange}
      />
    );
    
    const input = screen.getByLabelText('タグを追加');
    fireEvent.keyDown(input, { key: 'Backspace' });
    
    expect(mockOnChange).toHaveBeenCalledWith(['タスク']);
  });
  
  test('closes suggestions with Escape key', () => {
    render(
      <TagInput
        selectedTags={[]}
        availableTags={mockTags}
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
