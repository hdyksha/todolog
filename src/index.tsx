import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AppProvider } from './contexts/AppContext';
import { ErrorProvider } from './contexts/ErrorContext';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ErrorProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorProvider>
  </React.StrictMode>
);
