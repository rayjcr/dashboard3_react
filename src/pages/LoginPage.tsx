import React, { useEffect } from 'react';
import { Form, Input, Button, Typography, App } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, useHierarchyStore, useUIStore } from '@/stores';
import type { LoginCredentials } from '@/types/auth';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { clearCache, fetchChildren } = useHierarchyStore();
  const { setExpandedKeys, setSelectedNode } = useUIStore();
  const { message } = App.useApp();

  // Note: PublicOnly component already handles redirect for logged-in users,
  // so we don't need a token check effect here.

  // Show error message when error state changes
  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError, message]);

  const onFinish = async (values: LoginCredentials) => {
    try {
      // Clear hierarchy cache and selected node before login to ensure fresh data
      clearCache();
      setSelectedNode(null); // Clear any previously selected node
      await login(values);
      message.success('Login successful!');

      // Get fresh state after login
      const authState = useAuthStore.getState();
      const newSessionId = authState.sessionId;
      const newHierarchyTree = authState.hierarchyTree;

      // Load first level children and expand them
      if (newSessionId && newHierarchyTree && newHierarchyTree.length > 0) {
        const expandKeys: string[] = [];

        // Load children for all first level nodes that have children
        for (const node of newHierarchyTree) {
          if (node.id && node.children !== undefined) {
            const nodeKey = `node-${node.id}`;
            expandKeys.push(nodeKey);
            // Fetch children for this node
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

        // Set expanded keys to show first level
        if (expandKeys.length > 0) {
          setExpandedKeys(expandKeys);
        }
      }

      navigate('/', { replace: true });
    } catch {
      // Error is already handled in the store and useEffect above
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            Citcon
          </Title>
          <Text type="secondary">sign in to start your session</Text>
        </div>

        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your Email!' },
              { type: 'email', message: 'Please enter a valid email address!' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end">
              <Link to="/forgot-password">Forgot Your Password</Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              loading={isLoading}
              style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
