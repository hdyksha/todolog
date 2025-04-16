import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskForm from '../../components/TaskForm/TaskForm';

describe('TaskForm component', () => {
  const mockOnNewTaskChange = jest.fn();
  const mockOnAddTask = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('入力フィールドとボタンが表示される', () => {
    render(
      <TaskForm
        newTask=""
        currentFile="test.json"
        onNewTaskChange={mockOnNewTaskChange}
        onAddTask={mockOnAddTask}
      />
    );

    expect(screen.getByPlaceholderText('新しいタスクを入力...')).toBeInTheDocument();
    expect(screen.getByText('追加')).toBeInTheDocument();
  });

  test('入力値が変更されるとonNewTaskChangeが呼ばれる', () => {
    render(
      <TaskForm
        newTask=""
        currentFile="test.json"
        onNewTaskChange={mockOnNewTaskChange}
        onAddTask={mockOnAddTask}
      />
    );

    const input = screen.getByPlaceholderText('新しいタスクを入力...');
    fireEvent.change(input, { target: { value: 'テストタスク' } });
    
    expect(mockOnNewTaskChange).toHaveBeenCalledWith('テストタスク');
  });

  test('Enterキーを押すとonAddTaskが呼ばれる', () => {
    render(
      <TaskForm
        newTask="テストタスク"
        currentFile="test.json"
        onNewTaskChange={mockOnNewTaskChange}
        onAddTask={mockOnAddTask}
      />
    );

    const input = screen.getByPlaceholderText('新しいタスクを入力...');
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    expect(mockOnAddTask).toHaveBeenCalled();
  });

  test('追加ボタンクリック時にonAddTaskが呼ばれる', () => {
    render(
      <TaskForm
        newTask="テストタスク"
        currentFile="test.json"
        onNewTaskChange={mockOnNewTaskChange}
        onAddTask={mockOnAddTask}
      />
    );

    const button = screen.getByText('追加');
    fireEvent.click(button);
    
    expect(mockOnAddTask).toHaveBeenCalled();
  });

  test('ファイルが選択されていない場合、入力フィールドとボタンが無効化される', () => {
    render(
      <TaskForm
        newTask="テストタスク"
        currentFile=""
        onNewTaskChange={mockOnNewTaskChange}
        onAddTask={mockOnAddTask}
      />
    );

    expect(screen.getByPlaceholderText('新しいタスクを入力...')).toBeDisabled();
    expect(screen.getByText('追加')).toBeDisabled();
  });
});
