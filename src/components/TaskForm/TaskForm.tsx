import React from 'react';

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
  onAddTask
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onAddTask();
    }
  };

  return (
    <div className="task-form">
      <input
        type="text"
        value={newTask}
        onChange={(e) => onNewTaskChange(e.target.value)}
        placeholder="新しいタスクを入力..."
        onKeyPress={handleKeyPress}
        disabled={!currentFile}
      />
      <button 
        onClick={onAddTask}
        disabled={!currentFile}
      >
        追加
      </button>
    </div>
  );
};

export default TaskForm;
