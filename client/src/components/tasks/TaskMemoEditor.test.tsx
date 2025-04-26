import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import TaskMemoEditor from './TaskMemoEditor';

// モック関数
const mockSave = vi.fn().mockResolvedValue(undefined);
const mockCancel = vi.fn();
const mockCheckboxChange = vi.fn();

// TaskMemoViewer コンポーネントをモック
vi.mock('../TaskMemoViewer', () => ({
  default: ({ memo }: { memo: string }) => (
    <div data-testid="task-memo-viewer">
      {memo || 'メモなし'}
    </div>
  ),
}));

// MarkdownHelpModal コンポーネントをモック
vi.mock('../MarkdownHelpModal', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="markdown-help-modal">
      <button onClick={onClose}>閉じる</button>
    </div>
  ),
}));

describe('TaskMemoEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('初期メモを表示する', () => {
    render(
      <TaskMemoEditor
        initialMemo="テストメモ"
        onSave={mockSave}
        onCancel={mockCancel}
        onCheckboxChange={mockCheckboxChange}
      />
    );

    expect(screen.getByDisplayValue('テストメモ')).toBeInTheDocument();
  });

  it('メモを編集できる', () => {
    render(
      <TaskMemoEditor
        initialMemo="テストメモ"
        onSave={mockSave}
        onCancel={mockCancel}
        onCheckboxChange={mockCheckboxChange}
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '更新されたメモ' } });
    expect(screen.getByDisplayValue('更新されたメモ')).toBeInTheDocument();
  });

  it('保存ボタンをクリックするとメモが保存される', async () => {
    render(
      <TaskMemoEditor
        initialMemo="テストメモ"
        onSave={mockSave}
        onCancel={mockCancel}
        onCheckboxChange={mockCheckboxChange}
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '更新されたメモ' } });
    
    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith('更新されたメモ');
    });
  });

  it('キャンセルボタンをクリックするとキャンセル処理が呼ばれる', () => {
    render(
      <TaskMemoEditor
        initialMemo="テストメモ"
        onSave={mockSave}
        onCancel={mockCancel}
        onCheckboxChange={mockCheckboxChange}
      />
    );

    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);
    
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });

  it('プレビューボタンをクリックするとプレビューモードに切り替わる', () => {
    render(
      <TaskMemoEditor
        initialMemo="テストメモ"
        onSave={mockSave}
        onCancel={mockCancel}
        onCheckboxChange={mockCheckboxChange}
      />
    );

    // 初期状態ではテキストエリアが表示されている
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    
    // プレビューボタンをクリック
    const previewButton = screen.getByText('プレビュー');
    fireEvent.click(previewButton);
    
    // プレビューモードに切り替わる
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByTestId('task-memo-viewer')).toBeInTheDocument();
    
    // 編集ボタンが表示される
    expect(screen.getByText('編集')).toBeInTheDocument();
  });

  it('ヘルプボタンをクリックするとマークダウンヘルプモーダルが表示される', () => {
    render(
      <TaskMemoEditor
        initialMemo="テストメモ"
        onSave={mockSave}
        onCancel={mockCancel}
        onCheckboxChange={mockCheckboxChange}
      />
    );

    // ヘルプボタンをクリック
    const helpButton = screen.getByTitle('マークダウンヘルプ');
    fireEvent.click(helpButton);
    
    // ヘルプモーダルが表示される
    expect(screen.getByTestId('markdown-help-modal')).toBeInTheDocument();
    
    // モーダルを閉じる
    const closeButton = screen.getByText('閉じる');
    fireEvent.click(closeButton);
    
    // モーダルが閉じる
    expect(screen.queryByTestId('markdown-help-modal')).not.toBeInTheDocument();
  });
});
