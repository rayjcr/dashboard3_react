import React, { useState } from 'react';
import { Typography, Input, Button, Modal, App, Card, Space } from 'antd';
import { useAuthStore } from '@/stores';
import { authApi } from '@/services/api/authApi';
import { ChangePhoneForm } from '@/components/auth/ChangePhoneForm';
import '@/components/auth/ChangePhoneForm.css';

const { Title, Text } = Typography;

export const AccountSettingsPage: React.FC = () => {
  const { user, mfaEnabled } = useAuthStore();
  const { message } = App.useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showChangePhone, setShowChangePhone] = useState(false);

  // Check if user is logged in via username/password (has user data)
  const isPasswordLogin = !!user;

  const handleChangePassword = () => {
    setIsModalOpen(true);
  };

  const handleConfirmChangePassword = async () => {
    if (!user?.email) {
      message.error('User email not found');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.getNauthLoginUrl({
        callback_url: `${window.location.origin}/auth-callback`,
        login_hint: user.email,
        update_password: true,
      });
      if (response.code === 200) {
        // Redirect to the auth URL
        window.location.href = response.data;
      } else {
        message.error(response.data || 'Failed to get password change URL');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to change password';
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
  };

  const handleChangePhoneNumber = () => {
    setShowChangePhone(true);
  };

  const handleBackFromChangePhone = () => {
    setShowChangePhone(false);
  };

  return (
    <div className="p-6" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className={`flip-card ${showChangePhone ? 'flipped' : ''}`}>
        <div className="flip-card-inner">
          {/* Front Side - Account Settings */}
          <div className="flip-card-front">
            <div style={{ width: '100%', maxWidth: 600 }}>
              <Title level={2} style={{ textAlign: 'center' }}>
                Account Settings
              </Title>

              <Space
                direction="vertical"
                size="large"
                style={{ width: '100%' }}
              >
                {/* Password Login Section */}
                {isPasswordLogin && (
                  <Card title="Login Credentials">
                    <Space
                      direction="vertical"
                      size="middle"
                      style={{ width: '100%' }}
                    >
                      <div>
                        <Text
                          strong
                          style={{ display: 'block', marginBottom: 8 }}
                        >
                          User Email
                        </Text>
                        <Input
                          value={user?.email || ''}
                          disabled
                          style={{ maxWidth: 400 }}
                        />
                      </div>

                      <div>
                        <Text
                          strong
                          style={{ display: 'block', marginBottom: 8 }}
                        >
                          Password
                        </Text>
                        <Space>
                          <Input.Password
                            value="••••••••"
                            disabled
                            style={{ width: 200 }}
                          />
                          <Button type="primary" onClick={handleChangePassword}>
                            Change
                          </Button>
                        </Space>
                      </div>
                    </Space>
                  </Card>
                )}

                {/* MFA Section */}
                {mfaEnabled && (
                  <Card title="Multi-Factor Authentication">
                    <Space
                      direction="vertical"
                      size="middle"
                      style={{ width: '100%' }}
                    >
                      <div>
                        <Text
                          strong
                          style={{ display: 'block', marginBottom: 8 }}
                        >
                          Phone Number
                        </Text>
                        <Button
                          type="primary"
                          onClick={handleChangePhoneNumber}
                        >
                          Change
                        </Button>
                      </div>
                    </Space>
                  </Card>
                )}

                {/* Show message if neither section is applicable */}
                {!isPasswordLogin && !mfaEnabled && (
                  <Card>
                    <Text type="secondary">
                      No account settings available for your login method.
                    </Text>
                  </Card>
                )}
              </Space>
            </div>
          </div>

          {/* Back Side - Change Phone Form */}
          <div className="flip-card-back">
            <ChangePhoneForm onBack={handleBackFromChangePhone} />
          </div>
        </div>
      </div>

      {/* Password Change Confirmation Modal */}
      <Modal
        title="Change Password"
        open={isModalOpen}
        onCancel={handleCancelModal}
        footer={[
          <Button key="cancel" onClick={handleCancelModal}>
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            loading={isLoading}
            onClick={handleConfirmChangePassword}
          >
            Confirm
          </Button>,
        ]}
      >
        <Text>
          You will be taken to the login screen before the password change
          request can proceed.
        </Text>
      </Modal>
    </div>
  );
};
