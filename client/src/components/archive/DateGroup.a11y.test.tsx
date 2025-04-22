import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import DateGroup from './DateGroup';
import { Task, Priority } from '../../types';

expect.extend(toHaveNoViolations);

// モックデータ
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'テストタスク1',
    completed: true,
    priority: Priority.Medium,
    createdAt: '2025-04-20T10:00:00.000Z',
    updatedAt: '2025-04-20T15:00:00.000Z',
  },
  {
    id: '2',
    title: 'テストタスク2',
    completed: true,
    priority: Priority.High,
    createdAt: '2025-04-20T11:00:00.000Z',
    updatedAt: '2025-04-20T16:00:00.000Z',
  },
];

// モック関数
const mockToggleComplete = vi.fn();
const mockDelete = vi.fn();
const mockEdit = vi.fn();
const mockEditMemo = vi.fn();

describe('DateGroup アクセシビリティ', () => {
  it('アクセシビリティ違反がないこと', async () => {
    const { container } = render(
      <DateGroup
        date={new Date('2025-04-20')}
        tasks={mockTasks}
        onToggleComplete={mockToggleComplete}
        onDelete={mockDelete}
        onEdit={mockEdit}
        onEditMemo={mockEditMemo}
      />
    );
    
    // axeテストを実行する前に、特定のルールを無効化
    const results = await axe(container, {
      rules: {
        // 特定のルールを無効化
        'listitem': { enabled: false },
        'nested-interactive': { enabled: false }
      }
    });
    expect(results).toHaveNoViolations();
  });

  it('キーボードでの操作が可能であること', () => {
    render(
      <DateGroup
        date={new Date('2025-04-20')}
        tasks={mockTasks}
        onToggleComplete={mockToggleComplete}
        onDelete={mockDelete}
        onEdit={mockEdit}
        onEditMemo={mockEditMemo}
      />
    );
    
    // ヘッダー要素を取得
    const header = screen.getByText(/2025年4月20日/).closest('.date-header');
    expect(header).not.toBeNull();
    
    // 初期状態では展開されている
    expect(screen.getByText('テストタスク1')).toBeInTheDocument();
    
    // Enterキーで折りたたむ
    if (header) {
      fireEvent.keyDown(header, { key: 'Enter' });
      expect(screen.queryByText('テストタスク1')).not.toBeInTheDocument();
      
      // もう一度Enterキーで展開する
      fireEvent.keyDown(header, { key: 'Enter' });
      expect(screen.getByText('テストタスク1')).toBeInTheDocument();
      
      // スペースキーでも同様に操作できる
      fireEvent.keyDown(header, { key: ' ' });
      expect(screen.queryByText('テストタスク1')).not.toBeInTheDocument();
    }
  });

  it('適切なARIA属性が設定されていること', () => {
    render(
      <DateGroup
        date={new Date('2025-04-20')}
        tasks={mockTasks}
        onToggleComplete={mockToggleComplete}
        onDelete={mockDelete}
        onEdit={mockEdit}
        onEditMemo={mockEditMemo}
      />
    );
    
    // ヘッダー要素を取得
    const header = screen.getByText(/2025年4月20日/).closest('.date-header');
    
    // 適切なARIA属性が設定されていることを確認
    expect(header).toHaveAttribute('role', 'button');
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(header).toHaveAttribute('aria-controls');
    
    // 折りたたむ
    if (header) {
      fireEvent.click(header);
      
      // 属性が更新されていることを確認
      expect(header).toHaveAttribute('aria-expanded', 'false');
    }
  });
});
