import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsProvider } from '../../contexts/SettingsContext';
import ArchiveSettings from './ArchiveSettings';

describe('ArchiveSettings', () => {
  it('アーカイブ設定オプションが表示される', () => {
    render(
      <SettingsProvider>
        <ArchiveSettings />
      </SettingsProvider>
    );

    // 見出しが表示されるか確認
    expect(screen.getByText('アーカイブ設定')).toBeInTheDocument();

    // 各設定オプションが表示されるか確認
    expect(screen.getByText('アーカイブセクションを表示する')).toBeInTheDocument();
    expect(screen.getByText('アーカイブを自動的に展開する')).toBeInTheDocument();
    expect(screen.getByText('アーカイブ統計を表示する')).toBeInTheDocument();
  });

  it('チェックボックスの状態を変更できる', () => {
    render(
      <SettingsProvider>
        <ArchiveSettings />
      </SettingsProvider>
    );

    // アーカイブセクションを表示するチェックボックス
    const showArchiveCheckbox = screen.getByLabelText('アーカイブセクションを表示する');
    expect(showArchiveCheckbox).toBeChecked(); // デフォルトでチェック済み

    // チェックを外す
    fireEvent.click(showArchiveCheckbox);
    expect(showArchiveCheckbox).not.toBeChecked();

    // 他のチェックボックスが無効になっているか確認
    const autoExpandCheckbox = screen.getByLabelText('アーカイブを自動的に展開する');
    const showStatsCheckbox = screen.getByLabelText('アーカイブ統計を表示する');
    
    expect(autoExpandCheckbox).toBeDisabled();
    expect(showStatsCheckbox).toBeDisabled();

    // 再度チェックを入れる
    fireEvent.click(showArchiveCheckbox);
    expect(showArchiveCheckbox).toBeChecked();
    
    // 他のチェックボックスが有効になっているか確認
    expect(autoExpandCheckbox).not.toBeDisabled();
    expect(showStatsCheckbox).not.toBeDisabled();
  });
});
