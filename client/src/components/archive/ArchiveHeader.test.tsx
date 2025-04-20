import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ArchiveHeader from './ArchiveHeader';
import { SettingsProvider } from '../../contexts/SettingsContext';

// モックデータ
const mockStats = {
  total: 10,
  today: 3,
  thisWeek: 7
};

describe('ArchiveHeader', () => {
  const mockToggle = vi.fn();

  const renderComponent = (isExpanded = false) => {
    return render(
      <SettingsProvider>
        <ArchiveHeader
          archivedTasksCount={10}
          isExpanded={isExpanded}
          onToggleExpand={mockToggle}
          stats={mockStats}
        />
      </SettingsProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正しいタイトルと統計情報が表示される', () => {
    renderComponent();
    
    // タイトルが表示されるか確認
    expect(screen.getByText(/アーカイブ済み \(10\)/)).toBeInTheDocument();
  });

  it('展開ボタンをクリックするとonToggleが呼ばれる', () => {
    renderComponent();
    
    // 展開ボタンをクリック
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    
    // onToggleが呼ばれたことを確認
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('isExpandedの値に応じて適切なアイコンが表示される', () => {
    // 閉じている状態
    const { rerender } = renderComponent(false);
    expect(screen.getByText('▶')).toBeInTheDocument();
    
    // 展開している状態
    rerender(
      <SettingsProvider>
        <ArchiveHeader
          archivedTasksCount={10}
          isExpanded={true}
          onToggleExpand={mockToggle}
          stats={mockStats}
        />
      </SettingsProvider>
    );
    expect(screen.getByText('▼')).toBeInTheDocument();
  });
});
