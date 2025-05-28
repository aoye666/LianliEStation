import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto'
import './MData.scss'

interface DashboardData {
  tDailyVisits: number;
  tActiveUsers: number;
  tProductViews: number;
  tTransactions: number;
  peakHours: { hour: string; visits: number }[];
  apiUsage: { date: string; tokens: number }[];
  searchKeywords: string[];
}

const MData = () => {
  const chartRef1 = useRef<HTMLCanvasElement>(null);
  const chartRef2 = useRef<HTMLCanvasElement>(null);
  const [data] = useState<DashboardData>({
    tDailyVisits: 2453,
    tActiveUsers: 892,
    tProductViews: 15642,
    tTransactions: 324,
    peakHours: [
      { hour: '09:00', visits: 120 },
      { hour: '12:00', visits: 450 },
      { hour: '15:00', visits: 300 },
      { hour: '18:00', visits: 680 },
    ],
    apiUsage: [
      { date: '2024-03-01', tokens: 24500 },
      { date: '2024-03-02', tokens: 31200 },
    ],
    searchKeywords: ['手机', '笔记本电脑', '耳机', '智能手表'],
  });

  useEffect(() => {
    if (chartRef1.current) {
      new Chart(chartRef1.current, {
        type: 'line',
        data: {
          labels: data.peakHours.map(h => h.hour),
          datasets: [{
            label: '访问量',
            data: data.peakHours.map(h => h.visits),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          responsive: false,
          maintainAspectRatio: false
        }
      });
    }

    if (chartRef2.current) {
      new Chart(chartRef2.current, {
        type: 'bar',
        data: {
          labels: data.apiUsage.map(u => u.date),
          datasets: [{
            label: 'API Token消耗',
            data: data.apiUsage.map(u => u.tokens),
            backgroundColor: 'rgba(54, 162, 235, 0.6)'
          }]
        },
        options: {
          responsive: false,
          maintainAspectRatio: false
        }
      });
    }
  }, [data]);

  return (
    <div className="dashboard-container">
      {/* 操作按钮 */}
      <div className="action-buttons">
        <button className="btn share-btn">分享</button>
        <button className="btn favorite-btn">收藏</button>
        <button className="btn delete-btn">删除</button>
      </div>

      {/* 指标卡片 */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>访问次数</h3>
          <div className="metric-value">{data.tDailyVisits.toLocaleString()}</div>
        </div>
        {/* 其他三个指标卡片结构类似... */}
      </div>

      {/* 图表区 */}
      <div className="charts-grid">
        <div className="chart-container">
          <h3>访问高峰时段</h3>
          <canvas ref={chartRef1} width="600" height="300"></canvas>
        </div>
        {/* 其他图表和热搜关键词区域... */}
      </div>
    </div>
  );
};

export default MData;