import React, { useState, useEffect } from "react";
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Select,
  message,
  Descriptions,
  Image,
  Badge,
  Tooltip
} from "antd";
import { 
  SearchOutlined, 
  EyeOutlined, 
  CheckOutlined, 
  FilterOutlined,
  ExclamationCircleOutlined,
  MessageOutlined
} from "@ant-design/icons";
import { useRequest } from 'ahooks';
import api from '../../../api';
import type { ColumnsType } from 'antd/es/table';
import './Messages.scss';

const { Option } = Select;
const { TextArea } = Input;

interface Appeal {
  id: number;
  title: string;
  content: string;
  type: 'post' | 'goods';
  target_id: number;
  target_title?: string;
  user_id: number;
  user_username: string;
  user_nickname: string;
  status: 'pending' | 'resolved' | 'deleted';
  read_status: 'unread' | 'read';
  created_at: string;
  updated_at: string;
  images?: string[];
  response_content?: string;
}

const Messages: React.FC = () => {
  const [form] = Form.useForm();
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: 'all',
    read_status: 'all',
    type: 'all'
  });

  // 获取申诉列表
  const { loading, run: fetchAppeals } = useRequest(
    async (params = {}) => {
      const response = await api.get('/api/admin/appeals', {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          status: filters.status === 'all' ? undefined : filters.status,
          read_status: filters.read_status === 'all' ? undefined : filters.read_status,
          type: filters.type === 'all' ? undefined : filters.type,
          ...params
        }
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        setAppeals(data.appeals || []);
        setPagination(prev => ({
          ...prev,
          total: data.total || 0
        }));
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || '获取申诉列表失败');
      }
    }
  );

  // 更新申诉状态
  const { loading: updateLoading, run: updateAppeal } = useRequest(
    async (values: { 
      appeal_id: number; 
      status?: string; 
      read_status?: string; 
      response_content?: string 
    }) => {
      const response = await api.put('/api/admin/appeals', values);
      return response.data;
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('申诉处理成功');
        setShowResponseModal(false);
        form.resetFields();
        fetchAppeals();
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || '处理失败');
      }
    }
  );

  useEffect(() => {
    fetchAppeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当分页改变时重新加载数据
  useEffect(() => {
    if (pagination.current > 1 || pagination.pageSize !== 10) {
      fetchAppeals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchAppeals({ ...newFilters, page: 1 });
  };

  const handleTableChange = (paginationConfig: any) => {
    setPagination(paginationConfig);
  };

  const handleViewDetail = (appeal: Appeal) => {
    setSelectedAppeal(appeal);
    setShowDetailModal(true);
    // 如果是未读状态，标记为已读
    if (appeal.read_status === 'unread') {
      updateAppeal({
        appeal_id: appeal.id,
        read_status: 'read'
      });
    }
  };

  const handleResponse = (appeal: Appeal) => {
    setSelectedAppeal(appeal);
    setShowResponseModal(true);
    form.setFieldsValue({
      appeal_id: appeal.id,
      status: 'resolved'
    });
  };

  const handleMarkResolved = (appealId: number) => {
    updateAppeal({
      appeal_id: appealId,
      status: 'resolved'
    });
  };

  const handleSubmitResponse = (values: any) => {
    updateAppeal(values);
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      'pending': { color: 'orange', text: '待处理' },
      'resolved': { color: 'green', text: '已处理' },
      'deleted': { color: 'red', text: '已删除' }
    };
    const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getTypeTag = (type: string) => {
    const typeMap = {
      'post': { color: 'blue', text: '帖子申诉' },
      'goods': { color: 'green', text: '商品申诉' }
    };
    const config = typeMap[type as keyof typeof typeMap] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getReadStatusBadge = (readStatus: string) => {
    if (readStatus === 'unread') {
      return <Badge dot status="processing" />;
    }
    return null;
  };

  const columns: ColumnsType<Appeal> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '申诉信息',
      key: 'appeal_info',
      render: (record: Appeal) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            {getReadStatusBadge(record.read_status)}
            <Tooltip title={record.title}>
              <Button 
                type="link" 
                style={{ padding: 0, height: 'auto' }}
                onClick={() => handleViewDetail(record)}
              >
                {record.title.length > 20 ? `${record.title.slice(0, 20)}...` : record.title}
              </Button>
            </Tooltip>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {getTypeTag(record.type)}
            {record.target_title && (
              <span style={{ marginLeft: 8 }}>
                目标: {record.target_title.slice(0, 15)}...
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      title: '申诉人',
      key: 'user',
      width: 120,
      render: (record: Appeal) => (
        <div>
          <div>{record.user_nickname}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>@{record.user_username}</div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: getStatusTag,
      filters: [
        { text: '待处理', value: 'pending' },
        { text: '已处理', value: 'resolved' },
        { text: '已删除', value: 'deleted' }
      ]
    },
    {
      title: '阅读状态',
      dataIndex: 'read_status',
      key: 'read_status',
      width: 100,
      render: (readStatus: string) => (
        <Tag color={readStatus === 'unread' ? 'red' : 'green'}>
          {readStatus === 'unread' ? '未读' : '已读'}
        </Tag>
      )
    },
    {
      title: '申诉时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (time: string) => new Date(time).toLocaleDateString(),
      sorter: (a: Appeal, b: Appeal) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (record: Appeal) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          {record.status === 'pending' && (
            <>
              <Button 
                type="link" 
                icon={<MessageOutlined />}
                onClick={() => handleResponse(record)}
              >
                回复
              </Button>
              <Button 
                type="link" 
                icon={<CheckOutlined />}
                onClick={() => handleMarkResolved(record.id)}
                loading={updateLoading}
              >
                标记已处理
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="messages-container">
      <Card title="申诉管理">
        {/* 筛选 */}
        <Space style={{ marginBottom: 16, width: '100%' }} wrap>
          <Select
            style={{ width: 120 }}
            placeholder="状态筛选"
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
          >
            <Option value="all">全部状态</Option>
            <Option value="pending">待处理</Option>
            <Option value="resolved">已处理</Option>
            <Option value="deleted">已删除</Option>
          </Select>
          <Select
            style={{ width: 120 }}
            placeholder="阅读状态"
            value={filters.read_status}
            onChange={(value) => handleFilterChange('read_status', value)}
          >
            <Option value="all">全部</Option>
            <Option value="unread">未读</Option>
            <Option value="read">已读</Option>
          </Select>
          <Select
            style={{ width: 120 }}
            placeholder="申诉类型"
            value={filters.type}
            onChange={(value) => handleFilterChange('type', value)}
          >
            <Option value="all">全部类型</Option>
            <Option value="post">帖子申诉</Option>
            <Option value="goods">商品申诉</Option>
          </Select>
          <Button icon={<FilterOutlined />} onClick={() => fetchAppeals()}>
            刷新
          </Button>
        </Space>

        {/* 申诉表格 */}
        <Table
          columns={columns}
          dataSource={appeals}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
          }}
          onChange={handleTableChange}
          rowClassName={(record) => record.read_status === 'unread' ? 'unread-row' : ''}
        />
      </Card>

      {/* 申诉详情模态框 */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined />
            申诉详情
          </Space>
        }
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetailModal(false)}>
            关闭
          </Button>,
          selectedAppeal?.status === 'pending' && (
            <Button 
              key="response" 
              type="primary" 
              onClick={() => handleResponse(selectedAppeal)}
            >
              回复申诉
            </Button>
          )
        ]}
        width={800}
      >
        {selectedAppeal && (
          <div>
            <Descriptions column={2} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="申诉ID">{selectedAppeal.id}</Descriptions.Item>
              <Descriptions.Item label="申诉类型">{getTypeTag(selectedAppeal.type)}</Descriptions.Item>
              <Descriptions.Item label="状态">{getStatusTag(selectedAppeal.status)}</Descriptions.Item>
              <Descriptions.Item label="阅读状态">
                <Tag color={selectedAppeal.read_status === 'unread' ? 'red' : 'green'}>
                  {selectedAppeal.read_status === 'unread' ? '未读' : '已读'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="申诉人">{selectedAppeal.user_nickname}</Descriptions.Item>
              <Descriptions.Item label="目标ID">{selectedAppeal.target_id}</Descriptions.Item>
              <Descriptions.Item label="申诉时间" span={2}>
                {new Date(selectedAppeal.created_at).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginBottom: 16 }}>
              <h4>申诉标题</h4>
              <p>{selectedAppeal.title}</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4>申诉内容</h4>
              <p style={{ whiteSpace: 'pre-wrap' }}>{selectedAppeal.content}</p>
            </div>

            {selectedAppeal.images && selectedAppeal.images.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4>申诉截图</h4>
                <Image.PreviewGroup>
                  <Space wrap>
                    {selectedAppeal.images.map((img, index) => (
                      <Image
                        key={index}
                        width={120}
                        height={120}
                        style={{ objectFit: 'cover' }}
                        src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${img}`}
                        placeholder="加载中..."
                      />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              </div>
            )}

            {selectedAppeal.response_content && (
              <div style={{ marginBottom: 16 }}>
                <h4>管理员回复</h4>
                <div style={{ 
                  padding: 12, 
                  backgroundColor: '#f6ffed', 
                  border: '1px solid #b7eb8f',
                  borderRadius: 6 
                }}>
                  {selectedAppeal.response_content}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 回复申诉模态框 */}
      <Modal
        title="回复申诉"
        open={showResponseModal}
        onCancel={() => setShowResponseModal(false)}
        onOk={() => form.submit()}
        confirmLoading={updateLoading}
      >
        <Form form={form} onFinish={handleSubmitResponse} layout="vertical">
          <Form.Item name="appeal_id" hidden>
            <Input />
          </Form.Item>
          <Form.Item 
            name="status" 
            label="处理状态"
            rules={[{ required: true, message: '请选择处理状态' }]}
          >
            <Select placeholder="请选择处理状态">
              <Option value="resolved">已处理</Option>
              <Option value="deleted">删除申诉</Option>
            </Select>
          </Form.Item>
          <Form.Item 
            name="response_content" 
            label="回复内容"
            rules={[{ required: true, message: '请输入回复内容' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="请输入对申诉的回复内容，这将发送给申诉用户" 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Messages;
