/**
 * Application Entry Point
 * 
 * Initializes React and mounts the App component.
 * Imports global styles including design tokens.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import global styles (includes tokens.css)
import './styles/global.css';

// Mount the application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
