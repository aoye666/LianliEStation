import './Dashboard.scss'
import React, { useState } from 'react';
import { Card, Spin, Row, Col, Statistic, DatePicker, Space, Table, Tag, Progress } from 'antd';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { useRequest } from 'ahooks'
import api from '../../../api';
import { 
  UserOutlined,
  TeamOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  ShoppingOutlined,
  MessageOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

interface KeywordData {
  keyword: string;
  search_count: number;
  created_at: string;
  updated_at: string;
}

interface AdStat {
  id: number;
  title: string;
  clicks: number;
}

interface StatsData {
  visit: number;
  users: number;
  posts: number;
  goods: number;
  banned_users: number;
  violation: number;
  publish_goods_tag: Record<string, number>;
  favorite_goods_tag: Record<string, number>;
  publish_post_tag: Record<string, number>;
  favorite_post_tag: Record<string, number>;
  completed_transaction: number;
  membership: number;
  ad_click: number;
  ad_add: number;
  recent_7_days: {
    visit: number;
    active_users: number;
    completed_transaction: number;
    membership: number;
    ad_click: number;
    ad_add: number;
    register: number;
    goods: number;
    posts: number;
    publish_goods_tag: Record<string, number>;
    favorite_goods_tag: Record<string, number>;
    publish_post_tag: Record<string, number>;
    favorite_post_tag: Record<string, number>;
    daily_records: Array<{
      date: string;
      visit: number;
      ad_click: number;
      completed_transaction: number;
      register: number;
      goods: number;
      posts: number;
      membership: number;
    }>;
  };
}

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // 获取基础统计数据
  const { data: statsResponse, loading: statsLoading } = useRequest(
    () => api.get('/api/admin/stats').then(res => res.data)
  );

  const stats = statsResponse?.data as StatsData | undefined;
  const recent7Days = stats?.recent_7_days;

  // 获取搜索关键词
  const { data: keywordsData, loading: keywordsLoading } = useRequest(
    () => api.get('/api/admin/search-keywords', { params: { limit: 10 } }).then(res => res.data)
  );

  // 获取广告列表（用于统计）
  const { data: adListData, loading: adLoading } = useRequest(
    () => api.get('/api/advertisements/list').then(res => res.data)
  );

  // 从广告列表中提取统计数据
  const adStats = adListData?.advertisements?.map((ad: any) => ({
    id: ad.id,
    title: ad.title,
    clicks: ad.clicks || 0
  })).sort((a: any, b: any) => b.clicks - a.clicks) || [];

  // 近7天访问趋势数据
  const visitTrendData = {
    labels: recent7Days?.daily_records?.map(r => dayjs(r.date).format('MM-DD')) || [],
    datasets: [{
      label: '访问量',
      data: recent7Days?.daily_records?.map(r => r.visit) || [],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.3,
    }],
  };

  const userTypeData = {
    labels: ['活跃用户', '普通用户'],
    datasets: [{
      data: [
        recent7Days?.active_users || 0,
        (stats?.users || 0) - (recent7Days?.active_users || 0)
      ],
      backgroundColor: [
        '#52c41a',
        '#1890ff'
      ],
    }],
  };

  const contentDistributionData = {
    labels: ['校园墙帖子', '商品信息'],
    datasets: [{
      data: [stats?.posts || 0, stats?.goods || 0],
      backgroundColor: [
        '#722ed1',
        '#13c2c2'
      ],
    }],
  };

  const keywordColumns = [
    {
      title: '排名',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => (
        <Tag color={index < 3 ? 'gold' : 'default'}>{index + 1}</Tag>
      )
    },
    {
      title: '关键词',
      dataIndex: 'keyword',
      key: 'keyword',
    },
    {
      title: '搜索次数',
      dataIndex: 'search_count',
      key: 'search_count',
      sorter: (a: KeywordData, b: KeywordData) => b.search_count - a.search_count,
      render: (count: number) => <Tag color="blue">{count}</Tag>
    },
    {
      title: '最后搜索',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (time: string) => dayjs(time).format('MM-DD HH:mm')
    }
  ];

  // 发布商品标签统计
  const publishGoodsTagData = {
    labels: Object.keys(stats?.publish_goods_tag || {}),
    datasets: [{
      label: '发布商品标签',
      data: Object.values(stats?.publish_goods_tag || {}),
      backgroundColor: 'rgba(255, 99, 132, 0.6)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    }]
  };

  // 发布帖子标签统计
  const publishPostTagData = {
    labels: Object.keys(stats?.publish_post_tag || {}),
    datasets: [{
      label: '发布帖子标签',
      data: Object.values(stats?.publish_post_tag || {}),
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };

  return (
    <div className="dashboard-container">
      {/* 核心统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }} className="stats-row">
        <Col xs={24} sm={12} md={8}>
          <Card hoverable>
            <Statistic
              title="总用户数"
              value={stats?.users || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<UserOutlined />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable>
            <Statistic
              title="近7天活跃用户"
              value={recent7Days?.active_users || 0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<TeamOutlined />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable>
            <Statistic
              title="总访问量"
              value={stats?.visit || 0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<EyeOutlined />}
              suffix="次"
            />
          </Card>
        </Col>
      </Row>

      {/* 内容统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }} className="stats-row">
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="校园墙帖子"
              value={stats?.posts || 0}
              valueStyle={{ color: '#722ed1' }}
              prefix={<MessageOutlined />}
              suffix="条"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="商品信息"
              value={stats?.goods || 0}
              valueStyle={{ color: '#13c2c2' }}
              prefix={<ShoppingOutlined />}
              suffix="件"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="广告点击量"
              value={stats?.ad_click || 0}
              valueStyle={{ color: '#faad14' }}
              prefix={<BulbOutlined />}
              suffix="次"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="完成交易"
              value={stats?.completed_transaction || 0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<ThunderboltOutlined />}
              suffix="笔"
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 - 第一行 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }} className="charts-row">
        <Col xs={24} lg={16}>
          <Card title="访问趋势">
            {statsLoading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <div style={{ height: '300px' }}>
                <Line
                  data={visitTrendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            )}
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="用户分布">
            {statsLoading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pie
                  data={userTypeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      },
                    },
                  }}
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 图表区域 - 第二行 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }} className="charts-row">
        <Col xs={24} lg={8}>
          <Card title="内容分布">
            {statsLoading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Doughnut
                  data={contentDistributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      },
                    },
                  }}
                />
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="广告点击排行">
            {adLoading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <div style={{ height: '280px', overflowY: 'auto' }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {(adStats || []).slice(0, 8).map((ad: AdStat, index: number) => {
                    const maxClicks = Math.max(...(adStats || []).map((a: AdStat) => a.clicks), 1);
                    const percent = (ad.clicks / maxClicks) * 100;
                    return (
                      <div key={ad.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Space>
                            <Tag color={index < 3 ? 'gold' : 'default'}>{index + 1}</Tag>
                            <span style={{ fontWeight: 500 }}>{ad.title}</span>
                          </Space>
                          <Tag color="blue">{ad.clicks} 次</Tag>
                        </div>
                        <Progress 
                          percent={Math.round(percent)} 
                          showInfo={false}
                          strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                          }}
                        />
                      </div>
                    );
                  })}
                  {(!adStats || adStats.length === 0) && (
                    <div style={{ textAlign: 'center', color: '#999', padding: '50px 0' }}>
                      暂无广告数据
                    </div>
                  )}
                </Space>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 图表区域 - 第三行：标签统计（并列布局）*/}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }} className="charts-row">
        <Col xs={24} lg={12}>
          <Card title="发布商品标签统计">
            {statsLoading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <div style={{ height: '320px', overflowX: 'auto' }}>
                <Bar
                  data={publishGoodsTagData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'x' as const,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      x: {
                        ticks: {
                          autoSkip: false,
                          maxRotation: 45,
                          minRotation: 45
                        }
                      },
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="发布帖子标签统计">
            {statsLoading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <div style={{ height: '320px', overflowX: 'auto' }}>
                <Bar
                  data={publishPostTagData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'x' as const,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      x: {
                        ticks: {
                          autoSkip: false,
                          maxRotation: 45,
                          minRotation: 45
                        }
                      },
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 详细数据表格行 */}
      <Row gutter={[16, 16]} className="charts-row">
        <Col xs={24} lg={12}>
          <Card 
            title="热门搜索关键词" 
            extra={
              <Space>
                <RangePicker 
                  size="small"
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                />
              </Space>
            }
          >
            {keywordsLoading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <Table
                className="keyword-table"
                columns={keywordColumns}
                dataSource={keywordsData?.keywords || []}
                pagination={false}
                size="small"
                scroll={{ y: 350 }}
                rowKey="keyword"
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="近7天统计概览">
            {statsLoading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600 }}>统计项</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 600 }}>数值</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px 8px' }}>访问量</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <Tag color="blue">{recent7Days?.visit || 0}</Tag>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px 8px' }}>注册用户</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <Tag color="green">{recent7Days?.register || 0}</Tag>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px 8px' }}>发布商品</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <Tag color="cyan">{recent7Days?.goods || 0}</Tag>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px 8px' }}>发布帖子</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <Tag color="purple">{recent7Days?.posts || 0}</Tag>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px 8px' }}>完成交易</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <Tag color="gold">{recent7Days?.completed_transaction || 0}</Tag>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px 8px' }}>广告点击</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <Tag color="orange">{recent7Days?.ad_click || 0}</Tag>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 8px' }}>会员开通</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <Tag color="magenta">{recent7Days?.membership || 0}</Tag>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;