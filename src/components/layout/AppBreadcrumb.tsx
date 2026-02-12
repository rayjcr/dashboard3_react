import React, { memo } from 'react';
import { Breadcrumb } from 'antd';
import { useLocation, Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

// Route path to label mapping
const routeLabels: Record<string, string> = {
  '': 'Home',
  dashboard: 'Dashboard',
  transactions: 'Transactions',
  search: 'Search',
  settings: 'Settings',
  account: 'Account',
  profile: 'Profile',
};

/**
 * Breadcrumb component that generates breadcrumb items from current route
 */
export const AppBreadcrumb: React.FC = memo(() => {
  const location = useLocation();

  // Split pathname into segments
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Build breadcrumb items
  const items = [
    {
      key: 'home',
      title: (
        <Link to="/">
          <HomeOutlined />
        </Link>
      ),
    },
    ...pathSegments.map((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const label =
        routeLabels[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1);
      const isLast = index === pathSegments.length - 1;

      return {
        key: path,
        title: isLast ? label : <Link to={path}>{label}</Link>,
      };
    }),
  ];

  return (
    <Breadcrumb
      items={items}
      style={{
        marginLeft: 24,
      }}
    />
  );
});

AppBreadcrumb.displayName = 'AppBreadcrumb';
