import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Typography, App, Button } from 'antd';
import {
  LoadingOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useAuthStore, useUIStore, useHierarchyStore } from '@/stores';
import { authApi } from '@/services/api/authApi';
import type { LoginResponse, HierarchyNode } from '@/types/auth';

const { Title, Text } = Typography;

// 固定浅色配色（与 AuthPage 统一）
const PRIMARY_COLOR = '#1890ff';
const SECONDARY_COLOR = '#6366f1';

/**
 * SSO 认证回调页面
 * 处理 SSO 认证服务返回的结果
 * 注意：此页面始终使用浅色配色，不跟随系统主题
 */
export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 防止 StrictMode 双重调用
  const loginCalledRef = useRef(false);

  // 转换层级树节点 ID 为 number 类型
  const transformHierarchyTree = (
    nodes: HierarchyNode[],
    startId: number = 1,
  ): HierarchyNode[] => {
    let currentId = startId;
    return nodes.map((node) => {
      const newNode: HierarchyNode = {
        ...node,
        id: node.id ?? currentId++,
      };
      if (node.children && node.children.length > 0) {
        newNode.children = transformHierarchyTree(node.children, currentId);
        currentId += node.children.length;
      }
      return newNode;
    });
  };

  // 处理登录成功
  const handleLoginSuccess = async (response: LoginResponse) => {
    // 转换层级树
    const transformedTree = transformHierarchyTree(response.child || []);

    // 保存 email 到 localStorage（用于登出时调用 API）
    if (response.user_email) {
      localStorage.setItem('currentEmail', response.user_email);
    }

    // 清除之前的选中节点
    const { setExpandedKeys, setSelectedNode } = useUIStore.getState();
    const { clearCache, fetchChildren } = useHierarchyStore.getState();
    clearCache();
    setSelectedNode(null);

    // 更新 authStore
    useAuthStore.setState({
      user: {
        id: response.user_id,
        email: response.user_email,
        role: response.role,
        sessionId: response.session_id,
      },
      token: response.token || response.session_id,
      sessionId: response.session_id,
      currentEmail: response.user_email || '',
      hierarchyId: response.hierarchy,
      hierarchyName: response.hierarchyName,
      merchantId: response.merchant_id,
      merchantName: response.merchant_name,
      merchants: response.merchants || [],
      hierarchyTree: transformedTree,
      adminPermissions: response.adminPermissions || '',
      canRefund: response.can_refund === 1,
      mfaEnabled: response.MFA || false,
      config: response.config || '',
      settlementCurrencies: response.settlement_currencys || [],
      timezone: response.timezone || '',
      timezoneShort: response.timezone_short || '',
      isLoading: false,
      error: null,
    });

    // 加载第一层子节点并展开
    const newSessionId = response.session_id;
    if (newSessionId && transformedTree && transformedTree.length > 0) {
      const expandKeys: string[] = [];

      // 加载所有第一层节点的子节点
      for (const node of transformedTree) {
        if (node.id && node.children !== undefined) {
          const nodeKey = `node-${node.id}`;
          expandKeys.push(nodeKey);
          // 获取该节点的子节点
          try {
            await fetchChildren(node.id, newSessionId, true);
          } catch (error) {
            console.error(
              `Failed to load children for node ${node.id}:`,
              error,
            );
          }
        }
      }
      // 设置展开键以显示第一层
      if (expandKeys.length > 0) {
        setExpandedKeys(expandKeys);
      }
      // 选中第一个节点，这样 DashboardPage 的 useEffect 就不会重置 expandedKeys
      if (transformedTree.length > 0) {
        setSelectedNode(transformedTree[0]);
      }
    }

    setSuccess(true);
    message.success('Login successful');

    // 延迟跳转到 Dashboard
    setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 1000);
  };

  // 执行 SSO 登录
  const performSsoLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      // 从 URL 获取参数
      const sessionState = searchParams.get('session_state');
      const authCode = searchParams.get('code');
      const codeChallenge = searchParams.get('code_challenge');
      const iss = searchParams.get('iss');

      // 验证必要参数
      if (!authCode) {
        throw new Error('Missing authorization code');
      }
      if (!sessionState) {
        throw new Error('Missing session state');
      }

      // 调用 SSO 登录接口
      const response = await authApi.ssoLogin({
        oauth_code: authCode,
        session_state: sessionState,
        code_challenge: codeChallenge || '',
        iss: iss || '',
      });

      // 检查响应
      if (response.code === 200) {
        handleLoginSuccess(response);
      } else {
        throw new Error(response.message || 'Authentication failed');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 防止 StrictMode 双重调用
    if (loginCalledRef.current) {
      return;
    }
    loginCalledRef.current = true;
    performSsoLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 获取图标
  const getIcon = () => {
    if (loading) {
      return <LoadingOutlined style={{ fontSize: 36, color: '#fff' }} spin />;
    }
    if (error) {
      return (
        <ExclamationCircleOutlined style={{ fontSize: 36, color: '#fff' }} />
      );
    }
    return <CheckCircleOutlined style={{ fontSize: 36, color: '#fff' }} />;
  };

  // 获取标题
  const getTitle = () => {
    if (loading) return 'Verifying Authentication';
    if (error) return 'Authentication Failed';
    return 'Login Successful';
  };

  // 获取描述
  const getDescription = () => {
    if (loading) return 'Please wait while we verify your credentials...';
    if (error) return error;
    return 'Redirecting to dashboard...';
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
            background: error
              ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)'
              : success
                ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
                : `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${SECONDARY_COLOR} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: error
              ? '0 10px 40px rgba(255,107,107,0.4)'
              : success
                ? '0 10px 40px rgba(82,196,26,0.4)'
                : `0 10px 40px ${PRIMARY_COLOR}40`,
          }}
        >
          {getIcon()}
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
          {getTitle()}
        </Title>

        {/* Description */}
        <Text
          style={{
            fontSize: 15,
            color: error ? '#ff6b6b' : 'rgba(0,0,0,0.55)',
            display: 'block',
            marginBottom: 32,
            lineHeight: 1.6,
          }}
        >
          {getDescription()}
        </Text>

        {/* Loading animation or Retry button */}
        {loading ? (
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
        ) : error ? (
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => {
              loginCalledRef.current = false;
              performSsoLogin();
            }}
            style={{
              height: 44,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${SECONDARY_COLOR} 100%)`,
              border: 'none',
              fontWeight: 500,
              boxShadow: `0 8px 24px ${PRIMARY_COLOR}40`,
            }}
          >
            Retry Authentication
          </Button>
        ) : null}
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
