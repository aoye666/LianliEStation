import './Dashboard.scss'
import React from 'react';
import { Card, Spin } from 'antd';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { useRequest } from 'ahooks'
import api from '../../../api';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const Dashboard: React.FC = () => {
  // 示例数据请求
  const { data: visitData, loading: loadingVisit } = useRequest(() => api.get('/api/admin/visit-stats'));
  const { data: activeUserData, loading: loadingActive } = useRequest(() => api.get('/api/admin/active-users'));
  const { data: goodsViewData, loading: loadingGoods } = useRequest(() => api.get('/api/admin/goods-views'));

  // 测试数据
  const visits = visitData || { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], counts: [120, 200, 150, 80, 70, 110, 130] };
  const activeUsers = activeUserData || { labels: ['活跃用户', '非活跃用户'], counts: [80, 20] };
  const goodsViews = goodsViewData || { labels: ['手机', '电脑', '图书', '服饰'], counts: [300, 150, 100, 80] };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      <Card title="网站访问量（日）" style={{ flex: 1, minWidth: 350 }}>
        {loadingVisit ? <Spin /> : (<></>
          // <Line
          //   data={{
          //     labels: visits.labels,
          //     datasets: [{
          //       label: '访问次数',
          //       data: visits.counts,
          //       borderColor: 'rgba(75,192,192,1)',
          //       backgroundColor: 'rgba(75,192,192,0.2)',
          //       tension: 0.3,
          //     }],
          //   }}
          //   options={{ responsive: true, plugins: { legend: { display: true } } }}
          // />
        )}
      </Card>
      <Card title="活跃用户占比" style={{ flex: 1, minWidth: 350 }}>
        {loadingActive ? <Spin /> : (<></>
          // <Pie
          //   data={{
          //     labels: activeUsers.labels,
          //     datasets: [{
          //       data: activeUsers.counts,
          //       backgroundColor: ['#36A2EB', '#FF6384'],
          //     }],
          //   }}
          //   options={{ responsive: true, plugins: { legend: { display: true } } }}
          // />
        )}
      </Card>
      <Card title="商品浏览量（分类）" style={{ flex: 1, minWidth: 350 }}>
        {loadingGoods ? <Spin /> : (<></>
          // <Bar
          //   data={{
          //     labels: goodsViews.labels,
          //     datasets: [{
          //       label: '浏览次数',
          //       data: goodsViews.counts,
          //       backgroundColor: 'rgba(255, 206, 86, 0.6)',
          //     }],
          //   }}
          //   options={{ responsive: true, plugins: { legend: { display: true } } }}
          // />
        )}
      </Card>
    </div>
  );
};

export default Dashboard;