import { useState } from 'react';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/errors';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'React Boilerplate';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values) => {
    setError(null);
    setSubmitting(true);
    try {
      await login(values);
      navigate(location.state?.from?.pathname ?? '/', { replace: true });
    } catch (err) {
      const fieldError = err?.response?.data?.errors?.email?.[0];
      setError(
        fieldError || getErrorMessage(err, 'Unable to reach the API. Is laravel-boilerplate running?'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-layout p-4">
      <Card bordered={false} className="w-full max-w-sm shadow-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded bg-primary text-xl font-bold text-white">
            R
          </div>
          <Typography.Title level={3} className="!mb-1">
            {APP_NAME}
          </Typography.Title>
          <Typography.Text type="secondary">Sign in to continue</Typography.Text>
        </div>

        {error && <Alert type="error" message={error} showIcon className="mb-4" />}

        <Form layout="vertical" onFinish={onFinish} requiredMark={false} disabled={submitting}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="admin@example.com"
              autoComplete="username"
              autoFocus
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={submitting}>
            Sign in
          </Button>
        </Form>
      </Card>
    </div>
  );
}
