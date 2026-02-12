import React, { useState, useCallback } from 'react';
import { Typography, Input, Button, Card, Space, Alert, Form } from 'antd';
import 'react-phone-number-input/style.css';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import { authApi } from '@/services/api/authApi';
import { useAuthStore } from '@/stores';
import './ChangePhoneForm.css';

const { Title, Text } = Typography;

type Stage = 'input' | 'verify' | 'success';

interface ChangePhoneFormProps {
  onBack: () => void;
}

export const ChangePhoneForm: React.FC<ChangePhoneFormProps> = ({ onBack }) => {
  const { logout } = useAuthStore();
  const [form] = Form.useForm();

  const [stage, setStage] = useState<Stage>('input');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [resendCount, setResendCount] = useState(0);
  const [isInputDisabled, setIsInputDisabled] = useState(false);

  // Schedule logout after delay
  const scheduleLogout = useCallback(() => {
    setTimeout(() => {
      logout();
    }, 3000);
  }, [logout]);

  // Reset forms
  const resetForms = useCallback(() => {
    form.setFieldValue('authCode', '');
  }, [form]);

  // Handle Step 1: Change Phone
  const handleChangePhone = async () => {
    try {
      const values = await form.validateFields([
        'password',
        'phone',
        'confirmPhone',
      ]);
      const { password, phone, confirmPhone } = values;

      if (phone !== confirmPhone) {
        setErrorMessage('Phone numbers do not match');
        return;
      }

      if (!isValidPhoneNumber(phone)) {
        setErrorMessage('Please enter a valid phone number');
        return;
      }

      setLoading(true);
      setErrorMessage('');

      const response = await authApi.changePhone({
        password,
        phone,
      });

      if (response.data.resent_count !== undefined) {
        setResendCount(response.data.resent_count);
      }

      if (response.code === 201 || response.code === 200) {
        // Success - move to verify stage
        setIsInputDisabled(true);
        setStage('verify');
        setSuccessMessage('Verification code sent to your original phone');
      } else if (response.data.code === '0005') {
        // Password error
        if (
          response.data.attempt_change_phone_count !== undefined &&
          response.data.attempt_change_phone_count >= 3
        ) {
          setErrorMessage(
            'You have exceeded the maximum number of unsuccessful phone number change attempts. You will be logged out.',
          );
          form.resetFields();
          scheduleLogout();
        } else {
          const remaining = 3 - (response.data.attempt_change_phone_count || 0);
          setErrorMessage(
            `Please check your password and try again. ${remaining} attempts remaining`,
          );
          form.setFieldValue('password', '');
        }
      } else if (response.data.code === '0016') {
        form.resetFields();
        setErrorMessage(
          'This phone number is in use. Please add a new phone number.',
        );
      } else {
        setErrorMessage(response.data.msg || 'An error occurred');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Request failed',
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend Code
  const handleResendCode = async () => {
    if (resendCount >= 2) {
      setErrorMessage('Maximum resend attempts reached');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await authApi.resendAuthCode();

      if (response.data.resent_count !== undefined) {
        setResendCount(response.data.resent_count);
      }

      if (response.code === 201) {
        setErrorMessage('');
        setSuccessMessage('Authorization code successfully resent.');
        resetForms();
      } else if (response.data.code === '0014') {
        setSuccessMessage('');
        setErrorMessage(
          `Your account has been temporarily locked for ${response.data.remain_minutes} minutes. You will be logged out.`,
        );
        scheduleLogout();
      } else {
        setSuccessMessage('');
        setErrorMessage('Error resending authorization code.');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Request failed',
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Verify Phone Change
  const handleVerifyPhone = async () => {
    try {
      const values = await form.validateFields(['authCode']);
      const { authCode } = values;

      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const response = await authApi.verifyChangePhone({
        auth_code: authCode,
      });

      if (response.code === 200) {
        setStage('success');
        setErrorMessage('');
        setSuccessMessage('Phone number changed successfully!');
      } else if (response.code === 204) {
        if (response.data.code === '0003') {
          // Fail
          resetForms();
          const attemptCount = response.data.attempt_count || 0;
          const resentCount = response.data.resent_count || 0;

          if (attemptCount >= 3 && resentCount >= 2) {
            setErrorMessage(
              'You have exceeded the maximum number of unsuccessful phone number change attempts. You will be logged out.',
            );
            scheduleLogout();
          } else {
            setErrorMessage(
              `${response.data.msg || 'Invalid code'} ${3 - attemptCount} attempts remaining`,
            );
            if (attemptCount >= 3) {
              setIsInputDisabled(true);
            }
          }
        } else if (response.data.code === '0004') {
          // Auth expired
          setErrorMessage(
            `${response.data.msg || 'Authorization expired'} Please try to resend your code.`,
          );
        } else if (response.data.code === '0014') {
          // Account locked
          resetForms();
          setErrorMessage(
            `Your account has been temporarily locked for ${response.data.remain_minutes} minutes. You will be logged out.`,
          );
          scheduleLogout();
        } else {
          // System error
          setErrorMessage(response.data.msg || 'An error occurred');
        }
      } else {
        setErrorMessage('Verification failed');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Request failed',
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Next button click
  const handleNext = () => {
    if (stage === 'input') {
      handleChangePhone();
    } else if (stage === 'verify') {
      handleVerifyPhone();
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 600 }}>
      <Title level={2} style={{ textAlign: 'center' }}>
        Change Phone Number
      </Title>

      <Card>
        {errorMessage && (
          <Alert
            title={errorMessage}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {successMessage && (
          <Alert
            title={successMessage}
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {stage === 'success' ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Text style={{ fontSize: 16, display: 'block', marginBottom: 24 }}>
              Your phone number has been updated successfully!
            </Text>
            <Button type="primary" onClick={onBack}>
              Back
            </Button>
          </div>
        ) : (
          <Form form={form} layout="vertical">
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please enter your password' },
              ]}
            >
              <Input.Password
                placeholder="Enter your password"
                disabled={isInputDisabled}
              />
            </Form.Item>

            <Form.Item
              label="New Phone Number"
              name="phone"
              rules={[{ required: true, message: 'Please enter phone number' }]}
            >
              <PhoneInput
                international
                defaultCountry="US"
                placeholder="Enter phone number"
                value={form.getFieldValue('phone')}
                onChange={(value) => form.setFieldValue('phone', value || '')}
                disabled={isInputDisabled}
                className="phone-input-container"
              />
            </Form.Item>

            <Form.Item
              label="Confirm New Phone Number"
              name="confirmPhone"
              rules={[
                { required: true, message: 'Please confirm phone number' },
              ]}
            >
              <PhoneInput
                international
                defaultCountry="US"
                placeholder="Confirm phone number"
                value={form.getFieldValue('confirmPhone')}
                onChange={(value) =>
                  form.setFieldValue('confirmPhone', value || '')
                }
                disabled={isInputDisabled}
                className="phone-input-container"
              />
            </Form.Item>

            {stage === 'verify' && (
              <>
                <Form.Item
                  label="Verification Code"
                  name="authCode"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter verification code',
                    },
                  ]}
                >
                  <Input placeholder="Enter verification code" maxLength={6} />
                </Form.Item>

                {resendCount < 2 && (
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">
                      Didn't get your authorization code?{' '}
                      <Button
                        type="link"
                        onClick={handleResendCode}
                        loading={loading}
                        style={{ padding: 0 }}
                      >
                        Resend Code
                      </Button>
                    </Text>
                  </div>
                )}
              </>
            )}

            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={onBack} disabled={loading}>
                Back
              </Button>
              <Button type="primary" onClick={handleNext} loading={loading}>
                Next
              </Button>
            </Space>
          </Form>
        )}
      </Card>
    </div>
  );
};
