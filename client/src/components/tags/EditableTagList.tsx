import React, { useState, useEffect } from 'react';
import TagBadge from './TagBadge';
import InlineEditableField from '../ui/InlineEditableField';
import UnifiedTagInput from './UnifiedTagInput';
import './EditableTagList.css';

interface EditableTagListProps {
  tags: string[];
  onSave: (tags: string[]) => Promise<void>;
  disabled?: boolean;
}

/**
 * 編集可能なタグリストコンポーネント
 * インラインで編集できるように改良
 * UnifiedTagInputを使用
 */
const EditableTagList: React.FC<EditableTagListProps> = ({
  tags,
  onSave,
  disabled = false,
}) => {
  const [editedTags, setEditedTags] = useState<string[]>(tags);

  // タグが変更されたら編集中のタグも更新
  useEffect(() => {
    setEditedTags(tags);
  }, [tags]);

  // タグの表示コンポーネント
  const renderTagsDisplay = (currentTags: string[], onClick: () => void) => {
    if (disabled) {
      return (
        <div className="tags-display">
          {currentTags.length > 0 ? (
            currentTags.map(tag => (
              <TagBadge key={tag} tag={tag} />
            ))
          ) : (
            <span className="no-tags">タグなし</span>
          )}
        </div>
      );
    }
    
    return (
      <UnifiedTagInput
        selectedTags={currentTags}
        onChange={(newTags) => {
          setEditedTags(newTags);
          onSave(newTags).catch(error => {
            console.error('タグ更新エラー:', error);
            // エラー時は元に戻す
            setEditedTags(tags);
          });
        }}
        inline={true}
        disabled={disabled}
      />
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
