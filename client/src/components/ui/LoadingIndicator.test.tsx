import { render, screen } from '@testing-library/react';
import LoadingIndicator from './LoadingIndicator';

describe('LoadingIndicator', () => {
  it('renders with default props', () => {
    render(<LoadingIndicator />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    
    const container = screen.getByRole('status');
    expect(container).toHaveClass('loading-container');
    expect(container).not.toHaveClass('loading-fullscreen');
  });

  it('renders with custom message', () => {
    render(<LoadingIndicator message="データを処理中..." />);
    
    expect(screen.getByText('データを処理中...')).toBeInTheDocument();
  });

  it('renders with small size', () => {
    render(<LoadingIndicator size="small" />);
    
    const spinner = document.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('spinner-small');
  });

  it('renders with large size', () => {
    render(<LoadingIndicator size="large" />);
    
    const spinner = document.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('spinner-large');
  });

  it('renders in fullscreen mode', () => {
    render(<LoadingIndicator fullScreen />);
    
    const container = screen.getByRole('status');
    expect(container).toHaveClass('loading-fullscreen');
  });

  it('renders without message when message prop is empty', () => {
    render(<LoadingIndicator message="" />);
    
    expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    expect(document.querySelector('.loading-message')).not.toBeInTheDocument();
  });
});
