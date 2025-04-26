import { render, screen } from '@testing-library/react';
import TaskMetadata from './TaskMetadata';
import { Priority } from '../../types';

// モックデータ
const mockCreatedAt = '2025-04-01T10:00:00.000Z';
const mockUpdatedAt = '2025-04-02T15:30:00.000Z';
const mockDueDate = '2025-04-10T23:59:59.000Z';
const mockTags = ['仕事', '重要', 'プロジェクトA'];

describe('TaskMetadata', () => {
  it('未完了タスクのステータスを正しく表示する', () => {
    render(
      <TaskMetadata
        isCompleted={false}
        priority={Priority.Medium}
        createdAt={mockCreatedAt}
        updatedAt={mockUpdatedAt}
      />
    );

    expect(screen.getByText('未完了')).toBeInTheDocument();
    expect(screen.getByText('未完了').closest('.task-status')).toHaveClass('active');
  });

  it('完了済みタスクのステータスを正しく表示する', () => {
    render(
      <TaskMetadata
        isCompleted={true}
        priority={Priority.Medium}
        createdAt={mockCreatedAt}
        updatedAt={mockUpdatedAt}
      />
    );

    expect(screen.getByText('完了')).toBeInTheDocument();
    expect(screen.getByText('完了').closest('.task-status')).toHaveClass('completed');
  });

  it('優先度「高」を正しく表示する', () => {
    render(
      <TaskMetadata
        isCompleted={false}
        priority={Priority.High}
        createdAt={mockCreatedAt}
        updatedAt={mockUpdatedAt}
      />
    );

    expect(screen.getByText('高')).toBeInTheDocument();
    expect(screen.getByText('高').closest('.task-priority')).toHaveClass('priority-high');
  });

  it('優先度「中」を正しく表示する', () => {
    render(
      <TaskMetadata
        isCompleted={false}
        priority={Priority.Medium}
        createdAt={mockCreatedAt}
        updatedAt={mockUpdatedAt}
      />
    );

    expect(screen.getByText('中')).toBeInTheDocument();
    expect(screen.getByText('中').closest('.task-priority')).toHaveClass('priority-medium');
  });

  it('優先度「低」を正しく表示する', () => {
    render(
      <TaskMetadata
        isCompleted={false}
        priority={Priority.Low}
        createdAt={mockCreatedAt}
        updatedAt={mockUpdatedAt}
      />
    );

    expect(screen.getByText('低')).toBeInTheDocument();
    expect(screen.getByText('低').closest('.task-priority')).toHaveClass('priority-low');
  });

  it('タグを正しく表示する', () => {
    render(
      <TaskMetadata
        isCompleted={false}
        priority={Priority.Medium}
        tags={mockTags}
        createdAt={mockCreatedAt}
        updatedAt={mockUpdatedAt}
      />
    );

    expect(screen.getByText('仕事')).toBeInTheDocument();
    expect(screen.getByText('重要')).toBeInTheDocument();
    expect(screen.getByText('プロジェクトA')).toBeInTheDocument();
  });

  it('期限を正しく表示する', () => {
    render(
      <TaskMetadata
        isCompleted={false}
        priority={Priority.Medium}
        dueDate={mockDueDate}
        createdAt={mockCreatedAt}
        updatedAt={mockUpdatedAt}
      />
    );

    // 日付のフォーマットはロケールに依存するため、日付が表示されていることだけを確認
    const dueDateElement = screen.getByText('期限').nextSibling;
    expect(dueDateElement).toBeInTheDocument();
  });

  it('作成日と更新日を正しく表示する', () => {
    render(
      <TaskMetadata
        isCompleted={false}
        priority={Priority.Medium}
        createdAt={mockCreatedAt}
        updatedAt={mockUpdatedAt}
      />
    );

    // 日付のフォーマットはロケールに依存するため、日付が表示されていることだけを確認
    const createdAtLabel = screen.getByText('作成日');
    const updatedAtLabel = screen.getByText('更新日');
    
    expect(createdAtLabel.nextSibling).toBeInTheDocument();
    expect(updatedAtLabel.nextSibling).toBeInTheDocument();
  });

  it('タグが空の場合はタグセクションを表示しない', () => {
    render(
      <TaskMetadata
        isCompleted={false}
        priority={Priority.Medium}
        tags={[]}
        createdAt={mockCreatedAt}
        updatedAt={mockUpdatedAt}
      />
    );

    expect(screen.queryByText('タグ')).not.toBeInTheDocument();
  });

  it('期限が設定されていない場合は期限セクションを表示しない', () => {
    render(
      <TaskMetadata
        isCompleted={false}
        priority={Priority.Medium}
        createdAt={mockCreatedAt}
        updatedAt={mockUpdatedAt}
      />
    );

    expect(screen.queryByText('期限')).not.toBeInTheDocument();
  });
});
