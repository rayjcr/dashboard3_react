import React, { useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout as AntLayout, Drawer } from 'antd';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useIdleTimeout } from '@/hooks/useIdleTimeout';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useAuthStore, useUIStore, useThemeStore } from '@/stores';
import { getTheme } from '@/types/theme';

const { Content } = AntLayout;

// 20 minutes in milliseconds
const IDLE_TIMEOUT = 20 * 60 * 1000;

export const Layout: React.FC = () => {
  const { token, logout } = useAuthStore();
  const { sidebarDrawerOpen, setDrawerOpen } = useUIStore();
  const { currentTheme } = useThemeStore();
  const theme = getTheme(currentTheme);
  const { isMobile } = useBreakpoint();
  const isLoggedIn = !!token;

  const handleIdle = useCallback(() => {
    if (isLoggedIn) {
      logout();
    }
  }, [isLoggedIn, logout]);

  // Only activate idle timeout when user is logged in
  useIdleTimeout({
    timeout: IDLE_TIMEOUT,
    onIdle: handleIdle,
    enabled: isLoggedIn,
  });

  // Close drawer when switching from mobile to desktop
  useEffect(() => {
    if (!isMobile && sidebarDrawerOpen) {
      setDrawerOpen(false);
    }
  }, [isMobile, sidebarDrawerOpen, setDrawerOpen]);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
  }, [setDrawerOpen]);

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header />
      <AntLayout>
        {/* Desktop/Tablet: Show Sidebar normally */}
        {!isMobile && <Sidebar />}

        {/* Mobile: Show Sidebar in Drawer */}
        {isMobile && (
          <Drawer
            placement="left"
            open={sidebarDrawerOpen}
            onClose={handleDrawerClose}
            width={280}
            styles={{
              body: { padding: 0, background: theme.colors.sidebarBg },
              header: { display: 'none' },
            }}
          >
            <Sidebar inDrawer />
          </Drawer>
        )}

        <AntLayout>
          <Content
            style={{
              margin: 0,
              padding: '8px 4px',
              minHeight: 280,
              background: '#f5f5f5',
            }}
          >
            <Outlet />
          </Content>
          <Footer />
        </AntLayout>
      </AntLayout>
    </AntLayout>
  );
};
