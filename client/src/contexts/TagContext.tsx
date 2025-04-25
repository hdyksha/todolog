import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Tag } from '../types';
import { tagService } from '../services/tagService';

interface TagState {
  tags: Record<string, Tag>;
  loading: boolean;
  error: Error | null;
}

type TagAction =
  | { type: 'FETCH_TAGS_START' }
  | { type: 'FETCH_TAGS_SUCCESS'; payload: Record<string, Tag> }
  | { type: 'FETCH_TAGS_ERROR'; payload: Error }
  | { type: 'ADD_TAG_SUCCESS'; payload: { name: string; tag: Tag } }
  | { type: 'UPDATE_TAG_SUCCESS'; payload: { name: string; tag: Tag } }
  | { type: 'DELETE_TAG_SUCCESS'; payload: string };

const TagContext = createContext<
  { state: TagState; dispatch: React.Dispatch<TagAction> } | undefined
>(undefined);

const tagReducer = (state: TagState, action: TagAction): TagState => {
  switch (action.type) {
    case 'FETCH_TAGS_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_TAGS_SUCCESS':
      return { tags: action.payload, loading: false, error: null };
    case 'FETCH_TAGS_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_TAG_SUCCESS':
      return {
        ...state,
        tags: {
          ...state.tags,
          [action.payload.name]: action.payload.tag
        }
      };
    case 'UPDATE_TAG_SUCCESS':
      return {
        ...state,
        tags: {
          ...state.tags,
          [action.payload.name]: action.payload.tag
        }
      };
    case 'DELETE_TAG_SUCCESS':
      const { [action.payload]: _, ...remainingTags } = state.tags;
      return {
        ...state,
        tags: remainingTags
      };
    default:
      return state;
  }
};

export const TagProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tagReducer, {
    tags: {},
    loading: false,
    error: null
  });

  useEffect(() => {
    const fetchTags = async () => {
      dispatch({ type: 'FETCH_TAGS_START' });
      try {
        const tags = await tagService.getAllTags();
        dispatch({ type: 'FETCH_TAGS_SUCCESS', payload: tags });
      } catch (error) {
        dispatch({ 
          type: 'FETCH_TAGS_ERROR', 
          payload: error instanceof Error ? error : new Error('Failed to fetch tags') 
        });
      }
    };

    fetchTags();
  }, []);

  return (
    <TagContext.Provider value={{ state, dispatch }}>
      {children}
    </TagContext.Provider>
  );
};

export const useTagContext = () => {
  const context = useContext(TagContext);
  if (context === undefined) {
    throw new Error('useTagContext must be used within a TagProvider');
  }
  return context;
};
