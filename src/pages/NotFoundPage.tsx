import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useThemeStore } from '@/stores';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme === 'dark';

  // Theme-aware colors
  const primaryColor = isDark ? '#7c3aed' : '#1890ff';
  const bgColor = 'rgb(245, 245, 245)';
  const textColor = 'rgba(0,0,0,0.85)';
  const subtextColor = 'rgba(0,0,0,0.45)';

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bgColor,
        position: 'relative',
        overflow: 'hidden',
        padding: '40px 20px',
        minHeight: 'calc(100vh - 120px)', // Ensure vertical centering on PC (subtract header + footer height)
      }}
    >
      {/* Decorative geometric shapes */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${primaryColor}20 0%, ${primaryColor}05 100%)`,
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: 80,
          height: 80,
          background: `linear-gradient(45deg, ${primaryColor}15 0%, transparent 100%)`,
          transform: 'rotate(45deg)',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '60%',
          left: '15%',
          width: 40,
          height: 40,
          border: `2px solid ${primaryColor}30`,
          borderRadius: 8,
          transform: 'rotate(15deg)',
          animation: 'spin 20s linear infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '20%',
          width: 60,
          height: 60,
          borderRadius: '50%',
          border: `3px solid ${primaryColor}20`,
          animation: 'pulse 4s ease-in-out infinite',
        }}
      />

      {/* Main content */}
      <div
        style={{
          textAlign: 'center',
          zIndex: 1,
          padding: '0 24px',
        }}
      >
        {/* 404 Number with creative styling */}
        <div
          style={{
            position: 'relative',
            marginBottom: 24,
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(100px, 20vw, 180px)',
              fontWeight: 800,
              letterSpacing: '-0.05em',
              color: primaryColor,
              margin: 0,
              lineHeight: 1,
              fontFamily:
                "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
              textShadow: `0 4px 30px ${primaryColor}30`,
            }}
          >
            404
          </h1>
          {/* Subtle reflection effect */}
          <div
            style={{
              position: 'absolute',
              bottom: -20,
              left: '50%',
              transform: 'translateX(-50%) scaleY(-0.3)',
              opacity: 0.15,
              fontSize: 'clamp(100px, 20vw, 180px)',
              fontWeight: 800,
              letterSpacing: '-0.05em',
              color: primaryColor,
              fontFamily:
                "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
              pointerEvents: 'none',
              filter: 'blur(2px)',
            }}
          >
            404
          </div>
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: 'clamp(20px, 4vw, 28px)',
            fontWeight: 600,
            color: textColor,
            margin: '0 0 12px 0',
            fontFamily:
              "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          Page Not Found
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            color: subtextColor,
            margin: '0 0 32px 0',
            maxWidth: 400,
            lineHeight: 1.6,
          }}
        >
          The page you're looking for doesn't exist or has been moved. Let's get
          you back on track.
        </p>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            type="primary"
            size="large"
            icon={<HomeOutlined />}
            onClick={() => navigate('/dashboard')}
            style={{
              height: 44,
              paddingLeft: 24,
              paddingRight: 24,
              borderRadius: 8,
              fontWeight: 500,
              boxShadow: `0 4px 14px ${primaryColor}40`,
            }}
          >
            Back to Dashboard
          </Button>
          <Button
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{
              height: 44,
              paddingLeft: 24,
              paddingRight: 24,
              borderRadius: 8,
              fontWeight: 500,
              borderColor: 'rgba(0,0,0,0.15)',
              color: textColor,
              background: 'rgba(0,0,0,0.02)',
            }}
          >
            Go Back
          </Button>
        </div>
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes spin {
          from { transform: rotate(15deg); }
          to { transform: rotate(375deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};
