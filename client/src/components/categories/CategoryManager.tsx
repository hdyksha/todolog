import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import Button from '../ui/Button';
import Input from '../ui/Input';
import CategoryBadge from './CategoryBadge';
import './CategoryManager.css';

interface CategoryManagerProps {
  onSelectCategory?: (category: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // カテゴリ一覧の取得
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const fetchedCategories = await apiClient.fetchCategories();
        setCategories(fetchedCategories);
        setError(null);
      } catch (err) {
        setError('カテゴリの取得に失敗しました');
        console.error('カテゴリ取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // カテゴリの選択
  const handleCategoryClick = (category: string) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

  // 新しいカテゴリの追加（この機能はバックエンドAPIに依存）
  // 注: 現在のバックエンドAPIにはカテゴリ追加のエンドポイントがないため、
  // この機能は実際には動作しません。将来的な拡張のためのUIのみ実装しています。
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    // 重複チェック
    if (categories.includes(newCategory.trim())) {
      setError('同じ名前のカテゴリが既に存在します');
      return;
    }

    // 仮実装: 実際にはAPIを呼び出してカテゴリを追加する
    setCategories([...categories, newCategory.trim()]);
    setNewCategory('');
    setError(null);
  };

  return (
    <div className="category-manager">
      <h3 className="category-manager-title">カテゴリ管理</h3>
      
      {loading ? (
        <div className="category-loading">読み込み中...</div>
      ) : error ? (
        <div className="category-error">{error}</div>
      ) : (
        <>
          <div className="category-list">
            {categories.length === 0 ? (
              <div className="category-empty">カテゴリがありません</div>
            ) : (
              categories.map((category) => (
                <CategoryBadge
                  key={category}
                  category={category}
                  onClick={() => handleCategoryClick(category)}
                  className="category-item"
                />
              ))
            )}
          </div>
          
          <form className="category-form" onSubmit={handleAddCategory}>
            <Input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="新しいカテゴリ名"
              fullWidth
            />
            <Button type="submit" variant="secondary" size="small">
              追加
            </Button>
          </form>
        </>
      )}
    </div>
  );
};

export default CategoryManager;
