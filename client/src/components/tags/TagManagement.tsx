import React, { useState, useEffect } from 'react';
import { useTagContext } from '../../contexts/TagContext';
import { tagService } from '../../services/tagService';
import { Tag } from '../../types';
import './TagManagement.css';

const TagManagement: React.FC = () => {
  const { state, dispatch } = useTagContext();
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#4a90e2');
  const [tagDescription, setTagDescription] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [tagUsage, setTagUsage] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // タグの使用状況を取得
  useEffect(() => {
    const fetchTagUsage = async () => {
      try {
        const usage = await tagService.getTagUsage();
        setTagUsage(usage);
      } catch (error) {
        console.error('タグの使用状況の取得に失敗しました', error);
        setError('タグの使用状況の取得に失敗しました');
      }
    };

    fetchTagUsage();
  }, [state.tags]);

  // タグの作成または更新
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tagName.trim()) {
      setError('タグ名を入力してください');
      return;
    }

    setIsLoading(true);
    setError(null);

    const tagData: Tag = {
      color: tagColor,
      description: tagDescription.trim() || undefined
    };

    try {
      if (editingTag) {
        // タグの更新
        const updatedTag = await tagService.updateTag(editingTag, tagData);
        dispatch({
          type: 'UPDATE_TAG_SUCCESS',
          payload: { name: editingTag, tag: updatedTag }
        });
        setEditingTag(null);
      } else {
        // 新しいタグの作成
        const newTag = await tagService.createTag(tagName, tagData);
        dispatch({
          type: 'ADD_TAG_SUCCESS',
          payload: { name: tagName, tag: newTag }
        });
      }

      // フォームをリセット
      setTagName('');
      setTagColor('#4a90e2');
      setTagDescription('');
    } catch (error) {
      console.error('タグの保存に失敗しました', error);
      setError('タグの保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // タグの編集を開始
  const handleEdit = (name: string) => {
    const tag = state.tags[name];
    setTagName(name);
    setTagColor(tag.color);
    setTagDescription(tag.description || '');
    setEditingTag(name);
  };

  // タグの削除
  const handleDelete = async (name: string) => {
    // タグが使用されている場合は削除できない
    if (tagUsage[name] > 0) {
      setError(`このタグは${tagUsage[name]}個のタスクで使用されているため削除できません`);
      return;
    }

    if (!window.confirm(`タグ "${name}" を削除してもよろしいですか？`)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await tagService.deleteTag(name);
      dispatch({ type: 'DELETE_TAG_SUCCESS', payload: name });
    } catch (error) {
      console.error('タグの削除に失敗しました', error);
      setError('タグの削除に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 編集をキャンセル
  const handleCancel = () => {
    setTagName('');
    setTagColor('#4a90e2');
    setTagDescription('');
    setEditingTag(null);
    setError(null);
  };

  return (
    <div className="tag-management">
      <div className="tag-form-container">
        <h2>{editingTag ? 'タグを編集' : '新しいタグを作成'}</h2>
        
        {error && <div className="tag-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="tag-form">
          <div className="form-group">
            <label htmlFor="tagName">タグ名</label>
            <input
              id="tagName"
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              disabled={!!editingTag || isLoading}
              placeholder="タグ名を入力"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="tagColor">色</label>
            <div className="color-picker">
              <input
                id="tagColor"
                type="color"
                value={tagColor}
                onChange={(e) => setTagColor(e.target.value)}
                disabled={isLoading}
              />
              <span className="color-value">{tagColor}</span>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="tagDescription">説明（オプション）</label>
            <textarea
              id="tagDescription"
              value={tagDescription}
              onChange={(e) => setTagDescription(e.target.value)}
              disabled={isLoading}
              placeholder="タグの説明を入力"
              rows={3}
            />
          </div>
          
          <div className="form-actions">
            <button
              type="submit"
              className="button button--primary"
              disabled={isLoading || !tagName.trim()}
            >
              {isLoading ? '保存中...' : editingTag ? '更新' : '作成'}
            </button>
            
            {editingTag && (
              <button
                type="button"
                className="button button--secondary"
                onClick={handleCancel}
                disabled={isLoading}
              >
                キャンセル
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="tag-list-container">
        <h2>タグ一覧</h2>
        
        {state.loading ? (
          <div className="loading">タグを読み込み中...</div>
        ) : state.error ? (
          <div className="tag-error">タグの読み込みに失敗しました</div>
        ) : Object.keys(state.tags).length === 0 ? (
          <div className="empty-state">タグがありません</div>
        ) : (
          <ul className="tag-list">
            {Object.entries(state.tags).map(([name, tag]) => (
              <li key={name} className="tag-item">
                <div className="tag-info">
                  <div className="tag-color" style={{ backgroundColor: tag.color }}></div>
                  <div className="tag-details">
                    <div className="tag-name">{name}</div>
                    {tag.description && <div className="tag-description">{tag.description}</div>}
                    <div className="tag-usage">
                      使用中: {tagUsage[name] || 0} タスク
                    </div>
                  </div>
                </div>
                
                <div className="tag-actions">
                  <button
                    className="button button--icon"
                    onClick={() => handleEdit(name)}
                    disabled={isLoading}
                    title="編集"
                  >
                    ✏️
                  </button>
                  <button
                    className="button button--icon"
                    onClick={() => handleDelete(name)}
                    disabled={isLoading || (tagUsage[name] > 0)}
                    title={tagUsage[name] > 0 ? "使用中のタグは削除できません" : "削除"}
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TagManagement;
