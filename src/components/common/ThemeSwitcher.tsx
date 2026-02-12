import React, { memo } from 'react';
import { Button, Tooltip } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useThemeStore } from '@/stores';
import { getTheme } from '@/types/theme';

export const ThemeSwitcher: React.FC = memo(() => {
  const { currentTheme, toggleTheme } = useThemeStore();
  const theme = getTheme(currentTheme);
  const isDark = currentTheme === 'dark';

  return (
    <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      <Button
        type="text"
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleTheme}
        style={{
          fontSize: 18,
          color: theme.colors.textSecondary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    </Tooltip>
  );
});

ThemeSwitcher.displayName = 'ThemeSwitcher';
