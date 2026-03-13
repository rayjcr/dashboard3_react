import React, { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { Typography, App, Button } from 'antd';
import {
  SafetyCertificateOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/stores';
import { authApi } from '@/services/api/authApi';

const { Title, Text } = Typography;

// 固定浅色配色（不跟随主题）
const PRIMARY_COLOR = '#1890ff';
const SECONDARY_COLOR = '#6366f1';

/**
 * SSO 认证页面
 * 未登录时调用 nauth_login_url 获取 SSO 登录地址并跳转
 * 已登录时直接重定向到 Dashboard
 * 注意：此页面始终使用浅色配色，不跟随系统主题
 */
export const AuthPage: React.FC = () => {
  const { token } = useAuthStore();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 防止 StrictMode 双重调用
  const fetchCalledRef = useRef(false);

  const fetchSsoUrl = async () => {
    try {
      setLoading(true);
      setError(null);

      const callbackUrl = `${window.location.origin}/auth-callback`;
      const response = await authApi.getNauthLoginUrl({
        callback_url: callbackUrl,
      });
      console.log(response, 'response');
      // 检查响应是否包含 SSO URL
      if (response.code === 200 && response.data) {
        // 跳转到 SSO 登录页面
        window.location.href = response.data;
      } else {
        setError(response.message || 'Network unavailable');
        message.error(response.message || 'Network unavailable');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Network unavailable';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 已登录则不需要获取 SSO URL
    if (token) {
      return;
    }
    // 防止 StrictMode 双重调用
    if (fetchCalledRef.current) {
      return;
    }
    fetchCalledRef.current = true;
    fetchSsoUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // 已登录，重定向到首页
  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 50%, #dfe9f3 100%)',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background elements */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(24,144,255,0.12)',
          filter: 'blur(60px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(99,102,241,0.1)',
          filter: 'blur(80px)',
        }}
      />

      {/* Main card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          padding: '48px 56px',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,0,0,0.06)',
          textAlign: 'center',
          maxWidth: 420,
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${SECONDARY_COLOR} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: `0 10px 40px ${PRIMARY_COLOR}40`,
          }}
        >
          {loading ? (
            <LoadingOutlined style={{ fontSize: 36, color: '#fff' }} spin />
          ) : error ? (
            <ExclamationCircleOutlined
              style={{ fontSize: 36, color: '#fff' }}
            />
          ) : (
            <SafetyCertificateOutlined
              style={{ fontSize: 36, color: '#fff' }}
            />
          )}
        </div>

        {/* Title */}
        <Title
          level={3}
          style={{
            margin: '0 0 8px',
            color: '#1a1a2e',
            fontWeight: 600,
          }}
        >
          {loading
            ? 'Secure Authentication'
            : error
              ? 'Connection Failed'
              : 'Redirecting...'}
        </Title>

        {/* Description */}
        <Text
          style={{
            fontSize: 15,
            color: 'rgba(0,0,0,0.55)',
            display: 'block',
            marginBottom: 32,
            lineHeight: 1.6,
          }}
        >
          {loading
            ? 'Please wait while we connect you to the secure login portal...'
            : error
              ? error
              : 'You will be redirected shortly.'}
        </Text>

        {/* Loading animation or retry button */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: PRIMARY_COLOR,
                  animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        {error && !loading && (
          <Button
            type="primary"
            size="large"
            icon={<ReloadOutlined />}
            onClick={fetchSsoUrl}
            style={{
              height: 48,
              paddingInline: 32,
              borderRadius: 12,
              fontWeight: 500,
              background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${SECONDARY_COLOR} 100%)`,
              border: 'none',
              boxShadow: `0 4px 20px ${PRIMARY_COLOR}40`,
            }}
          >
            Try Again
          </Button>
        )}
      </div>

      {/* Footer text */}
      <Text
        style={{
          position: 'absolute',
          bottom: 24,
          color: 'rgba(0,0,0,0.35)',
          fontSize: 13,
        }}
      >
        Secured by Enterprise SSO
      </Text>

      {/* CSS animation */}
      <style>
        {`
          @keyframes pulse {
            0%, 80%, 100% {
              transform: scale(0.6);
              opacity: 0.5;
            }
            40% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};
