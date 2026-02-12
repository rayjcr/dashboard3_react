import React, { memo } from 'react';
import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

export const Footer: React.FC = memo(() => {
  return (
    <AntFooter
      style={{
        textAlign: 'center',
        background: '#fff',
        color: 'rgba(0, 0, 0, 0.45)',
        padding: '16px 50px',
        borderTop: '1px solid #f0f0f0',
      }}
    >
      © 2026 Citcon. All rights reserved.
    </AntFooter>
  );
});

Footer.displayName = 'Footer';
