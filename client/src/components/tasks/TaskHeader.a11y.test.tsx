import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi } from 'vitest';
import TaskHeader from './TaskHeader';

// react-router-domのモック
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

expect.extend(toHaveNoViolations);

describe('TaskHeader アクセシビリティ', () => {
  const mockOnToggleCompletion = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnTitleChange = vi.fn();

  it('アクセシビリティ違反がないこと（未完了タスク）', async () => {
    const { container } = render(
      <TaskHeader
        title="テストタスク"
        isCompleted={false}
        onToggleCompletion={mockOnToggleCompletion}
        onDelete={mockOnDelete}
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('アクセシビリティ違反がないこと（完了済みタスク）', async () => {
    const { container } = render(
      <TaskHeader
        title="テストタスク"
        isCompleted={true}
        onToggleCompletion={mockOnToggleCompletion}
        onDelete={mockOnDelete}
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('適切な見出し構造になっていること', () => {
    render(
      <TaskHeader
        title="テストタスク"
        isCompleted={false}
        onToggleCompletion={mockOnToggleCompletion}
        onDelete={mockOnDelete}
      />
    );
    
    const heading = document.querySelector('h1');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('テストタスク');
  });

  it('編集可能なタイトルでもアクセシビリティ違反がないこと', async () => {
    const { container } = render(
      <TaskHeader
        title="テストタスク"
        isCompleted={false}
        onToggleCompletion={mockOnToggleCompletion}
        onDelete={mockOnDelete}
        onTitleChange={mockOnTitleChange}
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
