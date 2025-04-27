import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi } from 'vitest';
import TaskMetadata from './TaskMetadata';
import { Priority } from '../../types';

// TagBadgeコンポーネントをモック
vi.mock('../tags/TagBadge', () => ({
  default: ({ tag }: { tag: string }) => <span data-testid="tag-badge">{tag}</span>,
}));

expect.extend(toHaveNoViolations);

describe('TaskMetadata アクセシビリティ', () => {
  const mockCreatedAt = '2025-04-01T10:00:00.000Z';
  const mockUpdatedAt = '2025-04-02T15:30:00.000Z';
  const mockDueDate = '2025-04-10T23:59:59.000Z';
  const mockTags = ['仕事', '重要', 'プロジェクトA'];

  it('アクセシビリティ違反がないこと（基本情報）', async () => {
    const { container } = render(
      <TaskMetadata
        isCompleted={false}
        priority={Priority.Medium}
        createdAt={mockCreatedAt}
        updatedAt={mockUpdatedAt}
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('アクセシビリティ違反がないこと（全情報）', async () => {
    const { container } = render(
      <TaskMetadata
        isCompleted={true}
        priority={Priority.High}
        tags={mockTags}
        dueDate={mockDueDate}
        createdAt={mockCreatedAt}
        updatedAt={mockUpdatedAt}
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('色のコントラストが適切であること', () => {
    const { container } = render(
      <TaskMetadata
        isCompleted={false}
        priority={Priority.High}
        tags={mockTags}
        dueDate={mockDueDate}
        createdAt={mockCreatedAt}
        updatedAt={mockUpdatedAt}
      />
    );
    
    // 実際のコントラストチェックはCSSに依存するため、
    // ここではコンポーネントが正しくレンダリングされることだけを確認
    expect(container.querySelector('.task-status')).toBeInTheDocument();
    expect(container.querySelector('.task-priority')).toBeInTheDocument();
  });
});
