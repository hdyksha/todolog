import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileSelector from '../../components/FileManager/FileSelector';

describe('FileSelector component', () => {
  const mockFiles = [
    { name: 'file1.json', path: '/path/to/file1.json', lastModified: new Date().toISOString() },
    { name: 'file2.json', path: '/path/to/file2.json', lastModified: new Date().toISOString() },
  ];

  const mockOnFileSelect = jest.fn();
  const mockOnDeleteFile = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ファイルがない場合は適切なメッセージを表示', () => {
    render(
      <FileSelector
        currentFile=""
        taskFiles={[]}
        fileLoading={false}
        onFileSelect={mockOnFileSelect}
        onDeleteFile={mockOnDeleteFile}
      />
    );

    expect(screen.getByText('ファイルがありません')).toBeInTheDocument();
  });

  test('ファイル一覧が表示される', () => {
    render(
      <FileSelector
        currentFile=""
        taskFiles={mockFiles}
        fileLoading={false}
        onFileSelect={mockOnFileSelect}
        onDeleteFile={mockOnDeleteFile}
      />
    );

    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
    
    // ファイル名が含まれているか確認
    const options = screen.getAllByRole('option');
    expect(options.length).toBe(2); // 2つのファイル
    expect(options[0].textContent).toContain('file1.json');
    expect(options[1].textContent).toContain('file2.json');
  });

  test('ファイル選択時にコールバックが呼ばれる', () => {
    render(
      <FileSelector
        currentFile=""
        taskFiles={mockFiles}
        fileLoading={false}
        onFileSelect={mockOnFileSelect}
        onDeleteFile={mockOnDeleteFile}
      />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'file1.json' } });
    expect(mockOnFileSelect).toHaveBeenCalledWith('file1.json');
  });

  test('削除ボタンが表示され、クリック時にコールバックが呼ばれる', () => {
    render(
      <FileSelector
        currentFile="file1.json"
        taskFiles={mockFiles}
        fileLoading={false}
        onFileSelect={mockOnFileSelect}
        onDeleteFile={mockOnDeleteFile}
      />
    );

    const deleteButton = screen.getByText('削除');
    expect(deleteButton).toBeInTheDocument();
    
    fireEvent.click(deleteButton);
    expect(mockOnDeleteFile).toHaveBeenCalledWith('file1.json');
  });

  test('ファイルが選択されていない場合は削除ボタンが表示されない', () => {
    render(
      <FileSelector
        currentFile=""
        taskFiles={mockFiles}
        fileLoading={false}
        onFileSelect={mockOnFileSelect}
        onDeleteFile={mockOnDeleteFile}
      />
    );

    expect(screen.queryByText('削除')).not.toBeInTheDocument();
  });

  test('ローディング中はセレクトボックスが無効化される', () => {
    render(
      <FileSelector
        currentFile=""
        taskFiles={mockFiles}
        fileLoading={true}
        onFileSelect={mockOnFileSelect}
        onDeleteFile={mockOnDeleteFile}
      />
    );

    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  test('ローディング中は削除ボタンが無効化される', () => {
    render(
      <FileSelector
        currentFile="file1.json"
        taskFiles={mockFiles}
        fileLoading={true}
        onFileSelect={mockOnFileSelect}
        onDeleteFile={mockOnDeleteFile}
      />
    );

    expect(screen.getByText('削除')).toBeDisabled();
  });
});
