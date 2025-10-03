import './Dashboard.scss'
import React, { useState } from 'react';
import { Card, Spin, Row, Col, Statistic, DatePicker, Space, Table, Tag, Progress, Divider } from 'antd';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { useRequest } from 'ahooks'
import api from '../../../api';
import { 
  UserOutlined,
  TeamOutlined,
  EyeOutlined,
  RobotOutlined,
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

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // 获取基础统计数据
  const { data: statsData, loading: statsLoading } = useRequest(
    () => api.get('/api/admin/stats').then(res => res.data),
    {
      onError: () => {
        // 使用模拟数据
        return {
          totalUsers: 1250,
          activeUsers: 850,
          totalPosts: 3200,
          totalGoods: 1800,
          todayVisits: 420,
          todayRegistrations: 15
        };
      }
    }
  );

  // 获取AI调用统计
  const { data: aiStats, loading: aiLoading } = useRequest(
    () => api.get('/api/admin/ai/stats').then(res => res.data),
    {
      onError: () => ({
        todayCalls: 45,
        totalCalls: 1250
      })
    }
  );

  // 获取搜索关键词
  const { data: keywordsData, loading: keywordsLoading } = useRequest(
    () => api.get('/api/admin/search-keywords', { params: { limit: 10 } }).then(res => res.data),
    {
      onError: () => ({
        keywords: [
          { keyword: "笔记本电脑", search_count: 125, created_at: "2024-01-01", updated_at: "2024-01-02" },
          { keyword: "教材", search_count: 89, created_at: "2024-01-01", updated_at: "2024-01-02" },
          { keyword: "自行车", search_count: 76, created_at: "2024-01-01", updated_at: "2024-01-02" },
          { keyword: "手机", search_count: 65, created_at: "2024-01-01", updated_at: "2024-01-02" },
          { keyword: "课件", search_count: 54, created_at: "2024-01-01", updated_at: "2024-01-02" }
        ]
      })
    }
  );

  // 获取事件统计
  const { data: eventStats, loading: eventLoading } = useRequest(
    () => api.get('/api/admin/event-stats').then(res => res.data.data),
    {
      onError: () => ({
        visit: { active_users: 150 },
        publish_goods_tag: { total_count: 45 },
        publish_post_tag: { total_count: 32 },
        favorite_goods_tag: { total_count: 89 },
        favorite_post_tag: { total_count: 67 },
        completed_transaction: { total_count: 23 },
        ad_click: { total_clicks: 234 },
        total: { total_events: 657 }
      })
    }
  );

  // 获取广告统计
  const { data: adStats, loading: adLoading } = useRequest(
    () => api.get('/api/advertisements/stats').then(res => res.data),
    {
      onError: () => ([
        { id: 1, title: "春季促销", clicks: 150 },
        { id: 2, title: "新品发布", clicks: 89 },
        { id: 3, title: "限时优惠", clicks: 45 }
      ])
    }
  );

  // 模拟趋势数据
  const visitTrendData = {
    labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    datasets: [{
      label: '访问量',
      data: [320, 450, 380, 420, 390, 280, 240],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.3,
    }],
  };

  const userTypeData = {
    labels: ['活跃用户', '普通用户', '新注册用户'],
    datasets: [{
      data: [statsData?.activeUsers || 850, (statsData?.totalUsers || 1250) - (statsData?.activeUsers || 850), statsData?.todayRegistrations || 15],
      backgroundColor: [
        '#52c41a',
        '#1890ff', 
        '#faad14'
      ],
    }],
  };

  const contentDistributionData = {
    labels: ['校园墙帖子', '商品信息'],
    datasets: [{
      data: [statsData?.totalPosts || 3200, statsData?.totalGoods || 1800],
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

  // 用户活动数据
  const userActivityData = {
    labels: ['发布商品', '发布帖子', '收藏商品', '收藏帖子', '完成交易'],
    datasets: [{
      label: '用户活动统计',
      data: [
        eventStats?.publish_goods_tag?.total_count || 0,
        eventStats?.publish_post_tag?.total_count || 0,
        eventStats?.favorite_goods_tag?.total_count || 0,
        eventStats?.favorite_post_tag?.total_count || 0,
        eventStats?.completed_transaction?.total_count || 0
      ],
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)'
      ],
      borderWidth: 1
    }]
  };

  return (
    <div className="dashboard-container">
      {/* 核心统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }} className="stats-row">
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="总用户数"
              value={statsData?.totalUsers || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<UserOutlined />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="活跃用户"
              value={eventStats?.visit?.active_users || statsData?.activeUsers || 0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<TeamOutlined />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="今日访问"
              value={statsData?.todayVisits || 0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<EyeOutlined />}
              suffix="次"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="AI调用(今日)"
              value={aiStats?.todayCalls || 0}
              valueStyle={{ color: '#722ed1' }}
              prefix={<RobotOutlined />}
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
              value={statsData?.totalPosts || 0}
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
              value={statsData?.totalGoods || 0}
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
              value={eventStats?.ad_click?.total_clicks || 0}
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
              value={eventStats?.completed_transaction?.total_count || 0}
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

        <Col xs={24} lg={8}>
          <Card title="用户活动统计">
            {eventLoading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <div style={{ height: '280px' }}>
                <Bar
                  data={userActivityData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
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
          <Card title="广告点击排行">
            {adLoading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <div style={{ height: '280px', overflowY: 'auto' }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {(adStats || []).slice(0, 5).map((ad: AdStat, index: number) => {
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
          <Card title="AI 服务统计">
            {aiLoading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <div style={{ padding: '20px 0' }}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="今日调用"
                      value={aiStats?.todayCalls || 0}
                      valueStyle={{ color: '#1890ff' }}
                      prefix={<RobotOutlined />}
                      suffix="次"
                    />
                    <Divider />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="总调用量"
                      value={aiStats?.totalCalls || 0}
                      valueStyle={{ color: '#52c41a' }}
                      prefix={<ThunderboltOutlined />}
                      suffix="次"
                    />
                    <Divider />
                  </Col>
                </Row>
                
                <div style={{ marginTop: 24 }}>
                  <h4 style={{ marginBottom: 16 }}>事件统计总览</h4>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>总事件数</span>
                      <Tag color="purple" style={{ fontSize: 14, padding: '4px 12px' }}>
                        {eventStats?.total?.total_events || 0}
                      </Tag>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>发布商品</span>
                      <Tag color="blue">{eventStats?.publish_goods_tag?.total_count || 0}</Tag>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>发布帖子</span>
                      <Tag color="cyan">{eventStats?.publish_post_tag?.total_count || 0}</Tag>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>收藏商品</span>
                      <Tag color="orange">{eventStats?.favorite_goods_tag?.total_count || 0}</Tag>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>收藏帖子</span>
                      <Tag color="gold">{eventStats?.favorite_post_tag?.total_count || 0}</Tag>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>完成交易</span>
                      <Tag color="green">{eventStats?.completed_transaction?.total_count || 0}</Tag>
                    </div>
                  </Space>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;