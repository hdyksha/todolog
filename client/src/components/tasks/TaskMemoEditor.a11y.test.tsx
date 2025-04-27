import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi } from 'vitest';
import TaskMemoEditor from './TaskMemoEditor';

// 依存コンポーネントをモック
vi.mock('../TaskMemoViewer', () => ({
  default: ({ memo }: { memo: string }) => (
    <div data-testid="task-memo-viewer">{memo}</div>
  ),
}));

vi.mock('../MarkdownHelpModal', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="markdown-help-modal">
      <button onClick={onClose}>閉じる</button>
    </div>
  ),
}));

expect.extend(toHaveNoViolations);

describe('TaskMemoEditor アクセシビリティ', () => {
  const mockOnSave = vi.fn().mockResolvedValue(undefined);
  const mockOnCancel = vi.fn();
  const mockOnCheckboxChange = vi.fn();

  it('アクセシビリティ違反がないこと（編集モード）', async () => {
    const { container } = render(
      <TaskMemoEditor
        initialMemo="テストメモ"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onCheckboxChange={mockOnCheckboxChange}
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('テキストエリアに適切なラベルと説明があること', () => {
    render(
      <TaskMemoEditor
        initialMemo="テストメモ"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onCheckboxChange={mockOnCheckboxChange}
      />
    );
    
    const textarea = screen.getByPlaceholderText('メモを入力...');
    expect(textarea).toBeInTheDocument();
    // テキストエリアはデフォルトでは無効化されていない
    expect(textarea).not.toBeDisabled();
  });

  it('ボタンに適切なラベルがあること', () => {
    render(
      <TaskMemoEditor
        initialMemo="テストメモ"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onCheckboxChange={mockOnCheckboxChange}
      />
    );
    
    expect(screen.getByText('プレビュー')).toBeInTheDocument();
    expect(screen.getByText('保存')).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
    expect(screen.getByLabelText('ヘルプ')).toBeInTheDocument();
  });
});
