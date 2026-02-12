import { useEffect } from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { AppRouter } from '@/router';
import { useThemeStore } from '@/stores';
import './styles/index.css';

export const App: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme === 'dark';

  // Primary color based on theme: purple for dark, blue for light
  const primaryColor = isDark ? '#7c3aed' : '#1890ff';

  // Set data-theme attribute on document element for sidebar styling
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryColor,
          borderRadius: 6,
        },
      }}
    >
      <AntdApp>
        <AppRouter />
      </AntdApp>
    </ConfigProvider>
  );
};
