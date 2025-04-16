import React, { useState } from 'react';

interface TodoFormProps {
  onAdd: (text: string) => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ onAdd }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', marginBottom: '20px' }}>
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="新しいタスクを入力..."
        style={{
          flexGrow: 1,
          padding: '8px',
          fontSize: '16px',
          border: '1px solid #ddd',
          borderRadius: '4px 0 0 4px',
        }}
      />
      <button
        type="submit"
        style={{
          borderRadius: '0 4px 4px 0',
        }}
      >
        追加
      </button>
    </form>
  );
};

export default TodoForm;
