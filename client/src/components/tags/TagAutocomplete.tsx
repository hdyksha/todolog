import React, { useState, useEffect, useRef } from 'react';
import Input from '../ui/Input';
import './TagAutocomplete.css';

interface TagAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (tag: string) => void;
  availableTags: string[];
  placeholder?: string;
}

const TagAutocomplete: React.FC<TagAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  availableTags,
  placeholder = 'タグを入力...'
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  // 入力値が変更されたときに候補をフィルタリング
  useEffect(() => {
    if (value.trim() === '') {
      setFilteredSuggestions([]);
      return;
    }

    const filtered = availableTags.filter(
      tag => tag.toLowerCase().includes(value.toLowerCase()) && !tag.toLowerCase().startsWith(value.toLowerCase())
    );
    
    const exactMatches = availableTags.filter(
      tag => tag.toLowerCase().startsWith(value.toLowerCase())
    );
    
    // 前方一致を優先して表示
    setFilteredSuggestions([...exactMatches, ...filtered]);
    setActiveSuggestionIndex(0);
  }, [value, availableTags]);

  // キーボード操作の処理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter: 選択した候補を確定
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showSuggestions && filteredSuggestions.length > 0) {
        onSelect(filteredSuggestions[activeSuggestionIndex]);
        setShowSuggestions(false);
      } else if (value.trim()) {
        onSelect(value.trim());
      }
    }
    // Escape: 候補を閉じる
    else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
    // 上矢印: 前の候補に移動
    else if (e.key === 'ArrowUp') {
      if (showSuggestions) {
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev === 0 ? filteredSuggestions.length - 1 : prev - 1
        );
      }
    }
    // 下矢印: 次の候補に移動
    else if (e.key === 'ArrowDown') {
      if (showSuggestions) {
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev === filteredSuggestions.length - 1 ? 0 : prev + 1
        );
      }
    }
  };

  // 候補をクリックして選択
  const handleSuggestionClick = (suggestion: string) => {
    onSelect(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="tag-autocomplete">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => {
          // 少し遅延させて、候補クリックが処理されるようにする
          setTimeout(() => setShowSuggestions(false), 200);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
      />
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul 
          ref={suggestionsRef}
          className="tag-suggestions"
          role="listbox"
          aria-label="タグの候補"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              className={`tag-suggestion ${index === activeSuggestionIndex ? 'active' : ''}`}
              onClick={() => handleSuggestionClick(suggestion)}
              role="option"
              aria-selected={index === activeSuggestionIndex}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TagAutocomplete;
