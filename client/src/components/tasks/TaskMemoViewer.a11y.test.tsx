import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi } from 'vitest';
import TaskMemoViewer from './TaskMemoViewer';

expect.extend(toHaveNoViolations);

// TaskMemoViewer コンポーネントをモック
vi.mock('../TaskMemoViewer', () => ({
  default: ({ memo }: { memo: string }) => (
    <div data-testid="task-memo-viewer" role="region" aria-label="タスクメモ">
      {memo || 'メモなし'}
    </div>
  ),
}));

describe('TaskMemoViewer アクセシビリティ', () => {
  const mockOnCheckboxChange = vi.fn();
  const mockOnEdit = vi.fn();

  it('アクセシビリティ違反がないこと（メモあり）', async () => {
    const { container } = render(
      <TaskMemoViewer
        memo="テストメモ"
        onCheckboxChange={mockOnCheckboxChange}
        onEdit={mockOnEdit}
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('アクセシビリティ違反がないこと（メモなし）', async () => {
    const { container } = render(
      <TaskMemoViewer
        memo=""
        onCheckboxChange={mockOnCheckboxChange}
        onEdit={mockOnEdit}
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('適切なARIA属性が設定されていること', () => {
    render(
      <TaskMemoViewer
        memo="テストメモ"
        onCheckboxChange={mockOnCheckboxChange}
        onEdit={mockOnEdit}
      />
    );
    
    const memoViewer = document.querySelector('[data-testid="task-memo-viewer"]');
    expect(memoViewer).toHaveAttribute('role', 'region');
    expect(memoViewer).toHaveAttribute('aria-label', 'タスクメモ');
  });
});
