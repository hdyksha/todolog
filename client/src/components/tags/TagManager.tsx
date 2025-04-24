import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import './TagManager.css';

interface TagManagerProps {
  onSelectTag?: (tag: string) => void;
}

interface TagData {
  [key: string]: {
    color: string;
  };
}

const TagManager: React.FC<TagManagerProps> = ({ onSelectTag }) => {
  const [tags, setTags] = useState<TagData>({});
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#cccccc');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const fetchedTags = await apiClient.fetchTags();
      setTags(fetchedTags);
      setError(null);
    } catch (err) {
      console.error('タグ取得エラー:', err);
      setError('タグの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTagName.trim()) {
      setError('タグ名を入力してください');
      return;
    }

    try {
      const updatedTags = await apiClient.createTag(newTagName, newTagColor);
      setTags(updatedTags);
      setNewTagName('');
      setNewTagColor('#cccccc');
      setIsAdding(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'タグの追加に失敗しました');
    }
  };

  const handleDeleteTag = async (tagName: string) => {
    if (!window.confirm(`タグ「${tagName}」を削除しますか？`)) {
      return;
    }

    try {
      const updatedTags = await apiClient.deleteTag(tagName);
      setTags(updatedTags);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'タグの削除に失敗しました');
    }
  };

  const handleTagClick = (tag: string) => {
    if (onSelectTag) {
      onSelectTag(tag);
    }
  };

  return (
    <div className="tag-manager">
      <h3 className="tag-manager-title">タグ管理</h3>
      
      {error && <div className="tag-error">{error}</div>}
      
      {isLoading ? (
        <div className="tag-loading">読み込み中...</div>
      ) : (
        <div className="tag-list">
          {Object.entries(tags).map(([tagName, tagData]) => (
            <div 
              key={tagName} 
              className="tag-item"
              style={{ backgroundColor: tagData.color }}
              onClick={() => handleTagClick(tagName)}
            >
              <span className="tag-name">{tagName}</span>
              <button 
                className="tag-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTag(tagName);
                }}
                aria-label={`${tagName}を削除`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      {isAdding ? (
        <form className="tag-form" onSubmit={handleAddTag}>
          <div className="form-group">
            <label htmlFor="tagName">タグ名</label>
            <input
              id="tagName"
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="tagColor">色</label>
            <input
              id="tagColor"
              type="color"
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setIsAdding(false)}>キャンセル</button>
            <button type="submit">保存</button>
          </div>
        </form>
      ) : (
        <button 
          className="add-tag-btn"
          onClick={() => setIsAdding(true)}
        >
          新しいタグを追加
        </button>
      )}
    </div>
  );
};

export default TagManager;
