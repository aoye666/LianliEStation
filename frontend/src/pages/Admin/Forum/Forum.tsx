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
  Popconfirm,
  Tooltip,
  Badge
} from "antd";
import { 
  SearchOutlined, 
  EyeOutlined, 
  DeleteOutlined, 
  FilterOutlined,
  ExclamationCircleOutlined,
  LikeOutlined,
  DislikeOutlined
} from "@ant-design/icons";
import { useRequest } from 'ahooks';
import api from '../../../api';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

interface Post {
  id: number;
  title: string;
  content: string;
  author_id: number;
  author_username: string;
  author_name: string;  // API返回的字段名
  campus_id: number;
  status: 'active' | 'inactive' | 'deleted';
  created_at: string;
  updated_at: string;
  likes: number;  // API返回的字段名
  complaints: number;  // API返回的字段名
  comment_count: number;  // API返回的字段名
  images?: string[];
}

interface PostComment {
  id: number;
  content: string;
  author_username: string;
  author_nickname: string;
  created_at: string;
  parent_id?: number;
}

const Forum: React.FC = () => {
  const [form] = Form.useForm();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    keyword: '',
    status: 'all',
    campus_id: undefined as number | undefined
  });

  // 获取帖子列表
  const { loading, run: fetchPosts } = useRequest(
    async (params = {}) => {
      const response = await api.get('/api/forum/posts', {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          status: filters.status === 'all' ? undefined : filters.status,
          keyword: filters.keyword || undefined,
          campus_id: filters.campus_id,
          with_comments: false,
          ...params
        }
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        setPosts(data.posts || []);
        setPagination(prev => ({
          ...prev,
          total: data.total || 0
        }));
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || '获取帖子列表失败');
      }
    }
  );

  // 获取帖子详情（包含评论）
  const { loading: detailLoading, run: fetchPostDetail } = useRequest(
    async (postId: number) => {
      const response = await api.get('/api/forum/posts', {
        params: { 
          author_id: undefined,
          page: 1,
          limit: 1,
          with_comments: true 
        }
      });
      // 这里需要根据实际API调整，假设返回单个帖子的详情
      const post = response.data.posts?.find((p: Post) => p.id === postId);
      return { post, comments: [] }; // 根据实际API结构调整
    },
    {
      manual: true,
      onSuccess: (data) => {
        setSelectedPost(data.post);
        setComments(data.comments || []);
      },
      onError: (error) => {
        message.error('获取帖子详情失败');
      }
    }
  );

  // 删除帖子
  const { loading: deleteLoading, run: deletePost } = useRequest(
    async (postId: number) => {
      const response = await api.delete(`/api/admin/posts/${postId}`);
      return response.data;
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('帖子删除成功');
        fetchPosts();
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || '删除失败');
      }
    }
  );

  useEffect(() => {
    fetchPosts();
  }, [pagination.current, pagination.pageSize]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, keyword: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchPosts({ keyword: value, page: 1 });
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchPosts({ ...newFilters, page: 1 });
  };

  const handleTableChange = (paginationConfig: any) => {
    setPagination(paginationConfig);
  };

  const handleViewDetail = (post: Post) => {
    setSelectedPost(post);
    setShowDetailModal(true);
    fetchPostDetail(post.id);
  };

  const handleDelete = (postId: number) => {
    deletePost(postId);
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      'active': { color: 'green', text: '正常' },
      'inactive': { color: 'orange', text: '待审核' },
      'deleted': { color: 'red', text: '已删除' }
    };
    const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns: ColumnsType<Post> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string, record: Post) => (
        <Tooltip title={title}>
          <a onClick={() => handleViewDetail(record)}>{title}</a>
        </Tooltip>
      )
    },
    {
      title: '作者',
      key: 'author',
      width: 120,
      render: (record: Post) => (
        <div>
          <div>{record.author_name || '未知用户'}</div>
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
      render: getStatusTag
    },
    {
      title: '互动数据',
      key: 'interaction',
      width: 150,
      render: (record: Post) => (
        <Space direction="vertical" size={0}>
          <Space>
            <LikeOutlined style={{ color: '#52c41a' }} />
            <span>{record.likes || 0}</span>
            <DislikeOutlined style={{ color: '#ff4d4f' }} />
            <span>{record.complaints || 0}</span>
          </Space>
          <div style={{ fontSize: '12px', color: '#666' }}>
            评论: {record.comment_count || 0}
          </div>
        </Space>
      )
    },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (time: string) => new Date(time).toLocaleDateString()
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (record: Post) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          <Popconfirm
            title="确定要删除这个帖子吗？"
            description="删除后帖子将无法恢复"
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
      <Card title="校园墙管理">
        {/* 搜索和筛选 */}
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Search
              placeholder="搜索帖子标题或内容"
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
              <Option value="active">正常</Option>
              <Option value="inactive">待审核</Option>
              <Option value="deleted">已删除</Option>
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
          </Space>
          <Button icon={<FilterOutlined />} onClick={() => fetchPosts()}>
            刷新
          </Button>
        </Space>

        {/* 帖子表格 */}
        <Table
          columns={columns}
          dataSource={posts}
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

      {/* 帖子详情模态框 */}
      <Modal
        title="帖子详情"
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetailModal(false)}>
            关闭
          </Button>,
          selectedPost && (
            <Popconfirm
              key="delete"
              title="确定要删除这个帖子吗？"
              onConfirm={() => {
                handleDelete(selectedPost.id);
                setShowDetailModal(false);
              }}
            >
              <Button danger loading={deleteLoading}>
                删除帖子
              </Button>
            </Popconfirm>
          )
        ]}
        width={800}
      >
        {selectedPost && (
          <div>
            <Descriptions column={2} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="帖子ID">{selectedPost.id}</Descriptions.Item>
              <Descriptions.Item label="状态">{getStatusTag(selectedPost.status)}</Descriptions.Item>
              <Descriptions.Item label="作者">{selectedPost.author_name || '未知用户'}</Descriptions.Item>
              <Descriptions.Item label="校区ID">{selectedPost.campus_id}</Descriptions.Item>
              <Descriptions.Item label="发布时间" span={2}>
                {new Date(selectedPost.created_at).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginBottom: 16 }}>
              <h4>标题</h4>
              <p>{selectedPost.title}</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4>内容</h4>
              <p style={{ whiteSpace: 'pre-wrap' }}>{selectedPost.content}</p>
            </div>

            {selectedPost.images && selectedPost.images.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4>图片</h4>
                <Space>
                  {selectedPost.images.map((img, index) => (
                    <Image
                      key={index}
                      width={100}
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${img}`}
                      placeholder="加载中..."
                    />
                  ))}
                </Space>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <h4>互动统计</h4>
              <Space>
                <Badge count={selectedPost.likes || 0} showZero>
                  <Button icon={<LikeOutlined />}>点赞</Button>
                </Badge>
                <Badge count={selectedPost.complaints || 0} showZero>
                  <Button icon={<DislikeOutlined />}>投诉</Button>
                </Badge>
                <Badge count={selectedPost.comment_count || 0} showZero>
                  <Button>评论</Button>
                </Badge>
              </Space>
            </div>

            {comments.length > 0 && (
              <div>
                <h4>评论列表</h4>
                <div style={{ maxHeight: 300, overflow: 'auto' }}>
                  {comments.map(comment => (
                    <div key={comment.id} style={{ 
                      padding: 8, 
                      borderBottom: '1px solid #f0f0f0',
                      marginBottom: 8 
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                        {comment.author_nickname} (@{comment.author_username})
                      </div>
                      <div style={{ marginBottom: 4 }}>
                        {comment.content}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(comment.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Forum;
