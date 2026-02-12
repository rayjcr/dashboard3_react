import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores';

/**
 * Route guard for public-only pages (like login)
 * Redirects to home page if user is already authenticated
 */
export const PublicOnly: React.FC = () => {
  const { token } = useAuthStore();

  if (token) {
    // User is already logged in, redirect to dashboard
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
