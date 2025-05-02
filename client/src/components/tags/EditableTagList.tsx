import React, { useState, useEffect } from 'react';
import TagBadge from './TagBadge';
import TagInput from './TagInput';
import InlineEditableField from '../ui/InlineEditableField';
import { useTagContext } from '../../contexts/TagContext';
import './EditableTagList.css';

interface EditableTagListProps {
  tags: string[];
  onSave: (tags: string[]) => Promise<void>;
  disabled?: boolean;
}

/**
 * 編集可能なタグリストコンポーネント
 */
const EditableTagList: React.FC<EditableTagListProps> = ({
  tags,
  onSave,
  disabled = false,
}) => {
  const { state: { tags: tagMap, loading } } = useTagContext();
  const [availableTags, setAvailableTags] = useState<Record<string, { color: string }>>({});
  const [editedTags, setEditedTags] = useState<string[]>(tags);

  // タグが変更されたら編集中のタグも更新
  useEffect(() => {
    setEditedTags(tags);
  }, [tags]);

  // タグマップが読み込まれたら利用可能なタグを設定
  useEffect(() => {
    if (!loading && tagMap) {
      const formattedTags: Record<string, { color: string }> = {};
      Object.entries(tagMap).forEach(([tag, data]) => {
        formattedTags[tag] = { color: data.color || '#e0e0e0' };
      });
      setAvailableTags(formattedTags);
    }
  }, [tagMap, loading]);

  // タグの表示コンポーネント
  const renderTagsDisplay = (currentTags: string[], onClick: () => void) => {
    if (disabled) {
      return (
        <div className="tags-display">
          {currentTags.length > 0 ? (
            currentTags.map(tag => (
              <TagBadge key={tag} tag={tag} color={tagMap && tagMap[tag] ? tagMap[tag].color : undefined} />
            ))
          ) : (
            <span className="no-tags">タグなし</span>
          )}
        </div>
      );
    }
    
    return (
      <div 
        className="tags-display editable"
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-label="タグを編集"
      >
        {currentTags.length > 0 ? (
          <>
            {currentTags.map(tag => (
              <TagBadge key={tag} tag={tag} color={tagMap && tagMap[tag] ? tagMap[tag].color : undefined} />
            ))}
            <span className="edit-tags-icon">✎</span>
          </>
        ) : (
          <span className="no-tags">タグなし（クリックして追加）</span>
        )}
      </div>
    );
  };

  // タグの編集コンポーネント
  const renderTagsEdit = (
    currentTags: string[],
    onSave: (newTags: string[]) => void,
    onCancel: () => void
  ) => {
    // コンポーネントのトップレベルで定義したフックを使用
    const handleTagsChange = (newTags: string[]) => {
      setEditedTags(newTags);
    };

    const handleSave = () => {
      onSave(editedTags);
    };

    return (
      <div className="tags-edit-container">
        <TagInput
          selectedTags={editedTags}
          availableTags={availableTags}
          onChange={handleTagsChange}
          placeholder="タグを追加..."
        />
        <div className="tags-edit-actions">
          <button 
            className="tags-edit-save" 
            onClick={handleSave}
            aria-label="タグを保存"
          >
            保存
          </button>
          <button 
            className="tags-edit-cancel" 
            onClick={onCancel}
            aria-label="キャンセル"
          >
            キャンセル
          </button>
        </div>
      </div>
    );
  };

  return (
    <InlineEditableField
      value={tags}
      onSave={onSave}
      renderDisplay={renderTagsDisplay}
      renderEdit={renderTagsEdit}
      className="editable-tags"
    />
  );
};

export default EditableTagList;
