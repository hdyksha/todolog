import React, { useState, useEffect, useRef } from 'react';
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
 * インラインで編集できるように改良
 */
const EditableTagList: React.FC<EditableTagListProps> = ({
  tags,
  onSave,
  disabled = false,
}) => {
  const { state: { tags: tagMap, loading } } = useTagContext();
  const [availableTags, setAvailableTags] = useState<Record<string, { color: string }>>({});
  const [editedTags, setEditedTags] = useState<string[]>(tags);
  const [isInputActive, setIsInputActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // タグの削除
  const handleRemoveTag = (tagToRemove: string) => {
    if (disabled) return;
    const newTags = editedTags.filter(tag => tag !== tagToRemove);
    setEditedTags(newTags);
    onSave(newTags).catch(error => {
      console.error('タグ削除エラー:', error);
      // エラー時は元に戻す
      setEditedTags(tags);
    });
  };

  // タグの追加
  const handleAddTag = (newTag: string) => {
    if (disabled || !newTag.trim()) return;
    
    // 既に存在するタグは追加しない
    if (editedTags.includes(newTag.trim())) {
      setIsInputActive(false);
      return;
    }
    
    const newTags = [...editedTags, newTag.trim()];
    setEditedTags(newTags);
    onSave(newTags).catch(error => {
      console.error('タグ追加エラー:', error);
      // エラー時は元に戻す
      setEditedTags(tags);
    });
    setIsInputActive(false);
  };

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
      <div className="tags-display-inline">
        {currentTags.length > 0 ? (
          currentTags.map(tag => (
            <TagBadge 
              key={tag} 
              tag={tag} 
              color={tagMap && tagMap[tag] ? tagMap[tag].color : undefined}
              onRemove={() => handleRemoveTag(tag)}
              removable={!disabled}
            />
          ))
        ) : (
          <span className="no-tags">タグなし</span>
        )}
        
        {isInputActive ? (
          <div className="inline-tag-input">
            <TagInput
              selectedTags={[]}
              availableTags={availableTags}
              onChange={(selectedTags) => {
                if (selectedTags.length > 0) {
                  handleAddTag(selectedTags[0]);
                }
              }}
              placeholder="タグを入力..."
              autoFocus
              onBlur={() => setIsInputActive(false)}
              ref={inputRef}
              singleTagMode
            />
          </div>
        ) : (
          <button 
            className="add-tag-button" 
            onClick={() => setIsInputActive(true)}
            aria-label="タグを追加"
          >
            + タグを追加
          </button>
        )}
      </div>
    );
  };

  // タグの編集コンポーネント（インライン編集のため表示と同じ）
  const renderTagsEdit = (
    currentTags: string[],
    onSave: (newTags: string[]) => void,
    onCancel: () => void
  ) => {
    return renderTagsDisplay(currentTags, () => {});
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
