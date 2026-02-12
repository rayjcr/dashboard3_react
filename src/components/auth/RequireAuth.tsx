import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores';

/**
 * Route guard component that requires authentication
 * Redirects to login page if user is not authenticated
 */
export const RequireAuth: React.FC = () => {
  const { token } = useAuthStore();
  const location = useLocation();

  if (!token) {
    // Redirect to login while saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
