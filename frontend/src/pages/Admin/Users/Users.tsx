import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  InputNumber, 
  Select,
  message,
  Descriptions,
  Tabs,
  Timeline,
  Image,
  Popconfirm
} from 'antd';
import { SearchOutlined, EyeOutlined, BankOutlined, StopOutlined, CheckOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import api from '../../../api';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface User {
  id: number;
  username: string;
  nickname: string;
  email: string;
  qq_id: string;
  credit: number;
  campus_id: number;
  created_at: string;
  avatar?: string;
  background_url?: string;
  banner_url?: string;
  theme_id?: number;
}

interface UserHistory {
  type: 'post' | 'goods';
  id: number;
  title: string;
  content: string;
  status: string;
  created_at: string;
  likes_count: number;
  complaints_count: number;
  images?: string[];
}

interface BanRecord {
  id: number;
  reason: string;
  ban_until: string;
  status: string;
  created_at: string;
  admin_username: string;
}

const Users: React.FC = () => {
  const [searchForm] = Form.useForm();
  const [creditForm] = Form.useForm();
  const [banForm] = Form.useForm();
  
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [userHistory, setUserHistory] = useState<UserHistory[]>([]);
  const [banRecords, setBanRecords] = useState<BanRecord[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 搜索用户
  const { loading: searchLoading, run: searchUser } = useRequest(
    async (qq_id: string) => {
      const response = await api.post('/api/admin/search-user', { qq_id });
      return response.data;
    },
    {
      manual: true,
      onSuccess: (data) => {
        setSearchResult(data);
        message.success('用户查找成功');
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || '查找失败');
        setSearchResult(null);
      }
    }
  );

  // 获取用户发布历史
  const { loading: historyLoading, run: getUserHistory } = useRequest(
    async (user_id: number) => {
      const response = await api.get('/api/admin/search-history', {
        params: { user_id, page: 1, limit: 50 }
      });
      return response.data;
    },
    {
      manual: true,
      onSuccess: (data) => {
        setUserHistory(data.items || []);
      },
      onError: (error) => {
        message.error('获取用户历史失败');
      }
    }
  );

  // 修改信用值
  const { loading: creditLoading, run: updateCredit } = useRequest(
    async (values: { user_id: number; credit_change: number; reason: string }) => {
      const response = await api.put('/api/admin/credit', values);
      return response.data;
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('信用值修改成功');
        setShowCreditModal(false);
        creditForm.resetFields();
        // 刷新用户信息
        if (searchResult) {
          searchUser(searchResult.qq_id);
        }
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || '修改失败');
      }
    }
  );

  // 封禁用户
  const { loading: banLoading, run: banUser } = useRequest(
    async (values: { user_id: number; duration: number; duration_type: string; reason: string }) => {
      const response = await api.put('/api/admin/ban', values);
      return response.data;
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('用户封禁成功');
        setShowBanModal(false);
        banForm.resetFields();
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || '封禁失败');
      }
    }
  );

  // 解封用户
  const { loading: unbanLoading, run: unbanUser } = useRequest(
    async (user_id: number) => {
      const response = await api.put('/api/admin/unban', { user_id });
      return response.data;
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('用户解封成功');
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || '解封失败');
      }
    }
  );

  const handleSearch = (values: { qq_id: string }) => {
    if (!values.qq_id?.trim()) {
      message.warning('请输入QQ号');
      return;
    }
    searchUser(values.qq_id.trim());
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
    getUserHistory(user.id);
  };

  const handleUpdateCredit = (user: User) => {
    setSelectedUser(user);
    creditForm.setFieldsValue({ user_id: user.id });
    setShowCreditModal(true);
  };

  const handleBanUser = (user: User) => {
    setSelectedUser(user);
    banForm.setFieldsValue({ user_id: user.id });
    setShowBanModal(true);
  };

  const getCreditColor = (credit: number) => {
    if (credit >= 80) return 'green';
    if (credit >= 60) return 'orange';
    return 'red';
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      'active': { color: 'green', text: '正常' },
      'inactive': { color: 'orange', text: '待审核' },
      'deleted': { color: 'red', text: '已删除' },
      'available': { color: 'green', text: '可用' },
      'sold': { color: 'blue', text: '已售出' },
      'unavailable': { color: 'gray', text: '不可用' }
    };
    const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const historyColumns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (
        <Tag color={type === 'post' ? 'blue' : 'green'}>
          {type === 'post' ? '帖子' : '商品'}
        </Tag>
      )
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: getStatusTag
    },
    {
      title: '点赞/投诉',
      key: 'interaction',
      width: 120,
      render: (record: UserHistory) => (
        <Space>
          <span style={{ color: '#52c41a' }}>👍 {record.likes_count}</span>
          <span style={{ color: '#ff4d4f' }}>👎 {record.complaints_count}</span>
        </Space>
      )
    },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (time: string) => new Date(time).toLocaleDateString()
    }
  ];

  return (
    <div>
      <Card title="用户管理" style={{ marginBottom: 24 }}>
        <Form form={searchForm} onFinish={handleSearch} layout="inline">
          <Form.Item name="qq_id" label="QQ号" rules={[{ required: true, message: '请输入QQ号' }]}>
            <Input placeholder="请输入用户QQ号" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={searchLoading}>
              搜索用户
            </Button>
          </Form.Item>
        </Form>

        {searchResult && (
          <Card title="搜索结果" style={{ marginTop: 16 }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="用户ID">{searchResult.id}</Descriptions.Item>
              <Descriptions.Item label="用户名">{searchResult.username}</Descriptions.Item>
              <Descriptions.Item label="昵称">{searchResult.nickname}</Descriptions.Item>
              <Descriptions.Item label="QQ号">{searchResult.qq_id}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{searchResult.email}</Descriptions.Item>
              <Descriptions.Item label="校区ID">{searchResult.campus_id}</Descriptions.Item>
              <Descriptions.Item label="信用值">
                <Tag color={getCreditColor(searchResult.credit)}>{searchResult.credit}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">
                {new Date(searchResult.created_at).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
            
            <Space style={{ marginTop: 16 }}>
              <Button icon={<EyeOutlined />} onClick={() => handleViewUser(searchResult)}>
                查看详情
              </Button>
              <Button icon={<BankOutlined />} onClick={() => handleUpdateCredit(searchResult)}>
                修改信用值
              </Button>
              <Button danger icon={<StopOutlined />} onClick={() => handleBanUser(searchResult)}>
                封禁用户
              </Button>
              <Popconfirm
                title="确定要解封此用户吗？"
                onConfirm={() => unbanUser(searchResult.id)}
              >
                <Button icon={<CheckOutlined />} loading={unbanLoading}>
                  解封用户
                </Button>
              </Popconfirm>
            </Space>
          </Card>
        )}
      </Card>

      {/* 用户详情模态框 */}
      <Modal
        title="用户详情"
        open={showUserModal}
        onCancel={() => setShowUserModal(false)}
        footer={null}
        width={1000}
      >
        {selectedUser && (
          <Tabs defaultActiveKey="info">
            <TabPane tab="基本信息" key="info">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="用户ID">{selectedUser.id}</Descriptions.Item>
                <Descriptions.Item label="用户名">{selectedUser.username}</Descriptions.Item>
                <Descriptions.Item label="昵称">{selectedUser.nickname}</Descriptions.Item>
                <Descriptions.Item label="QQ号">{selectedUser.qq_id}</Descriptions.Item>
                <Descriptions.Item label="邮箱">{selectedUser.email}</Descriptions.Item>
                <Descriptions.Item label="校区ID">{selectedUser.campus_id}</Descriptions.Item>
                <Descriptions.Item label="信用值">
                  <Tag color={getCreditColor(selectedUser.credit)}>{selectedUser.credit}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="注册时间">
                  {new Date(selectedUser.created_at).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
              
              {selectedUser.avatar && (
                <div style={{ marginTop: 16 }}>
                  <h4>头像</h4>
                  <Image width={100} src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${selectedUser.avatar}`} />
                </div>
              )}
            </TabPane>
            
            <TabPane tab="发布历史" key="history">
              <Table
                columns={historyColumns}
                dataSource={userHistory}
                loading={historyLoading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* 修改信用值模态框 */}
      <Modal
        title="修改信用值"
        open={showCreditModal}
        onCancel={() => setShowCreditModal(false)}
        onOk={() => creditForm.submit()}
        confirmLoading={creditLoading}
      >
        <Form form={creditForm} onFinish={updateCredit} layout="vertical">
          <Form.Item name="user_id" hidden>
            <Input />
          </Form.Item>
          <Form.Item 
            name="credit_change" 
            label="信用值变更" 
            rules={[{ required: true, message: '请输入信用值变更' }]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="正数为增加，负数为减少"
              min={-100}
              max={100}
            />
          </Form.Item>
          <Form.Item 
            name="reason" 
            label="变更原因"
            rules={[{ required: true, message: '请输入变更原因' }]}
          >
            <TextArea rows={3} placeholder="请说明信用值变更的原因" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 封禁用户模态框 */}
      <Modal
        title="封禁用户"
        open={showBanModal}
        onCancel={() => setShowBanModal(false)}
        onOk={() => banForm.submit()}
        confirmLoading={banLoading}
      >
        <Form form={banForm} onFinish={banUser} layout="vertical">
          <Form.Item name="user_id" hidden>
            <Input />
          </Form.Item>
          <Form.Item 
            name="duration_type" 
            label="封禁类型"
            rules={[{ required: true, message: '请选择封禁类型' }]}
          >
            <Select placeholder="请选择封禁类型">
              <Option value="hours">小时</Option>
              <Option value="days">天</Option>
              <Option value="permanent">永久</Option>
            </Select>
          </Form.Item>
          <Form.Item 
            name="duration" 
            label="封禁时长"
            rules={[{ required: true, message: '请输入封禁时长' }]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="封禁时长（永久封禁可填任意数字）"
              min={1}
            />
          </Form.Item>
          <Form.Item 
            name="reason" 
            label="封禁原因"
            rules={[{ required: true, message: '请输入封禁原因' }]}
          >
            <TextArea rows={3} placeholder="请说明封禁原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
