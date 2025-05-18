import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { useTagContext } from '../../contexts/TagContext';
import TagBadge from './TagBadge';
import { mergeTagSources } from '../../utils/tagUtils';
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
  // TagContextからタグ情報を取得
  const { state: { tags: contextTags, loading } } = useTagContext();
  
  // 利用可能なタグ情報をマージ（優先順位: 1. TagContext, 2. 外部タグ）
  const availableTags = React.useMemo(() => {
    return mergeTagSources(contextTags, externalTags);
  }, [contextTags, externalTags]);
  
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
    if (!tag.trim() || selectedTags.includes(tag) || selectedTags.length >= maxTags) {
      return;
    }
    
    // シングルタグモードの場合は既存のタグを置き換え
    const newTags = singleTagMode ? [tag] : [...selectedTags, tag];
    onChange(newTags);
    setInputValue('');
    setShowSuggestions(false);
    setFocusedSuggestionIndex(-1);
    
    // 入力フィールドにフォーカスを戻す
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // タグを削除する
  const removeTag = (tag: string) => {
    const newTags = selectedTags.filter(t => t !== tag);
    onChange(newTags);
  };

  // 入力フィールドのキーダウンイベントハンドラー
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      
      // サジェストが表示されていて、フォーカスされているアイテムがある場合
      if (showSuggestions && focusedSuggestionIndex >= 0 && focusedSuggestionIndex < availableSuggestions.length) {
        addTag(availableSuggestions[focusedSuggestionIndex]);
      } else {
        // 入力値をそのまま追加
        addTag(inputValue.trim());
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // 入力が空で、Backspaceキーが押された場合、最後のタグを削除
      removeTag(selectedTags[selectedTags.length - 1]);
    } else if (e.key === 'Escape') {
      // Escapeキーでサジェストを閉じる
      setShowSuggestions(false);
      setFocusedSuggestionIndex(-1);
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      // 下矢印キーでサジェストの次のアイテムにフォーカス
      e.preventDefault();
      setFocusedSuggestionIndex(prev => 
        prev < availableSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      // 上矢印キーでサジェストの前のアイテムにフォーカス
      e.preventDefault();
      setFocusedSuggestionIndex(prev => prev > 0 ? prev - 1 : 0);
    }
  };

  // サジェストアイテムのクリックハンドラー
  const handleSuggestionClick = (tag: string) => {
    addTag(tag);
  };

  // 入力フィールドの変更ハンドラー
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // 入力があればサジェストを表示
    if (value.trim()) {
      setShowSuggestions(true);
      setFocusedSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
    }
  };

  // 入力フィールドのフォーカスハンドラー
  const handleInputFocus = () => {
    // フォーカス時に常にサジェストを表示する（入力値の有無に関わらず）
    setShowSuggestions(true);
  };

  // 外部クリックでサジェストを閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
        
        // onBlurが指定されていれば呼び出す
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

  // インラインモードの場合
  if (inline) {
    return (
      <div className={`unified-tag-input inline-tag-input ${className}`}>
        <div className="selected-tags">
          {selectedTags.length > 0 ? (
            selectedTags.map(tag => (
              <TagBadge
                key={tag}
                tag={tag}
                color={availableTags[tag]?.color}
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
                  handleInputChange(e);
                }}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                onBlur={() => {
                  // 少し遅延させてクリックイベントが先に処理されるようにする
                  setTimeout(() => {
                    setIsInputActive(false);
                    if (onBlur) onBlur();
                  }, 200);
                }}
                placeholder=""
                autoFocus
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
                        borderLeftColor: availableTags[suggestion]?.color
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
              className="add-tag-inline-button"
              onClick={() => setIsInputActive(true)}
              disabled={disabled || (maxTags && selectedTags.length >= maxTags)}
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
              color={availableTags[tag]?.color}
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
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
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
                    borderLeftColor: availableTags[suggestion]?.color
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
