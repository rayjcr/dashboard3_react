import React, { memo } from 'react';
import { Spin } from 'antd';

/**
 * Loading component for page loading
 * Used as fallback for route-level lazy loading
 */
export const PageLoading: React.FC = memo(() => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      minHeight: 200,
    }}
  >
    <Spin size="large" />
  </div>
));

PageLoading.displayName = 'PageLoading';
