import React from 'react';
import { Layout, Button, Divider, ConfigProvider } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useUIStore, useThemeStore } from '@/stores';
import { TreeMenu } from './TreeMenu';
import { UserMenu } from './UserMenu';
import { getTheme } from '@/types/theme';

const { Sider } = Layout;

interface SidebarProps {
  /**
   * Whether this is rendered inside a Drawer (mobile mode)
   * When true, we don't use Sider component
   */
  inDrawer?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ inDrawer = false }) => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { currentTheme } = useThemeStore();
  const theme = getTheme(currentTheme);

  // In drawer mode, always show expanded
  const collapsed = inDrawer ? false : sidebarCollapsed;
  const isDark = currentTheme === 'dark';

  // Use different primary color for sidebar based on theme
  const sidebarPrimaryColor = isDark ? '#7c3aed' : '#1890ff';

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Scrollable area for TreeMenu + UserMenu */}
      <div
        className="sidebar-content"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
          padding: '8px 0',
        }}
      >
        {/* TreeMenu - Dynamic hierarchy menu */}
        <TreeMenu collapsed={collapsed} />

        {/* Divider */}
        <Divider
          style={{
            margin: '8px 0',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#f0f0f0',
          }}
        />

        {/* UserMenu - Static menu items */}
        <UserMenu collapsed={collapsed} />
      </div>

      {/* Collapse button - hidden in drawer mode */}
      {!inDrawer && (
        <div
          style={{
            padding: '12px 16px',
            borderTop: `1px solid ${
              isDark ? 'rgba(255,255,255,0.1)' : '#f0f0f0'
            }`,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Button
            type="text"
            onClick={toggleSidebar}
            style={{
              width: collapsed ? 'auto' : '100%',
              color: theme.colors.sidebarText,
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 8,
            }}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          >
            {!collapsed && 'Collapse'}
          </Button>
        </div>
      )}
    </div>
  );

  // If inside drawer, just return the content
  if (inDrawer) {
    return (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: sidebarPrimaryColor,
          },
        }}
      >
        <div
          style={{
            height: '100%',
            background: theme.colors.sidebarBg,
          }}
        >
          {content}
        </div>
      </ConfigProvider>
    );
  }

  // Desktop mode - use Sider
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: sidebarPrimaryColor,
        },
      }}
    >
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={256}
        collapsedWidth={80}
        theme={isDark ? 'dark' : 'light'}
        style={{
          overflow: 'hidden',
          height: 'calc(100vh - 64px)',
          position: 'sticky',
          top: 64,
          left: 0,
          transition: 'width 0.2s, background 0.3s',
          background: theme.colors.sidebarBg,
          borderRight: isDark ? 'none' : '1px solid #f0f0f0',
        }}
      >
        {content}
      </Sider>
    </ConfigProvider>
  );
};
