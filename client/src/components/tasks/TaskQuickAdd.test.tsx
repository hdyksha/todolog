import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import TaskQuickAdd from './TaskQuickAdd';
import { Priority } from '../../types';

describe('TaskQuickAdd', () => {
  const mockAddTask = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the quick add form correctly', () => {
    render(<TaskQuickAdd onAddTask={mockAddTask} />);
    
    expect(screen.getByLabelText('クイック追加')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('新しいタスクを入力...')).toBeInTheDocument();
    expect(screen.getByText('追加')).toBeInTheDocument();
  });

  it('disables the add button when input is empty', () => {
    render(<TaskQuickAdd onAddTask={mockAddTask} />);
    
    const addButton = screen.getByText('追加');
    expect(addButton).toBeDisabled();
  });

  it('enables the add button when input has text', () => {
    render(<TaskQuickAdd onAddTask={mockAddTask} />);
    
    const input = screen.getByLabelText('クイック追加');
    fireEvent.change(input, { target: { value: 'テストタスク' } });
    
    const addButton = screen.getByText('追加');
    expect(addButton).not.toBeDisabled();
  });

  it('calls onAddTask with correct parameters when form is submitted', async () => {
    render(<TaskQuickAdd onAddTask={mockAddTask} />);
    
    const input = screen.getByLabelText('クイック追加');
    fireEvent.change(input, { target: { value: 'テストタスク' } });
    
    const addButton = screen.getByText('追加');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(mockAddTask).toHaveBeenCalledWith('テストタスク', Priority.Medium);
    });
  });

  it('clears the input after successful task addition', async () => {
    render(<TaskQuickAdd onAddTask={mockAddTask} />);
    
    const input = screen.getByLabelText('クイック追加');
    fireEvent.change(input, { target: { value: 'テストタスク' } });
    
    const addButton = screen.getByText('追加');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('handles form submission via Enter key', async () => {
    render(<TaskQuickAdd onAddTask={mockAddTask} />);
    
    const input = screen.getByLabelText('クイック追加');
    fireEvent.change(input, { target: { value: 'テストタスク' } });
    
    // フォームを直接サブミット
    const form = screen.getByTestId('quick-add-form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(mockAddTask).toHaveBeenCalledWith('テストタスク', Priority.Medium);
    });
  });

  it('does not submit when input is empty', async () => {
    render(<TaskQuickAdd onAddTask={mockAddTask} />);
    
    // フォームを直接サブミット
    const form = screen.getByTestId('quick-add-form');
    fireEvent.submit(form);
    
    expect(mockAddTask).not.toHaveBeenCalled();
  });
});
