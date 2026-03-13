import React, { useEffect, useRef, useState } from 'react';
import { Typography, Button } from 'antd';
import {
  CheckCircleOutlined,
  LoginOutlined,
  SafetyCertificateOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { authApi } from '@/services/api/authApi';

const { Title, Text } = Typography;

// 固定浅色配色（与 AuthPage 统一）
const PRIMARY_COLOR = '#1890ff';
const SECONDARY_COLOR = '#6366f1';

// 登出原因映射
const LOGOUT_REASONS: Record<string, { title: string; description: string }> = {
  manual: {
    title: 'You have been logged out',
    description: 'You have successfully signed out of your account.',
  },
  timeout: {
    title: 'Session Expired',
    description:
      'Your session has expired due to inactivity. Please sign in again to continue.',
  },
  unauthorized: {
    title: 'Authentication Required',
    description:
      'Your session is no longer valid. Please sign in again to access the dashboard.',
  },
  default: {
    title: 'You have been logged out',
    description: 'Please sign in again to continue using the dashboard.',
  },
};

/**
 * 登出页面
 * 显示登出成功信息，并提供重新登录的入口
 * 注意：此页面始终使用浅色配色，不跟随系统主题
 */
export const LogoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const logoutCalledRef = useRef(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 获取登出原因
  const reason = searchParams.get('reason') || 'default';
  const { title, description } =
    LOGOUT_REASONS[reason] || LOGOUT_REASONS.default;

  // 执行 SSO 登出
  useEffect(() => {
    const performSsoLogout = async () => {
      // 防止重复调用
      if (logoutCalledRef.current) {
        return;
      }
      logoutCalledRef.current = true;

      // 获取当前状态（在清除之前）
      const currentState = useAuthStore.getState();
      const hasToken = !!currentState.token;

      if (!hasToken) {
        // 已经登出，不需要调用 API
        return;
      }

      setIsLoggingOut(true);

      // 先获取登出需要的信息（在清除之前）
      const email =
        currentState.currentEmail ||
        currentState.user?.email ||
        localStorage.getItem('currentEmail') ||
        '';
      const session = currentState.sessionId || '';
      const redirectUrl = window.location.origin + '/auth';

      try {
        // 调用 SSO 登出 API
        const response = await authApi.ssoLogout({
          email,
          sessionId: session,
          redirect_url: redirectUrl,
        });

        // API 调用成功后，清除本地状态
        useAuthStore.setState({
          user: null,
          token: null,
          sessionId: null,
          hierarchyId: null,
          hierarchyName: null,
          merchantId: null,
          merchantName: null,
          merchants: [],
          hierarchyTree: [],
          adminPermissions: '',
          canRefund: false,
          mfaEnabled: false,
          config: '',
          settlementCurrencies: [],
          timezone: '',
          timezoneShort: '',
          currentEmail: '',
          isLoading: false,
          error: null,
        });
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('currentEmail');

        // 如果 SSO 返回了登出重定向 URL，跳转到 SSO 登出页面
        if (response.code === 200 && response.data) {
          window.location.href = response.data;
          return;
        }
      } catch (error) {
        console.error('SSO logout failed:', error);
        // 即使 SSO 登出失败，也清除本地状态
        useAuthStore.setState({
          user: null,
          token: null,
          sessionId: null,
          hierarchyId: null,
          hierarchyName: null,
          merchantId: null,
          merchantName: null,
          merchants: [],
          hierarchyTree: [],
          adminPermissions: '',
          canRefund: false,
          mfaEnabled: false,
          config: '',
          settlementCurrencies: [],
          timezone: '',
          timezoneShort: '',
          currentEmail: '',
          isLoading: false,
          error: null,
        });
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('currentEmail');
      } finally {
        setIsLoggingOut(false);
      }
    };

    performSsoLogout();
  }, []);

  // 重新登录
  const handleLoginAgain = () => {
    window.location.href = '/auth';
  };

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
            background: isLoggingOut
              ? `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${SECONDARY_COLOR} 100%)`
              : reason === 'manual'
                ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
                : `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${SECONDARY_COLOR} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: isLoggingOut
              ? `0 10px 40px ${PRIMARY_COLOR}40`
              : reason === 'manual'
                ? '0 10px 40px rgba(82,196,26,0.4)'
                : `0 10px 40px ${PRIMARY_COLOR}40`,
          }}
        >
          {isLoggingOut ? (
            <LoadingOutlined style={{ fontSize: 36, color: '#fff' }} spin />
          ) : reason === 'manual' ? (
            <CheckCircleOutlined style={{ fontSize: 36, color: '#fff' }} />
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
          {isLoggingOut ? 'Signing Out...' : title}
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
          {isLoggingOut ? 'Please wait while we sign you out...' : description}
        </Text>

        {/* Sign In button */}
        <Button
          type="primary"
          size="large"
          icon={<LoginOutlined />}
          onClick={handleLoginAgain}
          disabled={isLoggingOut}
          style={{
            height: 48,
            borderRadius: 10,
            width: '100%',
            background: isLoggingOut
              ? undefined
              : `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${SECONDARY_COLOR} 100%)`,
            border: 'none',
            fontWeight: 500,
            fontSize: 15,
            boxShadow: isLoggingOut
              ? undefined
              : `0 8px 24px ${PRIMARY_COLOR}40`,
          }}
        >
          Sign In Again
        </Button>
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
    </div>
  );
};
