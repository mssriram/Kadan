/**
 * App Component
 * 
 * Root component that sets up the application.
 * Includes global styles and the router.
 */

import React from 'react';
import { AppRouter } from '@/router';

/**
 * Main App component.
 * Wraps the application with providers and global configuration.
 */
const App: React.FC = () => {
  return <AppRouter />;
};

export default App;
