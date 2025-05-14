import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { useTagContext } from '../../contexts/TagContext';
import TagBadge from './TagBadge';
import './UnifiedTagInput.css';

interface UnifiedTagInputProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  onBlur?: () => void;
  singleTagMode?: boolean;
  inline?: boolean;
  className?: string;
  // 外部からタグを直接渡す場合（TaskFormTagInputの代替）
  availableTags?: Record<string, { color: string }>;
}

/**
 * 統一されたタグ入力コンポーネント
 * タスク作成/編集フォームとタスク詳細画面の両方で使用可能
 * 
 * 使用方法:
 * 1. 通常使用: TagContextからタグ情報を取得
 * 2. 外部タグ: availableTags={...} で外部からタグ情報を直接提供
 */
const UnifiedTagInput = forwardRef<HTMLInputElement, UnifiedTagInputProps>(({
  selectedTags,
  onChange,
  placeholder = 'タグを追加...',
  maxTags = Infinity,
  disabled = false,
  autoFocus = false,
  onBlur,
  singleTagMode = false,
  inline = false,
  className = '',
  availableTags: externalTags
}, ref) => {
  // 外部から渡されたタグがあればそれを使い、なければTagContextから取得
  const useExternalTags = !!externalTags;
  const tagContext = useTagContext();
  
  // データソースの選択: 外部タグまたはTagContext
  const { tags: contextTagMap, loading } = useExternalTags 
    ? { tags: externalTags, loading: false } 
    : tagContext.state;
  
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  const [isInputActive, setIsInputActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const suggestionItemsRef = useRef<Array<HTMLDivElement | null>>([]);

  // 外部から渡されたrefとinternalなrefを統合
  const setInputRefValue = (element: HTMLInputElement | null) => {
    // 内部のrefを設定
    inputRef.current = element;
    
    // 外部から渡されたrefがある場合は、それも設定
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLInputElement | null>).current = element;
    }
  };

  // 利用可能なタグを整形
  const availableTags = React.useMemo(() => {
    if ((loading) || !contextTagMap) return {};
    
    const formattedTags: Record<string, { color: string }> = {};
    Object.entries(contextTagMap).forEach(([tag, data]) => {
      if (typeof data === 'object' && data !== null) {
        formattedTags[tag] = { color: data.color || '#e0e0e0' };
      } else {
        // externalTagsの場合、既に{color: string}形式になっている可能性がある
        formattedTags[tag] = { color: '#e0e0e0' };
      }
    });
    return formattedTags;
  }, [contextTagMap, loading]);

  // 利用可能なタグから、すでに選択されているタグを除外したリストを作成
  const availableSuggestions = Object.keys(availableTags || {})
    .filter(tag => !selectedTags.includes(tag) && tag.toLowerCase().includes(inputValue.toLowerCase()))
    .sort((a, b) => {
      // 前方一致を優先
      const aStartsWith = a.toLowerCase().startsWith(inputValue.toLowerCase());
      const bStartsWith = b.toLowerCase().startsWith(inputValue.toLowerCase());
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return a.localeCompare(b);
    });

  // タグを追加する
  const addTag = (tag: string) => {
    if (disabled || !tag.trim()) return;
    
    if (!selectedTags.includes(tag.trim()) && selectedTags.length < maxTags) {
      if (singleTagMode) {
        onChange([tag.trim()]);
      } else {
        onChange([...selectedTags, tag.trim()]);
      }
      setInputValue('');
      setShowSuggestions(false);
      setFocusedSuggestionIndex(-1);
      inputRef.current?.focus();
    } else if (selectedTags.length >= maxTags) {
      // 最大タグ数に達した場合の視覚的フィードバック
      if (inputRef.current) {
        inputRef.current.classList.add('tag-input-error');
        setTimeout(() => {
          inputRef.current?.classList.remove('tag-input-error');
        }, 500);
      }
    }
  };

  // タグを削除する
  const removeTag = (tagToRemove: string) => {
    if (disabled) return;
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  // キーボードイベントの処理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    
    if (e.key === 'Enter' && inputValue && focusedSuggestionIndex === -1) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Enter' && focusedSuggestionIndex >= 0 && availableSuggestions[focusedSuggestionIndex]) {
      e.preventDefault();
      addTag(availableSuggestions[focusedSuggestionIndex]);
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setFocusedSuggestionIndex(-1);
      inputRef.current?.blur();
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      setFocusedSuggestionIndex(prev => 
        prev < availableSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault();
      setFocusedSuggestionIndex(prev => prev > 0 ? prev - 1 : 0);
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
        setFocusedSuggestionIndex(-1);
        setIsInputActive(false);
        if (onBlur) {
          onBlur();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onBlur]);

  // フォーカスされた候補にスクロール
  useEffect(() => {
    if (focusedSuggestionIndex >= 0 && suggestionItemsRef.current[focusedSuggestionIndex]) {
      const element = suggestionItemsRef.current[focusedSuggestionIndex];
      if (element && typeof element.scrollIntoView === 'function') {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [focusedSuggestionIndex]);

  // 候補リストの参照を更新
  useEffect(() => {
    suggestionItemsRef.current = suggestionItemsRef.current.slice(0, availableSuggestions.length);
  }, [availableSuggestions]);

  // autoFocusが有効な場合、マウント時にフォーカスを当てる
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      setIsInputActive(true);
    }
  }, [autoFocus]);

  // インラインモードの場合のレンダリング
  if (inline) {
    return (
      <div className={`unified-tag-input-inline ${className}`}>
        <div className="tags-display-inline">
          {selectedTags.length > 0 ? (
            selectedTags.map(tag => (
              <TagBadge
                key={tag}
                tag={tag}
                color={contextTagMap && contextTagMap[tag] ? contextTagMap[tag].color : undefined}
                removable={!disabled}
                onRemove={() => removeTag(tag)}
              />
            ))
          ) : (
            <span className="no-tags">タグなし</span>
          )}
          
          {isInputActive ? (
            <div className="inline-tag-input">
              <input
                ref={setInputRefValue}
                type="text"
                className="tag-input"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setShowSuggestions(true);
                  setFocusedSuggestionIndex(-1);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                autoFocus
              />
              {showSuggestions && availableSuggestions.length > 0 && (
                <div className="tag-suggestions" ref={suggestionsRef} role="listbox">
                  {availableSuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion}
                      ref={el => suggestionItemsRef.current[index] = el}
                      className={`tag-suggestion-item ${focusedSuggestionIndex === index ? 'focused' : ''}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      style={{
                        borderLeftColor: contextTagMap && contextTagMap[suggestion] ? contextTagMap[suggestion].color : undefined
                      }}
                      role="option"
                      aria-selected={focusedSuggestionIndex === index}
                      tabIndex={-1}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button 
              className="add-tag-button" 
              onClick={() => {
                setIsInputActive(true);
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              aria-label="タグを追加"
              disabled={disabled}
            >
              + タグを追加
            </button>
          )}
        </div>
      </div>
    );
  }

  // 通常モードのレンダリング
  return (
    <div className={`unified-tag-input ${disabled ? 'tag-input-disabled' : ''} ${singleTagMode ? 'single-tag-mode' : ''} ${className}`}>
      {!singleTagMode && (
        <div className="selected-tags">
          {selectedTags.map(tag => (
            <TagBadge
              key={tag}
              tag={tag}
              color={contextTagMap && contextTagMap[tag] ? contextTagMap[tag].color : undefined}
              removable={!disabled}
              onRemove={() => removeTag(tag)}
            />
          ))}
        </div>
      )}
      {(!maxTags || selectedTags.length < maxTags || (singleTagMode && selectedTags.length <= 1)) && !disabled && (
        <div className="tag-input-wrapper">
          <input
            ref={setInputRefValue}
            type="text"
            className="tag-input"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
              setFocusedSuggestionIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // 少し遅延させてサジェストのクリックを処理できるようにする
              setTimeout(() => {
                if (onBlur) {
                  onBlur();
                }
              }, 200);
            }}
            onKeyDown={handleKeyDown}
            placeholder={selectedTags.length === 0 || singleTagMode ? placeholder : ''}
            aria-label="タグを追加"
          />
          {showSuggestions && availableSuggestions.length > 0 && (
            <div className="tag-suggestions" ref={suggestionsRef} role="listbox">
              {availableSuggestions.map((suggestion, index) => (
                <div
                  key={suggestion}
                  ref={el => suggestionItemsRef.current[index] = el}
                  className={`tag-suggestion-item ${focusedSuggestionIndex === index ? 'focused' : ''}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
                    borderLeftColor: contextTagMap && contextTagMap[suggestion] ? contextTagMap[suggestion].color : undefined
                  }}
                  role="option"
                  aria-selected={focusedSuggestionIndex === index}
                  tabIndex={-1}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default UnifiedTagInput;
