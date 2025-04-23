import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskMemoViewer from './TaskMemoViewer';

describe('TaskMemoViewer', () => {
  it('空のメモの場合にプレースホルダーを表示する', () => {
    render(<TaskMemoViewer memo="" />);
    expect(screen.getByText('メモはありません')).toBeInTheDocument();
  });

  it('基本的なテキストを正しく表示する', () => {
    render(<TaskMemoViewer memo="これは基本的なテキストです。" />);
    expect(screen.getByText('これは基本的なテキストです。')).toBeInTheDocument();
  });

  it('見出しを正しく表示する', () => {
    render(
      <TaskMemoViewer
        memo={`# 見出し1\n## 見出し2\n### 見出し3`}
      />
    );
    expect(screen.getByText('見出し1')).toBeInTheDocument();
    expect(screen.getByText('見出し2')).toBeInTheDocument();
    expect(screen.getByText('見出し3')).toBeInTheDocument();
  });

  it('リンクを正しく表示する', () => {
    render(
      <TaskMemoViewer
        memo={`[リンクテキスト](https://example.com)`}
      />
    );
    const link = screen.getByText('リンクテキスト');
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('リストを正しく表示する', () => {
    render(
      <TaskMemoViewer
        memo={`- 項目1\n- 項目2\n- 項目3`}
      />
    );
    expect(screen.getByText('項目1')).toBeInTheDocument();
    expect(screen.getByText('項目2')).toBeInTheDocument();
    expect(screen.getByText('項目3')).toBeInTheDocument();
  });

  it('コードブロックを正しく表示する', () => {
    render(
      <TaskMemoViewer
        memo={`\`\`\`\nconsole.log('Hello');\n\`\`\``}
      />
    );
    expect(screen.getByText(`console.log('Hello');`)).toBeInTheDocument();
  });

  it('インラインコードを正しく表示する', () => {
    render(<TaskMemoViewer memo={`これは \`インラインコード\` です。`} />);
    expect(screen.getByText('インラインコード')).toBeInTheDocument();
  });

  it('引用を正しく表示する', () => {
    render(<TaskMemoViewer memo={`> これは引用です。`} />);
    expect(screen.getByText('これは引用です。')).toBeInTheDocument();
  });
});
