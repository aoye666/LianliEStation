import React, { useState } from 'react';
import { LaptopOutlined, NotificationOutlined, UserOutlined, BarChartOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import Dashboard from './Dashboard/Dashboard';

const { Header, Content, Sider } = Layout;

const items1: MenuProps['items'] = ['1', '2', '3'].map((key) => ({
  key,
  label: `nav ${key}`,
}));

const items2: MenuProps['items'] = [UserOutlined, LaptopOutlined, NotificationOutlined].map(
  (icon, index) => {
    const key = String(index + 1);

    return {
      key: `sub${key}`,
      icon: React.createElement(icon),
      label: `subnav ${key}`,
      children: Array.from({ length: 4 }).map((_, j) => {
        const subKey = index * 4 + j + 1;
        return {
          key: subKey,
          label: `option${subKey}`,
        };
      }),
    };
  },
);

const menuItems: MenuProps['items'] = [
  { key: 'dashboard', icon: <BarChartOutlined />, label: '监测数据' },
  { key: 'user', icon: <UserOutlined />, label: '用户管理' },
  { key: 'market', icon: <LaptopOutlined />, label: '商品管理' },
  { key: 'forum', icon: <NotificationOutlined />, label: '论坛管理' },
];

const Admin = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [selectedKey, setSelectedKey] = useState('dashboard');
  let content = null;
  if (selectedKey === 'dashboard') content = <Dashboard />;
  else {
    const found = menuItems?.find((i) => i?.key === selectedKey) as { label?: React.ReactNode };
    content = <div style={{ padding: 24 }}>开发中：{found?.label}</div>;
  }

  return (
    <Layout>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['2']}
          items={items1}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Layout>
        <Sider width={200} style={{ background: colorBgContainer }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            style={{ height: '100%', borderRight: 0 }}
            items={items2}
          />
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Breadcrumb
            items={[{ title: 'Home' }, { title: 'List' }, { title: 'App' }]}
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
            {content}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default Admin;
