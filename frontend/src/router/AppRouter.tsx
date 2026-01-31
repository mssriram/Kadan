/**
 * Application Router
 * 
 * Defines all routes for the Kadan application.
 * - Public routes: /login, /register
 * - Protected routes: /app/* (require authentication)
 */

import React from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Navigate,
  Outlet 
} from 'react-router-dom';
import { LoginPage, RegisterPage, DashboardPage, GroupDashboardPage } from '@/pages';
import { authService } from '@/services/authService';

/**
 * Check if user is authenticated.
 * Requires both token and user data to be present.
 */
const isAuthenticated = (): boolean => {
  return authService.isAuthenticated() && authService.getCurrentUser() !== null;
};

/**
 * Protected Route wrapper.
 * Redirects to login if user is not authenticated.
 */
const ProtectedRoute: React.FC = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

/**
 * Public Route wrapper.
 * Redirects to dashboard if user is already authenticated.
 */
const PublicRoute: React.FC = () => {
  if (isAuthenticated()) {
    return <Navigate to="/app/groups" replace />;
  }
  return <Outlet />;
};

/**
 * Main application router component.
 */
export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect - go to groups if authenticated, else login */}
        <Route path="/" element={
          isAuthenticated() ? <Navigate to="/app/groups" replace /> : <Navigate to="/login" replace />
        } />

        {/* Public routes (redirect if already logged in) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected routes (require authentication) */}
        <Route path="/app" element={<ProtectedRoute />}>
          <Route path="groups" element={<DashboardPage />} />
          {/* Group detail route */}
          <Route path="groups/:groupId" element={<GroupDashboardPage />} />
          {/* TODO: Add profile route */}
          <Route path="profile" element={<div>Profile Page (Coming Soon)</div>} />
        </Route>

        {/* Catch-all redirect - go to groups if authenticated, else login */}
        <Route path="*" element={
          isAuthenticated() ? <Navigate to="/app/groups" replace /> : <Navigate to="/login" replace />
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
