import React, { useCallback, useMemo } from 'react';
import { Menu, App } from 'antd';
import type { MenuProps } from 'antd';
import {
  SearchOutlined,
  SettingOutlined,
  SafetyOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, useThemeStore, useUIStore } from '@/stores';
import { USER_MENU_ITEMS } from '@/config/userMenu';

interface UserMenuProps {
  /**
   * Whether the sidebar is collapsed
   */
  collapsed?: boolean;
}

/**
 * Map icon name to React component
 */
const iconMap: Record<string, React.ReactNode> = {
  SearchOutlined: <SearchOutlined />,
  SettingOutlined: <SettingOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  QuestionCircleOutlined: <QuestionCircleOutlined />,
  LogoutOutlined: <LogoutOutlined />,
};

/**
 * Get icon component by name
 */
function getIcon(iconName: string): React.ReactNode {
  return iconMap[iconName] || null;
}

export const UserMenu: React.FC<UserMenuProps> = ({ collapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const { currentTheme } = useThemeStore();
  const { setSelectedNode } = useUIStore();
  const { message } = App.useApp();
  const isDark = currentTheme === 'dark';

  // Convert USER_MENU_ITEMS to Ant Design Menu items
  const menuItems: MenuProps['items'] = useMemo(() => {
    return USER_MENU_ITEMS.map((item) => ({
      key: item.key,
      icon: getIcon(item.icon),
      label: item.label,
    }));
  }, []);

  // Get current selected key based on location
  const selectedKeys = useMemo(() => {
    const currentPath = location.pathname;
    const matchedItem = USER_MENU_ITEMS.find(
      (item) => item.path && currentPath.startsWith(item.path),
    );
    return matchedItem ? [matchedItem.key] : [];
  }, [location.pathname]);

  // Handle menu item click
  const handleClick = useCallback(
    ({ key }: { key: string }) => {
      const item = USER_MENU_ITEMS.find((i) => i.key === key);
      if (!item) return;

      // Clear TreeMenu selection when clicking static menu items
      setSelectedNode(null);

      // Handle special action
      if (item.action === 'logout') {
        logout();
        message.success('Logged out successfully');
        navigate('/login');
        return;
      }

      // Handle external link (with security: noopener,noreferrer prevents tabnabbing attacks)
      if (item.href) {
        window.open(item.href, item.target || '_blank', 'noopener,noreferrer');
        return;
      }

      // Handle internal route
      if (item.path) {
        navigate(item.path);
      }
    },
    [logout, navigate, message, setSelectedNode],
  );

  return (
    <Menu
      mode="inline"
      selectedKeys={selectedKeys}
      onClick={handleClick}
      items={menuItems}
      inlineCollapsed={collapsed}
      theme={isDark ? 'dark' : 'light'}
      style={{
        border: 'none',
        background: 'transparent',
      }}
    />
  );
};
