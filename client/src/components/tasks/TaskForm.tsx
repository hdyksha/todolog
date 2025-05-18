import React, { useState, useEffect } from 'react';
import { Task, Priority } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useTaskContext } from '../../contexts/TaskContext';
import { useTagContext } from '../../contexts/TagContext';
import EditablePriority from './EditablePriority';
import UnifiedTagInput from '../tags/UnifiedTagInput';
import { mergeTagSources } from '../../utils/tagUtils';
import './TaskForm.css';

interface TaskFormProps {
  task?: Task;
  onSubmit: (taskData: Partial<Task>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { tasks } = useTaskContext();
  const { state: { tags: tagContextTags } } = useTagContext();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [tags, setTags] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [memo, setMemo] = useState('');
  const [titleError, setTitleError] = useState('');
  
  // タグ情報をマージ - TagContextを信頼できる唯一のソースとして扱う
  const mergedTags = React.useMemo(() => {
    return mergeTagSources(tagContextTags, {});
  }, [tagContextTags]);

  // 編集モードの場合、既存のタスクデータをフォームに設定
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setPriority(task.priority);
      setTags(task.tags || []);
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setMemo(task.memo || '');
    }
  }, [task]);

  // タイトル入力時にエラーをクリア
  useEffect(() => {
    if (title && titleError) {
      setTitleError('');
    }
  }, [title, titleError]);

  // フォーム送信ハンドラー
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!title.trim()) {
      setTitleError('タイトルは必須です');
      return;
    }

    // タスクデータの作成
    const taskData: Partial<Task> = {
      title: title.trim(),
      priority,
      tags: tags.length > 0 ? tags : undefined,
      memo: memo.trim() || undefined,
    };

    // 期限の設定
    if (dueDate) {
      taskData.dueDate = new Date(dueDate);
    } else {
      taskData.dueDate = undefined;
    }

    onSubmit(taskData);
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <Input
          id="task-title"
          label="タイトル"
          value={title}
          onChange={setTitle}
          placeholder="タスクのタイトルを入力"
          required
          error={titleError}
          disabled={isSubmitting}
          autoFocus
        />
      </div>

      <div className="form-group">
        <label className="form-label">優先度</label>
        <EditablePriority
          priority={priority}
          onSave={setPriority}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label className="form-label">タグ</label>
        <div className="tags-input-container">
          <UnifiedTagInput
            selectedTags={tags}
            onChange={setTags}
            placeholder="タグを入力してEnterキーで追加"
            availableTags={mergedTags}
          />
        </div>
      </div>

      <div className="form-group">
        <Input
          id="task-due-date"
          label="期限"
          type="date"
          value={dueDate}
          onChange={setDueDate}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="task-memo">メモ</label>
        <textarea
          id="task-memo"
          className="form-textarea"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="メモを入力（オプション）"
          rows={4}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-actions">
        <Button
          type="button"
          variant="text"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
        >
          {task ? '更新' : '作成'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
