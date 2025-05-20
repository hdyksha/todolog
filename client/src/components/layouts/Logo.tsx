import React from 'react';
import './Logo.css';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', className = '' }) => {
  return (
    <div className={`logo logo-${size} ${className}`} data-testid="app-logo">
      <div className="logo-icon">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
          <circle cx="12" cy="7" r="1.5" fill="currentColor" />
        </svg>
      </div>
      <div className="logo-text">
        <span className="logo-text-todo">TODO</span>
        <span className="logo-text-log">LOG</span>
      </div>
    </div>
  );
};

export default Logo;
