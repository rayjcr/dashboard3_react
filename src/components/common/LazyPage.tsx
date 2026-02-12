import { Suspense } from 'react';
import { PageLoading } from './PageLoading';

interface LazyPageProps {
  children: React.ReactNode;
}

/**
 * Container for wrapping lazy components
 * Provides unified loading fallback
 */
export const LazyPage: React.FC<LazyPageProps> = ({ children }) => (
  <Suspense fallback={<PageLoading />}>{children}</Suspense>
);
