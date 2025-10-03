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
  Upload,
  Popconfirm,
  Tooltip,
  Image,
  Progress
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  EyeOutlined,
  UploadOutlined,
  ReloadOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import api from '../../../api';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import './Advertisement.scss';

const { Option } = Select;
const { TextArea } = Input;

interface Advertisement {
  id: number;
  title: string;
  content?: string;
  image_url?: string;
  target_url?: string;
  position: 'banner' | 'market' | 'forum';
  duration: number;
  clicks: number;
  status: 'active' | 'inactive' | 'expired';
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

interface AdStats {
  id: number;
  title: string;
  clicks: number;
}

const AdvertisementManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [adStats, setAdStats] = useState<AdStats[]>([]);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [editFileList, setEditFileList] = useState<UploadFile[]>([]);

  // 获取广告列表
  const { loading, run: fetchAds } = useRequest(
    async () => {
      const response = await api.get('/api/advertisements/list');
      return response.data;
    },
    {
      onSuccess: (data) => {
        setAdvertisements(data || []);
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || '获取广告列表失败');
      }
    }
  );

  // 获取广告统计
  const { loading: statsLoading, run: fetchStats } = useRequest(
    async () => {
      const response = await api.get('/api/advertisements/stats');
      return response.data;
    },
    {
      manual: true,
      onSuccess: (data) => {
        setAdStats(data || []);
        setShowStatsModal(true);
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || '获取统计数据失败');
      }
    }
  );

  // 添加广告
  const { loading: addLoading, run: addAdvertisement } = useRequest(
    async (formData: FormData) => {
      const response = await api.post('/api/advertisements/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('广告添加成功');
        setShowAddModal(false);
        form.resetFields();
        setFileList([]);
        fetchAds();
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || '添加失败');
      }
    }
  );

  // 更新广告
  const { loading: updateLoading, run: updateAdvertisement } = useRequest(
    async (id: number, formData: FormData) => {
      const response = await api.put(`/api/advertisements/update/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('广告更新成功');
        setShowEditModal(false);
        editForm.resetFields();
        setEditFileList([]);
        fetchAds();
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || '更新失败');
      }
    }
  );

  // 删除广告
  const { loading: deleteLoading, run: deleteAdvertisement } = useRequest(
    async (id: number) => {
      const response = await api.delete(`/api/advertisements/delete/${id}`);
      return response.data;
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('广告删除成功');
        fetchAds();
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || '删除失败');
      }
    }
  );

  // 清理过期广告
  const { loading: cleanupLoading, run: cleanupExpired } = useRequest(
    async () => {
      const response = await api.delete('/api/advertisements/cleanup/expired');
      return response.data;
    },
    {
      manual: true,
      onSuccess: (data) => {
        message.success(`已清理 ${data.deletedCount} 个过期广告`);
        fetchAds();
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || '清理失败');
      }
    }
  );

  useEffect(() => {
    fetchAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = (values: any) => {
    const formData = new FormData();
    formData.append('title', values.title);
    if (values.content) formData.append('content', values.content);
    if (values.target_url) formData.append('target_url', values.target_url);
    formData.append('position', values.position);
    formData.append('duration', values.duration || 7);
    
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append('image', fileList[0].originFileObj);
    }
    
    addAdvertisement(formData);
  };

  const handleEdit = (values: any) => {
    if (!selectedAd) return;
    
    const formData = new FormData();
    if (values.title) formData.append('title', values.title);
    if (values.content) formData.append('content', values.content);
    if (values.target_url) formData.append('target_url', values.target_url);
    if (values.position) formData.append('position', values.position);
    if (values.duration) formData.append('duration', values.duration);
    if (values.status) formData.append('status', values.status);
    
    if (editFileList.length > 0 && editFileList[0].originFileObj) {
      formData.append('image', editFileList[0].originFileObj);
    }
    
    updateAdvertisement(selectedAd.id, formData);
  };

  const handleDelete = (id: number) => {
    deleteAdvertisement(id);
  };

  const handleViewDetail = (record: Advertisement) => {
    setSelectedAd(record);
    setShowDetailModal(true);
  };

  const handleOpenEdit = (record: Advertisement) => {
    setSelectedAd(record);
    editForm.setFieldsValue({
      title: record.title,
      content: record.content,
      target_url: record.target_url,
      position: record.position,
      duration: record.duration,
      status: record.status
    });
    setShowEditModal(true);
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      active: { color: 'green', text: '活跃' },
      inactive: { color: 'orange', text: '未激活' },
      expired: { color: 'red', text: '已过期' }
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getPositionTag = (position: string) => {
    const positionConfig: Record<string, { color: string; text: string }> = {
      banner: { color: 'blue', text: '首页横幅' },
      market: { color: 'green', text: '商城' },
      forum: { color: 'purple', text: '论坛' }
    };
    const config = positionConfig[position] || { color: 'default', text: position };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns: ColumnsType<Advertisement> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      fixed: 'left'
    },
    {
      title: '广告标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true
    },
    {
      title: '位置',
      dataIndex: 'position',
      key: 'position',
      width: 120,
      render: (position: string) => getPositionTag(position),
      filters: [
        { text: '首页横幅', value: 'banner' },
        { text: '商城', value: 'market' },
        { text: '论坛', value: 'forum' }
      ],
      onFilter: (value, record) => record.position === value
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: '活跃', value: 'active' },
        { text: '未激活', value: 'inactive' },
        { text: '已过期', value: 'expired' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: '点击数',
      dataIndex: 'clicks',
      key: 'clicks',
      width: 100,
      sorter: (a, b) => a.clicks - b.clicks,
      render: (clicks: number) => (
        <Tag color={clicks > 100 ? 'red' : clicks > 50 ? 'orange' : 'default'}>
          {clicks}
        </Tag>
      )
    },
    {
      title: '展示时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration: number) => `${duration} 天`
    },
    {
      title: '开始日期',
      dataIndex: 'start_date',
      key: 'start_date',
      width: 110,
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN')
    },
    {
      title: '结束日期',
      dataIndex: 'end_date',
      key: 'end_date',
      width: 110,
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="link" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="link" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除这个广告吗？"
            description="删除后将无法恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button 
                type="link" 
                danger 
                size="small" 
                icon={<DeleteOutlined />}
                loading={deleteLoading}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="advertisement-container">
      <Card 
        title="广告管理" 
        extra={
          <Space>
            <Button
              icon={<BarChartOutlined />}
              onClick={() => fetchStats()}
              loading={statsLoading}
            >
              查看统计
            </Button>
            <Popconfirm
              title="确定清理所有过期广告吗？"
              description="此操作不可恢复"
              onConfirm={() => cleanupExpired()}
              okText="确定"
              cancelText="取消"
            >
              <Button
                icon={<DeleteOutlined />}
                danger
                loading={cleanupLoading}
              >
                清理过期
              </Button>
            </Popconfirm>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowAddModal(true)}
            >
              添加广告
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchAds()}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={advertisements}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
        />
      </Card>

      {/* 添加广告Modal */}
      <Modal
        title="添加广告"
        open={showAddModal}
        onOk={() => form.submit()}
        onCancel={() => {
          setShowAddModal(false);
          form.resetFields();
          setFileList([]);
        }}
        confirmLoading={addLoading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
        >
          <Form.Item
            name="title"
            label="广告标题"
            rules={[{ required: true, message: '请输入广告标题' }]}
          >
            <Input placeholder="请输入广告标题" />
          </Form.Item>

          <Form.Item
            name="content"
            label="广告内容"
          >
            <TextArea 
              rows={3} 
              placeholder="请输入广告内容描述" 
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="position"
            label="广告位置"
            rules={[{ required: true, message: '请选择广告位置' }]}
          >
            <Select placeholder="请选择广告位置">
              <Option value="banner">首页横幅</Option>
              <Option value="market">商城</Option>
              <Option value="forum">论坛</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="duration"
            label="展示时长（天）"
            initialValue={7}
          >
            <InputNumber min={1} max={365} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="target_url"
            label="跳转链接"
          >
            <Input placeholder="点击广告后跳转的URL（选填）" />
          </Form.Item>

          <Form.Item
            label="广告图片"
            tooltip="建议尺寸：横幅 1200x400，其他 800x600"
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList }) => setFileList(fileList.slice(-1))}
              maxCount={1}
            >
              {fileList.length === 0 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传图片</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑广告Modal */}
      <Modal
        title="编辑广告"
        open={showEditModal}
        onOk={() => editForm.submit()}
        onCancel={() => {
          setShowEditModal(false);
          editForm.resetFields();
          setEditFileList([]);
        }}
        confirmLoading={updateLoading}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEdit}
        >
          <Form.Item
            name="title"
            label="广告标题"
          >
            <Input placeholder="请输入广告标题" />
          </Form.Item>

          <Form.Item
            name="content"
            label="广告内容"
          >
            <TextArea 
              rows={3} 
              placeholder="请输入广告内容描述" 
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="position"
            label="广告位置"
          >
            <Select placeholder="请选择广告位置">
              <Option value="banner">首页横幅</Option>
              <Option value="market">商城</Option>
              <Option value="forum">论坛</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="duration"
            label="展示时长（天）"
          >
            <InputNumber min={1} max={365} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="广告状态"
          >
            <Select placeholder="请选择广告状态">
              <Option value="active">活跃</Option>
              <Option value="inactive">未激活</Option>
              <Option value="expired">已过期</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="target_url"
            label="跳转链接"
          >
            <Input placeholder="点击广告后跳转的URL" />
          </Form.Item>

          <Form.Item
            label="更新图片"
            tooltip="上传新图片将替换旧图片"
          >
            <Upload
              listType="picture-card"
              fileList={editFileList}
              beforeUpload={() => false}
              onChange={({ fileList }) => setEditFileList(fileList.slice(-1))}
              maxCount={1}
            >
              {editFileList.length === 0 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传新图片</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情Modal */}
      <Modal
        title="广告详情"
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetailModal(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {selectedAd && (
          <div>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {selectedAd.image_url && (
                <div style={{ textAlign: 'center' }}>
                  <Image
                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${selectedAd.image_url}`}
                    alt={selectedAd.title}
                    style={{ maxWidth: '100%', maxHeight: 300 }}
                  />
                </div>
              )}
              
              <Card size="small">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <strong>广告标题：</strong>
                    {selectedAd.title}
                  </div>
                  <div>
                    <strong>广告内容：</strong>
                    {selectedAd.content || '暂无'}
                  </div>
                  <div>
                    <strong>广告位置：</strong>
                    {getPositionTag(selectedAd.position)}
                  </div>
                  <div>
                    <strong>广告状态：</strong>
                    {getStatusTag(selectedAd.status)}
                  </div>
                  <div>
                    <strong>点击次数：</strong>
                    <Tag color="blue">{selectedAd.clicks}</Tag>
                  </div>
                  <div>
                    <strong>展示时长：</strong>
                    {selectedAd.duration} 天
                  </div>
                  <div>
                    <strong>跳转链接：</strong>
                    {selectedAd.target_url ? (
                      <a href={selectedAd.target_url} target="_blank" rel="noopener noreferrer">
                        {selectedAd.target_url}
                      </a>
                    ) : '无'}
                  </div>
                  <div>
                    <strong>开始日期：</strong>
                    {new Date(selectedAd.start_date).toLocaleString('zh-CN')}
                  </div>
                  <div>
                    <strong>结束日期：</strong>
                    {new Date(selectedAd.end_date).toLocaleString('zh-CN')}
                  </div>
                  <div>
                    <strong>创建时间：</strong>
                    {new Date(selectedAd.created_at).toLocaleString('zh-CN')}
                  </div>
                  <div>
                    <strong>更新时间：</strong>
                    {new Date(selectedAd.updated_at).toLocaleString('zh-CN')}
                  </div>
                </Space>
              </Card>
            </Space>
          </div>
        )}
      </Modal>

      {/* 统计数据Modal */}
      <Modal
        title="广告点击统计"
        open={showStatsModal}
        onCancel={() => setShowStatsModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowStatsModal(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        <Card size="small">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {adStats.map((stat) => (
              <div key={stat.id}>
                <div style={{ marginBottom: 8 }}>
                  <strong>{stat.title}</strong>
                  <span style={{ float: 'right', color: '#1890ff' }}>
                    {stat.clicks} 次
                  </span>
                </div>
                <Progress 
                  percent={Math.min((stat.clicks / Math.max(...adStats.map(s => s.clicks))) * 100, 100)} 
                  showInfo={false}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </div>
            ))}
            {adStats.length === 0 && (
              <div style={{ textAlign: 'center', color: '#999' }}>
                暂无统计数据
              </div>
            )}
          </Space>
        </Card>
      </Modal>
    </div>
  );
};

export default AdvertisementManagement;
