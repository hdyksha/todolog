import React, { useState, useRef, useEffect } from 'react';
import './TagInput.css';

interface TagInputProps {
  selectedTags: string[];
  availableTags: { [key: string]: { color: string } };
  onChange: (tags: string[]) => void;
}

const TagInput: React.FC<TagInputProps> = ({ selectedTags, availableTags, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 利用可能なタグから、すでに選択されているタグを除外したリストを作成
  const availableSuggestions = Object.keys(availableTags || {}).filter(
    tag => !selectedTags.includes(tag) && tag.toLowerCase().includes(inputValue.toLowerCase())
  );

  // タグを追加する
  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      onChange([...selectedTags, tag]);
    }
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // タグを削除する
  const removeTag = (tagToRemove: string) => {
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  // キーボードイベントの処理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // 候補をクリックしたときの処理
  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
  };

  // 外部クリックでサジェストを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
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
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="タグを追加..."
          aria-label="タグを追加"
        />
        {showSuggestions && availableSuggestions.length > 0 && (
          <div className="tag-suggestions" ref={suggestionsRef}>
            {availableSuggestions.map(suggestion => (
              <div
                key={suggestion}
                className="tag-suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  backgroundColor: availableTags[suggestion]?.color || '#e0e0e0'
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
