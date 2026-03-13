import { lazy } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { RequireAuth, PublicOnly } from '@/components/auth';
import { LazyPage } from '@/components/common/LazyPage';

// Route-level lazy loading - load page components on demand
const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const AuthPage = lazy(() =>
  import('@/pages/AuthPage').then((m) => ({ default: m.AuthPage })),
);
const AuthCallbackPage = lazy(() =>
  import('@/pages/AuthCallbackPage').then((m) => ({
    default: m.AuthCallbackPage,
  })),
);
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const DailyDetailReportPage = lazy(() =>
  import('@/pages/DailyDetailReportPage').then((m) => ({
    default: m.DailyDetailReportPage,
  })),
);
const AllTransactionsPage = lazy(() =>
  import('@/pages/AllTransactionsPage').then((m) => ({
    default: m.AllTransactionsPage,
  })),
);
const AccountSettingsPage = lazy(() =>
  import('@/pages/AccountSettingsPage').then((m) => ({
    default: m.AccountSettingsPage,
  })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);
const LogoutPage = lazy(() =>
  import('@/pages/LogoutPage').then((m) => ({ default: m.LogoutPage })),
);

export const routes: RouteObject[] = [
  // SSO auth routes (no guard, handles its own redirect logic)
  {
    path: '/auth',
    element: (
      <LazyPage>
        <AuthPage />
      </LazyPage>
    ),
  },
  {
    path: '/auth-callback',
    element: (
      <LazyPage>
        <AuthCallbackPage />
      </LazyPage>
    ),
  },
  // Logout page (no guard, handles logout display)
  {
    path: '/logout',
    element: (
      <LazyPage>
        <LogoutPage />
      </LazyPage>
    ),
  },
  // Public routes (login page - for manual login)
  {
    element: <PublicOnly />,
    children: [
      {
        path: '/login',
        element: (
          <LazyPage>
            <LoginPage />
          </LazyPage>
        ),
      },
    ],
  },
  // Protected routes (require authentication)
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: (
              <LazyPage>
                <DashboardPage />
              </LazyPage>
            ),
          },
          {
            path: 'detail',
            element: (
              <LazyPage>
                <DailyDetailReportPage />
              </LazyPage>
            ),
          },
          {
            path: 'alltransactions',
            element: (
              <LazyPage>
                <AllTransactionsPage />
              </LazyPage>
            ),
          },
          {
            path: 'accountsettings',
            element: (
              <LazyPage>
                <AccountSettingsPage />
              </LazyPage>
            ),
          },
          {
            path: '*',
            element: (
              <LazyPage>
                <NotFoundPage />
              </LazyPage>
            ),
          },
        ],
      },
    ],
  },
];
