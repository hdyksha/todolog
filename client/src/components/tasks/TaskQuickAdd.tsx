import type React from 'react';
import { useState } from 'react';
import { Priority } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import EditablePriority from './EditablePriority';
import './TaskQuickAdd.css';

interface TaskQuickAddProps {
  onAddTask: (title: string, priority: Priority) => Promise<void>;
}

/**
 * タスクのクイック追加フォームコンポーネント
 */
const TaskQuickAdd: React.FC<TaskQuickAddProps> = ({ onAddTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority>(Priority.Medium);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrioritySelector, setShowPrioritySelector] = useState(false);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      setIsSubmitting(true);
      try {
        await onAddTask(newTaskTitle, selectedPriority);
        setNewTaskTitle('');
        setSelectedPriority(Priority.Medium); // リセット
      } catch (error) {
        console.error('タスク作成エラー:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form className="quick-add-form" onSubmit={handleQuickAdd} data-testid="quick-add-form">
      <div className="quick-add-input-container">
        <Input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="新しいタスクを入力..."
          label="クイック追加"
          fullWidth
          disabled={isSubmitting}
          data-testid="quick-add-input"
          onFocus={() => setShowPrioritySelector(true)}
        />
        
        {showPrioritySelector && (
          <div className="quick-add-priority-selector">
            <label className="quick-add-priority-label">優先度:</label>
            <EditablePriority
              priority={selectedPriority}
              onSave={setSelectedPriority}
              inline={false}
              className="quick-add-priority-badges"
            />
          </div>
        )}
      </div>
      
      <Button 
        type="submit" 
        variant="primary" 
        disabled={isSubmitting || !newTaskTitle.trim()}
        data-testid="quick-add-button"
      >
        追加
      </Button>
    </form>
  );
};

export default TaskQuickAdd;
