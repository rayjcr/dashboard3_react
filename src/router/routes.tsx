import { lazy } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { RequireAuth, PublicOnly } from '@/components/auth';
import { LazyPage } from '@/components/common/LazyPage';

// Route-level lazy loading - load page components on demand
const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
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

export const routes: RouteObject[] = [
  // Public routes (login, forgot-password, etc.)
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
