import React, { useState } from 'react';
import { LaptopOutlined, NotificationOutlined, UserOutlined, BarChartOutlined, MessageOutlined, LogoutOutlined, BulbOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Breadcrumb, Layout, Menu, theme, Button, Typography } from 'antd';
import { useUserStore } from '../../store'
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard/Dashboard';
import Forum from './Forum/Forum';
import Market from './Market/Market';
import Messages from './Messages/Messages';
import Users from './Users/Users';
import Advertisement from './Advertisement/Advertisement';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const menuItems: MenuProps['items'] = [
  { key: 'dashboard', icon: <BarChartOutlined />, label: '数据监控' },
  { key: 'users', icon: <UserOutlined />, label: '用户管理' },
  { key: 'forum', icon: <NotificationOutlined />, label: '校园墙管理' },
  { key: 'market', icon: <LaptopOutlined />, label: '商城管理' },
  { key: 'messages', icon: <MessageOutlined />, label: '申诉管理' },
  { key: 'advertisement', icon: <BulbOutlined />, label: '广告管理' },
];

const Admin = () => {
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [selectedKey, setSelectedKey] = useState('dashboard');

  const handleLogout = () => {
    useUserStore.getState().logout();
    navigate('/pc-page');
  };

  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <Users />;
      case 'forum':
        return <Forum />;
      case 'market':
        return <Market />;
      case 'messages':
        return <Messages />;
      case 'advertisement':
        return <Advertisement />;
      default:
        const found = menuItems?.find((i) => i?.key === selectedKey) as { label?: React.ReactNode };
        return <div style={{ padding: 24 }}>开发中：{found?.label}</div>;
    }
  };

  const getCurrentPageTitle = () => {
    const found = menuItems?.find((i) => i?.key === selectedKey);
    return (found as any)?.label || '后台管理';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 24px'
      }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          连理e站 - 后台管理系统
        </Title>
        <Button 
          type="text" 
          icon={<LogoutOutlined />} 
          onClick={handleLogout}
          style={{ color: 'white' }}
        >
          退出登录
        </Button>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: colorBgContainer }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={({ key }) => setSelectedKey(key)}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Breadcrumb
            items={[
              { title: '后台管理' }, 
              { title: getCurrentPageTitle() }
            ]}
            style={{ margin: '16px 0' }}
          />
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default Admin;
