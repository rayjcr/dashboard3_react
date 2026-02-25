import React, { memo } from 'react';
import { Layout } from 'antd';
import { useThemeStore } from '@/stores';

const { Footer: AntFooter } = Layout;

// Get current year dynamically
const currentYear = new Date().getFullYear();

// Version info
const VERSION = '3.0.0(Beta)';

export const Footer: React.FC = memo(() => {
  const { currentTheme } = useThemeStore();
  const primaryColor = currentTheme === 'dark' ? '#7c3aed' : '#1890ff';

  return (
    <AntFooter
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        color: '#000',
        fontSize: 12,
        padding: '16px 50px',
        borderTop: '1px solid #f0f0f0',
      }}
    >
      <span>
        <strong>Copyright © 2020-{currentYear}</strong>{' '}
        <a
          href="https://www.citcon.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: primaryColor, fontWeight: 'bold' }}
        >
          Citcon
        </a>
        . All rights reserved.
      </span>
      <span>
        <strong>Version</strong> {VERSION}
      </span>
    </AntFooter>
  );
});

Footer.displayName = 'Footer';
