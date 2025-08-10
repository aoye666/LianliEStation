import React from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import Cookies from 'js-cookie';
import api from '../../api';
import './AdminLogin.scss';

const { Title, Text } = Typography;

interface LoginForm {
  identifier: string;
  password: string;
}

const AdminLogin: React.FC = () => {
  const [form] = Form.useForm();

  const { loading, run: handleLogin } = useRequest(
    async (values: LoginForm) => {
      const response = await api.post('/api/auth/login', values);
      return response.data;
    },
    {
      manual: true,
      onSuccess: (data) => {
        if (data.user?.isAdmin) {
          Cookies.set('auth-token', data.token, { expires: 7 });
          message.success('登录成功');
          window.location.href = '/admin';
        } else {
          message.error('您没有管理员权限');
        }
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || '登录失败');
      }
    }
  );

  const onFinish = (values: LoginForm) => {
    handleLogin(values);
  };

  return (
    <div className="admin-login-container">
      <div className="login-background">
        <div className="background-overlay" />
      </div>
      
      <Card className="login-card">
        <div className="login-header">
          <Title level={2} style={{ textAlign: 'center', marginBottom: 8 }}>
            联理E站
          </Title>
          <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
            后台管理系统
          </Text>
        </div>

        <Form
          form={form}
          name="admin-login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="identifier"
            rules={[
              { required: true, message: '请输入管理员用户名或邮箱' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="管理员用户名或邮箱"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              icon={<LoginOutlined />}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div className="login-footer">
          <Text type="secondary" style={{ fontSize: '12px' }}>
            © 2024 联理E站 - 管理员登录
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
