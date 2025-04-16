import React from 'react';
import { Todo } from '../types/todo';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onToggle, onDelete }) => {
  return (
    <div className="todo-list">
      {todos.map(todo => (
        <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
          <input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} />
          <span className="todo-text">{todo.text}</span>
          <button className="delete" onClick={() => onDelete(todo.id)}>
            削除
          </button>
        </div>
      ))}
    </div>
  );
};

export default TodoList;
