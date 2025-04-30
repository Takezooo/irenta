import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../global/contexts/AuthContext";
import { ThemeContext } from "../../contexts/ThemeContext";
import { fetchOwnerListings } from "../../global/api/Listings";
import { fetchTenantList } from "../../global/api/Tenants";
import { fetchLandlordMaintenanceRequests } from "../../global/api/Maintenance";
import { fetchLandlordPayments } from "../../global/api/Payments";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MainDashboard = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [listings, setListings] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [listingsData, tenantsData, maintenanceData, paymentsData] = await Promise.all([
          fetchOwnerListings(),
          fetchTenantList(),
          fetchLandlordMaintenanceRequests(user?._id),
          fetchLandlordPayments(user?._id)
        ]);
        setListings(listingsData || []);
        setTenants(tenantsData || []);
        setMaintenance(maintenanceData || []);
        setPayments(paymentsData || []);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchData();
  }, [user?._id]);

  // Calculate payment stats
  const totalRevenue = payments?.reduce((sum, payment) => sum + (payment.paidAmount || 0), 0);
  const pendingPayments = payments?.filter(payment => payment.status === 'pending').length;

  const calculateMonthlyRevenue = (payments) => {
    // Get last 6 months
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() });
    }
    const monthlyTotals = months.map(({ year, month }) => {
      const monthPayments = payments?.filter(payment => {
        if (payment.status !== 'Confirmed') return false;
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate.getFullYear() === year && paymentDate.getMonth() === month;
      });
      return monthPayments?.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
    });
    return monthlyTotals;
  };

  // Prepare data for payment trends chart
  const monthLabels = (() => {
    const now = new Date();
    const labels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleString('default', { month: 'short' }));
    }
    return labels;
  })();

  const paymentChartData = {
    labels: monthLabels,
    datasets: [{
      label: 'Monthly Revenue',
      data: calculateMonthlyRevenue(payments),
      borderColor: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(59, 130, 246, 0.8)',
      backgroundColor: darkMode ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)',
      tension: 0.1
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: darkMode ? '#fff' : '#000'
        }
      },
      x: {
        ticks: {
          color: darkMode ? '#fff' : '#000'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: darkMode ? '#fff' : '#000'
        }
      }
    }
  };

  return (
    <div className={`pt-20 pb-4 flex flex-col gap-4 min-h-screen ${
      darkMode ? "bg-gray-900 text-white" : "bg-gray-200 text-black"
    }`}>
      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {/* Error Message */}
      {error && (
        <div className="text-center text-red-500 font-semibold py-4">{error}</div>
      )}
      {/* Key Metrics */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2 md:px-4">
          <div className={`p-4 rounded-lg shadow flex flex-col items-center ${
            darkMode ? "bg-gray-800" : "bg-blue-900 text-white"
          }`}>
            <h3 className="text-base font-semibold">Active Listings</h3>
            <h1 className="text-3xl font-bold">{listings?.length ?? 0}</h1>
          </div>
          <div className={`p-4 rounded-lg shadow flex flex-col items-center ${
            darkMode ? "bg-gray-800" : "bg-blue-900 text-white"
          }`}>
            <h3 className="text-base font-semibold">Total Tenants</h3>
            <h1 className="text-3xl font-bold">{tenants?.length ?? 0}</h1>
          </div>
          <div className={`p-4 rounded-lg shadow flex flex-col items-center ${
            darkMode ? "bg-gray-800" : "bg-blue-900 text-white"
          }`}>
            <h3 className="text-base font-semibold">Pending Maintenance</h3>
            <h1 className="text-3xl font-bold">
              {maintenance?.filter(req => req.status === 'Pending').length ?? 0}
            </h1>
          </div>
          <div className={`p-4 rounded-lg shadow flex flex-col items-center ${
            darkMode ? "bg-gray-800" : "bg-blue-900 text-white"
          }`}>
            <h3 className="text-base font-semibold">Total Revenue</h3>
            <h1 className="text-3xl font-bold">₱{totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '0.00'}</h1>
          </div>
        </div>
      )}
      {/* Charts Section */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-2 md:px-4">
          <div className={`p-4 rounded-lg shadow ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
            <h3 className="mb-4 text-lg font-semibold">Payment Trends</h3>
            <div className="h-64 w-full">
              <Line data={paymentChartData} options={chartOptions} />
            </div>
          </div>
          <div className={`p-4 rounded-lg shadow ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
            <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
            {/* list of recent activities */}
            <div className="space-y-2">
              {maintenance?.slice(0, 5).map((req, index) => (
                <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span className="truncate max-w-xs">Maintenance Request: {req.description || 'N/A'}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    req.status === 'Pending' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
                  }`}>
                    {req.status}
                  </span>
                </div>
              ))}
              {maintenance?.length === 0 && (
                <div className="text-gray-400">No recent maintenance activity.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainDashboard;
