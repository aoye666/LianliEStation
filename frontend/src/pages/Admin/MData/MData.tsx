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

  return (
    <div className="dashboard-container">
      
    </div>
  );
};

export default MData;