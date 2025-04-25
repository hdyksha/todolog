import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TagBadge from './TagBadge';

describe('TagBadge Component', () => {
  test('renders with default props', () => {
    render(<TagBadge tag="テスト" />);
    
    const badge = screen.getByText('テスト');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('tag-badge');
    expect(badge).toHaveClass('tag-badge-medium');
  });

  test('renders with custom size', () => {
    render(<TagBadge tag="テスト" size="large" />);
    
    const badge = screen.getByText('テスト');
    expect(badge).toHaveClass('tag-badge-large');
  });

  test('renders with custom color', () => {
    const color = '#ff0000';
    render(<TagBadge tag="テスト" color={color} />);
    
    const badge = screen.getByText('テスト');
    expect(badge).toHaveStyle(`background-color: ${color}`);
  });

  test('renders with clickable functionality', () => {
    const handleClick = vi.fn();
    render(<TagBadge tag="テスト" onClick={handleClick} />);
    
    const badge = screen.getByText('テスト');
    expect(badge).toHaveClass('tag-badge-clickable');
    expect(badge).toHaveAttribute('role', 'button');
    expect(badge).toHaveAttribute('tabIndex', '0');
    
    fireEvent.click(badge);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('renders with custom className', () => {
    render(<TagBadge tag="テスト" className="custom-class" />);
    
    const badge = screen.getByText('テスト');
    expect(badge).toHaveClass('custom-class');
  });

  test('renders with isNew prop', () => {
    render(<TagBadge tag="テスト" isNew />);
    
    const badge = screen.getByText('テスト');
    expect(badge).toHaveClass('tag-badge-new');
  });

  test('has correct aria-label', () => {
    render(<TagBadge tag="テスト" />);
    
    const badge = screen.getByText('テスト');
    expect(badge).toHaveAttribute('aria-label', 'タグ: テスト');
  });

  test('has correct aria-label when clickable', () => {
    render(<TagBadge tag="テスト" onClick={() => {}} />);
    
    const badge = screen.getByText('テスト');
    expect(badge).toHaveAttribute('aria-label', 'タグ: テスト（クリックで選択）');
  });

  test('generates consistent color from tag name', () => {
    const { rerender } = render(<TagBadge tag="テスト" />);
    const firstBadge = screen.getByText('テスト');
    const firstStyle = window.getComputedStyle(firstBadge).backgroundColor;
    
    rerender(<TagBadge tag="テスト" />);
    const secondBadge = screen.getByText('テスト');
    const secondStyle = window.getComputedStyle(secondBadge).backgroundColor;
    
    expect(firstStyle).toBe(secondStyle);
  });
});
