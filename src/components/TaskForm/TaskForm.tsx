import React from 'react';
import './TaskForm.css';

interface TaskFormProps {
  newTask: string;
  currentFile: string;
  onNewTaskChange: (text: string) => void;
  onAddTask: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  newTask,
  currentFile,
  onNewTaskChange,
  onAddTask,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  const handleAddTask = () => {
    onAddTask();
  };

  return (
    <div className="task-form" data-testid="task-form">
      <div className="task-form-row">
        <input
          type="text"
          value={newTask}
          onChange={e => onNewTaskChange(e.target.value)}
          placeholder="新しいタスクを入力..."
          onKeyPress={handleKeyPress}
          disabled={!currentFile}
          className="task-input"
        />
        <button
          onClick={handleAddTask}
          disabled={!currentFile || !newTask.trim()}
          className="add-task-btn"
        >
          追加
        </button>
      </div>
    </div>
  );
};

export default TaskForm;
