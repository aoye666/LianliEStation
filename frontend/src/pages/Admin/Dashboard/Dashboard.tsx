import './Dashboard_new.scss'
import React, { useState } from 'react';
import { Card, Spin, Row, Col, Statistic, Select, DatePicker, Space, Table, Tag } from 'antd';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { useRequest } from 'ahooks'
import api from '../../../api';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

interface StatsData {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalGoods: number;
  todayVisits: number;
  todayRegistrations: number;
}

interface KeywordData {
  keyword: string;
  search_count: number;
  created_at: string;
  updated_at: string;
}

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('week');
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
    () => api.get('/api/admin/search-keywords').then(res => res.data),
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
    },
    {
      title: '最后搜索',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (time: string) => dayjs(time).format('MM-DD HH:mm')
    }
  ];

  return (
    <div className="dashboard-container">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }} className="stats-row">
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={statsData?.totalUsers || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={statsData?.activeUsers || 0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ArrowUpOutlined />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日访问"
              value={statsData?.todayVisits || 0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ArrowUpOutlined />}
              suffix="次"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="AI调用(今日)"
              value={aiStats?.todayCalls || 0}
              valueStyle={{ color: '#722ed1' }}
              prefix={<ArrowUpOutlined />}
              suffix="次"
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }} className="charts-row">
        <Col span={12}>
          <Card 
            title="访问趋势" 
            extra={
              <Select defaultValue="week" style={{ width: 120 }} onChange={setTimeRange}>
                <Option value="week">最近一周</Option>
                <Option value="month">最近一月</Option>
                <Option value="year">最近一年</Option>
              </Select>
            }
          >
            {statsLoading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <Line
                data={visitTrendData}
                options={{
                  responsive: true,
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
            )}
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="用户分布">
            {statsLoading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <Pie
                data={userTypeData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                  },
                }}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="charts-row">
        <Col span={12}>
          <Card title="内容分布">
            {statsLoading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <Doughnut
                data={contentDistributionData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                  },
                }}
              />
            )}
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="热门搜索关键词" extra={
            <Space>
              <RangePicker 
                size="small"
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              />
            </Space>
          }>
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
                scroll={{ y: 300 }}
                rowKey="keyword"
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;