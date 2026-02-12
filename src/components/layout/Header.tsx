import React from 'react';
import { Layout, Typography, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { AppBreadcrumb } from './AppBreadcrumb';
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useUIStore, useThemeStore } from '@/stores';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

export const Header: React.FC = () => {
  const { isMobile } = useBreakpoint();
  const { toggleDrawer } = useUIStore();
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme === 'dark';
  const primaryColor = isDark ? '#7c3aed' : '#1890ff';

  return (
    <AntHeader
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        background: '#ffffff',
        height: 64,
        borderBottom: '1px solid #f0f0f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Mobile: Hamburger menu */}
      {isMobile && (
        <Button
          type="text"
          icon={<MenuOutlined style={{ fontSize: 20 }} />}
          onClick={toggleDrawer}
          style={{ marginRight: 16 }}
        />
      )}

      {/* Logo */}
      <Title
        level={4}
        style={{
          margin: 0,
          color: primaryColor,
          whiteSpace: 'nowrap',
        }}
      >
        Citcon
      </Title>

      {/* Breadcrumb - hidden on mobile */}
      {!isMobile && <AppBreadcrumb />}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Theme Switcher */}
      <ThemeSwitcher />
    </AntHeader>
  );
};
