import React, { useState, useEffect, useCallback } from "react";
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Modal, 
  Select,
  message,
  Descriptions,
  Image,
  Popconfirm,
  Tooltip,
  Badge,
  InputNumber
} from "antd";
import { 
  SearchOutlined, 
  EyeOutlined, 
  DeleteOutlined, 
  FilterOutlined,
  LikeOutlined,
  DislikeOutlined,
  ShopOutlined
} from "@ant-design/icons";
import { useRequest } from 'ahooks';
import api from '../../../api';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;

interface Goods {
  id: number;
  title: string;
  content: string;
  price: number;
  author_id: number;
  author_username: string;
  author_nickname: string;
  campus_id: number;
  status: 'available' | 'sold' | 'unavailable' | 'deleted';
  goods_type: string;
  tag?: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  complaints_count: number;
  images?: string[];
}

const Market: React.FC = () => {
  const [goods, setGoods] = useState<Goods[]>([]);
  const [selectedGoods, setSelectedGoods] = useState<Goods | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    keyword: '',
    status: 'all',
    goods_type: 'all',
    campus_id: undefined as number | undefined,
    min_price: undefined as number | undefined,
    max_price: undefined as number | undefined
  });

  // 获取商品列表
  const { loading, run: fetchGoods } = useRequest(
    async (params = {}) => {
      const response = await api.get('/api/goods', {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          status: filters.status === 'all' ? undefined : filters.status,
          keyword: filters.keyword || undefined,
          campus_id: filters.campus_id,
          goods_type: filters.goods_type === 'all' ? undefined : filters.goods_type,
          min_price: filters.min_price,
          max_price: filters.max_price,
          ...params
        }
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        setGoods(data.goods || []);
        setPagination(prev => ({
          ...prev,
          total: data.total || 0
        }));
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || '获取商品列表失败');
      }
    }
  );

  // 删除商品
  const { loading: deleteLoading, run: deleteGoods } = useRequest(
    async (goodsId: number) => {
      const response = await api.delete(`/api/admin/goods/${goodsId}`);
      return response.data;
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('商品删除成功');
        fetchGoods();
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || '删除失败');
      }
    }
  );

  useEffect(() => {
    fetchGoods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当分页改变时重新加载数据
  useEffect(() => {
    if (pagination.current > 1 || pagination.pageSize !== 10) {
      fetchGoods();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, keyword: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchGoods({ keyword: value, page: 1 });
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchGoods({ ...newFilters, page: 1 });
  };

  const handleTableChange = (paginationConfig: any) => {
    setPagination(paginationConfig);
  };

  const handleViewDetail = (goods: Goods) => {
    setSelectedGoods(goods);
    setShowDetailModal(true);
  };

  const handleDelete = (goodsId: number) => {
    deleteGoods(goodsId);
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      'available': { color: 'green', text: '可用' },
      'sold': { color: 'blue', text: '已售出' },
      'unavailable': { color: 'orange', text: '不可用' },
      'deleted': { color: 'red', text: '已删除' }
    };
    const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getTypeTag = (type: string) => {
    const typeMap = {
      'electronic': { color: 'blue', text: '电子产品' },
      'book': { color: 'green', text: '图书教材' },
      'clothing': { color: 'purple', text: '服装配饰' },
      'sports': { color: 'orange', text: '运动用品' },
      'daily': { color: 'cyan', text: '生活用品' },
      'other': { color: 'default', text: '其他' }
    };
    const config = typeMap[type as keyof typeof typeMap] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns: ColumnsType<Goods> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '商品信息',
      key: 'goods_info',
      render: (record: Goods) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
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
            {getTypeTag(record.goods_type)}
            {record.tag && <Tag>{record.tag}</Tag>}
          </div>
        </div>
      )
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => (
        <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
          ¥{price}
        </span>
      ),
      sorter: (a: Goods, b: Goods) => a.price - b.price
    },
    {
      title: '卖家',
      key: 'seller',
      width: 120,
      render: (record: Goods) => (
        <div>
          <div>{record.author_nickname}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>@{record.author_username}</div>
        </div>
      )
    },
    {
      title: '校区',
      dataIndex: 'campus_id',
      key: 'campus_id',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: getStatusTag,
      filters: [
        { text: '可用', value: 'available' },
        { text: '已售出', value: 'sold' },
        { text: '不可用', value: 'unavailable' },
        { text: '已删除', value: 'deleted' }
      ]
    },
    {
      title: '互动数据',
      key: 'interaction',
      width: 120,
      render: (record: Goods) => (
        <Space>
          <Tooltip title="点赞数">
            <span style={{ color: '#52c41a' }}>
              <LikeOutlined /> {record.likes_count}
            </span>
          </Tooltip>
          <Tooltip title="投诉数">
            <span style={{ color: '#ff4d4f' }}>
              <DislikeOutlined /> {record.complaints_count}
            </span>
          </Tooltip>
        </Space>
      )
    },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (time: string) => new Date(time).toLocaleDateString(),
      sorter: (a: Goods, b: Goods) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (record: Goods) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          <Popconfirm
            title="确定要删除这个商品吗？"
            description="删除后商品将无法恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
              loading={deleteLoading}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card title="商城管理">
        {/* 搜索和筛选 */}
        <Space style={{ marginBottom: 16, width: '100%' }} wrap>
          <Search
            placeholder="搜索商品名称或内容"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            onSearch={handleSearch}
          />
          <Select
            style={{ width: 120 }}
            placeholder="状态筛选"
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
          >
            <Option value="all">全部状态</Option>
            <Option value="available">可用</Option>
            <Option value="sold">已售出</Option>
            <Option value="unavailable">不可用</Option>
            <Option value="deleted">已删除</Option>
          </Select>
          <Select
            style={{ width: 120 }}
            placeholder="类型筛选"
            value={filters.goods_type}
            onChange={(value) => handleFilterChange('goods_type', value)}
          >
            <Option value="all">全部类型</Option>
            <Option value="electronic">电子产品</Option>
            <Option value="book">图书教材</Option>
            <Option value="clothing">服装配饰</Option>
            <Option value="sports">运动用品</Option>
            <Option value="daily">生活用品</Option>
            <Option value="other">其他</Option>
          </Select>
          <Select
            style={{ width: 120 }}
            placeholder="校区筛选"
            allowClear
            value={filters.campus_id}
            onChange={(value) => handleFilterChange('campus_id', value)}
          >
            <Option value={1}>校区1</Option>
            <Option value={2}>校区2</Option>
            <Option value={3}>校区3</Option>
          </Select>
          <InputNumber
            placeholder="最低价格"
            style={{ width: 100 }}
            value={filters.min_price}
            onChange={(value) => handleFilterChange('min_price', value)}
          />
          <InputNumber
            placeholder="最高价格"
            style={{ width: 100 }}
            value={filters.max_price}
            onChange={(value) => handleFilterChange('max_price', value)}
          />
          <Button icon={<FilterOutlined />} onClick={() => fetchGoods()}>
            刷新
          </Button>
        </Space>

        {/* 商品表格 */}
        <Table
          columns={columns}
          dataSource={goods}
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
        />
      </Card>

      {/* 商品详情模态框 */}
      <Modal
        title={
          <Space>
            <ShopOutlined />
            商品详情
          </Space>
        }
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetailModal(false)}>
            关闭
          </Button>,
          selectedGoods && (
            <Popconfirm
              key="delete"
              title="确定要删除这个商品吗？"
              onConfirm={() => {
                handleDelete(selectedGoods.id);
                setShowDetailModal(false);
              }}
            >
              <Button danger loading={deleteLoading}>
                删除商品
              </Button>
            </Popconfirm>
          )
        ]}
        width={800}
      >
        {selectedGoods && (
          <div>
            <Descriptions column={2} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="商品ID">{selectedGoods.id}</Descriptions.Item>
              <Descriptions.Item label="状态">{getStatusTag(selectedGoods.status)}</Descriptions.Item>
              <Descriptions.Item label="价格">
                <span style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: '16px' }}>
                  ¥{selectedGoods.price}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="类型">{getTypeTag(selectedGoods.goods_type)}</Descriptions.Item>
              <Descriptions.Item label="卖家">{selectedGoods.author_nickname}</Descriptions.Item>
              <Descriptions.Item label="校区ID">{selectedGoods.campus_id}</Descriptions.Item>
              <Descriptions.Item label="发布时间" span={2}>
                {new Date(selectedGoods.created_at).toLocaleString()}
              </Descriptions.Item>
              {selectedGoods.tag && (
                <Descriptions.Item label="标签" span={2}>
                  <Tag>{selectedGoods.tag}</Tag>
                </Descriptions.Item>
              )}
            </Descriptions>

            <div style={{ marginBottom: 16 }}>
              <h4>商品名称</h4>
              <p>{selectedGoods.title}</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4>商品描述</h4>
              <p style={{ whiteSpace: 'pre-wrap' }}>{selectedGoods.content}</p>
            </div>

            {selectedGoods.images && selectedGoods.images.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4>商品图片</h4>
                <Image.PreviewGroup>
                  <Space wrap>
                    {selectedGoods.images.map((img, index) => (
                      <Image
                        key={index}
                        width={120}
                        height={120}
                        style={{ objectFit: 'cover' }}
                        src={`http://localhost:5000${img}`}
                        placeholder="加载中..."
                      />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <h4>互动统计</h4>
              <Space>
                <Badge count={selectedGoods.likes_count} showZero>
                  <Button icon={<LikeOutlined />}>点赞</Button>
                </Badge>
                <Badge count={selectedGoods.complaints_count} showZero>
                  <Button icon={<DislikeOutlined />}>投诉</Button>
                </Badge>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Market;
