import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-copyright">
          TodoLog &copy; {currentYear}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
