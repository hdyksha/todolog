import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import TaskMemoViewer from './TaskMemoViewer';

// TaskMemoViewer コンポーネントをモック
vi.mock('../TaskMemoViewer', () => ({
  default: ({ memo }: { memo: string }) => (
    <div data-testid="task-memo-viewer">
      {memo || 'メモなし'}
    </div>
  ),
}));

describe('TaskMemoViewer', () => {
  const mockOnCheckboxChange = vi.fn();
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('メモがある場合、TaskMemoViewerコンポーネントを表示する', () => {
    render(
      <TaskMemoViewer
        memo="テストメモ"
        onCheckboxChange={mockOnCheckboxChange}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByTestId('task-memo-viewer')).toBeInTheDocument();
    expect(screen.getByText('テストメモ')).toBeInTheDocument();
  });

  it('メモが空の場合、空メッセージを表示する', () => {
    render(
      <TaskMemoViewer
        memo=""
        onCheckboxChange={mockOnCheckboxChange}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.queryByTestId('task-memo-viewer')).not.toBeInTheDocument();
    expect(screen.getByText('メモはありません。クリックして編集を開始してください。')).toBeInTheDocument();
  });

  it('クリックするとonEdit関数が呼ばれる', () => {
    render(
      <TaskMemoViewer
        memo="テストメモ"
        onCheckboxChange={mockOnCheckboxChange}
        onEdit={mockOnEdit}
      />
    );

    fireEvent.click(screen.getByTestId('task-memo-viewer'));
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('onEditが提供されていない場合でもエラーにならない', () => {
    render(
      <TaskMemoViewer
        memo="テストメモ"
        onCheckboxChange={mockOnCheckboxChange}
      />
    );

    // エラーが発生しないことを確認するだけ
    fireEvent.click(screen.getByTestId('task-memo-viewer'));
  });

  it('適切なCSSクラスが適用されている', () => {
    const { container } = render(
      <TaskMemoViewer
        memo="テストメモ"
        onCheckboxChange={mockOnCheckboxChange}
        onEdit={mockOnEdit}
      />
    );

    expect(container.firstChild).toHaveClass('task-memo-viewer-wrapper');
  });
});
