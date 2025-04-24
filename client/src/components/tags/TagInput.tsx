import React, { useState, useEffect, useRef } from 'react';
import { Tag } from '../../types';
import './TagInput.css';

interface TagInputProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  availableTags: Record<string, Tag>;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  selectedTags,
  onChange,
  availableTags,
  placeholder = 'タグを追加...'
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 利用可能なタグから、すでに選択されているタグを除外
  const availableTagNames = Object.keys(availableTags).filter(
    tag => !selectedTags.includes(tag)
  );

  // 入力値に基づいてフィルタリングされたタグ候補
  const filteredSuggestions = inputValue
    ? availableTagNames.filter(tag =>
        tag.toLowerCase().includes(inputValue.toLowerCase())
      )
    : availableTagNames;

  // タグを追加
  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      onChange([...selectedTags, tag]);
    }
    setInputValue('');
  };

  // 新しいタグを作成して追加
  const createAndAddTag = (tagName: string) => {
    if (tagName.trim() && !selectedTags.includes(tagName.trim())) {
      onChange([...selectedTags, tagName.trim()]);
    }
    setInputValue('');
  };

  // タグを削除
  const removeTag = (tagToRemove: string) => {
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  // 候補からタグを選択
  const selectSuggestion = (suggestion: string) => {
    addTag(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // クリックイベントのハンドラ（候補リストの外側をクリックしたら閉じる）
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current !== event.target
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="tag-input-container">
      <div className="selected-tags">
        {selectedTags.map(tag => (
          <div
            key={tag}
            className="tag-item"
            style={{
              backgroundColor: availableTags[tag]?.color || '#e0e0e0'
            }}
          >
            <span className="tag-text">{tag}</span>
            <button
              type="button"
              className="tag-remove"
              onClick={() => removeTag(tag)}
              aria-label={`${tag}を削除`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="tag-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="tag-input"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (inputValue) {
                // 既存のタグと一致する場合はそれを追加
                const exactMatch = availableTagNames.find(
                  tag => tag.toLowerCase() === inputValue.toLowerCase()
                );
                if (exactMatch) {
                  addTag(exactMatch);
                } else {
                  // 一致するものがなければ新しいタグとして追加
                  createAndAddTag(inputValue);
                }
              }
            } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
              removeTag(selectedTags[selectedTags.length - 1]);
            }
          }}
          placeholder={selectedTags.length === 0 ? placeholder : ''}
        />

        {showSuggestions && filteredSuggestions.length > 0 && (
          <div ref={suggestionsRef} className="tag-suggestions">
            {filteredSuggestions.map(suggestion => (
              <div
                key={suggestion}
                className="tag-suggestion-item"
                onClick={() => selectSuggestion(suggestion)}
                style={{
                  borderLeft: `4px solid ${availableTags[suggestion]?.color || '#e0e0e0'}`
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagInput;
