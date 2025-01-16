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

  useEffect(() => {
    const fetchData = async () => {
      const listingsData = await fetchOwnerListings();
      const tenantsData = await fetchTenantList();
      const maintenanceData = await fetchLandlordMaintenanceRequests(user?._id);
      const paymentsData = await fetchLandlordPayments(user?._id);

      setListings(listingsData || []);
      setTenants(tenantsData || []);
      setMaintenance(maintenanceData || []);
      setPayments(paymentsData || []);
      console.log(paymentsData);
    };

    fetchData();
  }, []);

  // Calculate payment stats
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.paidAmount, 0);
  const pendingPayments = payments.filter(payment => payment.status === 'pending').length;

  const calculateMonthlyRevenue = (payments) => {
    const monthlyTotals = new Array(6).fill(0); // For 6 months (Jan to Jun)
    
    payments.forEach(payment => {
      if (payment.status === 'Confirmed') {
        const paymentDate = new Date(payment.paymentDate);
        const month = paymentDate.getMonth();
        if (month < 6) {
          monthlyTotals[month] += payment.paidAmount;
        }
      }
    });
    
    return monthlyTotals;
  };

  // Prepare data for payment trends chart
  const paymentChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Monthly Revenue',
      data: calculateMonthlyRevenue(payments),
      borderColor: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(59, 130, 246, 0.8)',
      tension: 0.1
    }]
  };

  const chartOptions = {
    responsive: true,
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
    <div className={`pt-20 pb-4 flex flex-col gap-4 ${
      darkMode ? "bg-gray-900 text-white" : "bg-gray-200 text-black"
    }`}>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-4">
        <div className={`p-4 rounded-lg shadow ${
          darkMode ? "bg-gray-800" : "bg-blue-900 text-white"
        }`}>
          <h3>Active Listings</h3>
          <h1 className="text-3xl font-bold">{listings.length}</h1>
        </div>

        <div className={`p-4 rounded-lg shadow ${
          darkMode ? "bg-gray-800" : "bg-blue-900 text-white"
        }`}>
          <h3>Total Tenants</h3>
          <h1 className="text-3xl font-bold">{tenants.length}</h1>
        </div>

        <div className={`p-4 rounded-lg shadow ${
          darkMode ? "bg-gray-800" : "bg-blue-900 text-white"
        }`}>
          <h3>Pending Maintenance</h3>
          <h1 className="text-3xl font-bold">
            {maintenance.filter(req => req.status === 'Pending').length}
          </h1>
        </div>

        <div className={`p-4 rounded-lg shadow ${
          darkMode ? "bg-gray-800" : "bg-blue-900 text-white"
        }`}>
          <h3>Total Revenue</h3>
          <h1 className="text-3xl font-bold">₱{totalRevenue.toFixed(2)}</h1>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
        <div className={`p-4 rounded-lg shadow ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <h3 className="mb-4">Payment Trends</h3>
          <Line data={paymentChartData} options={chartOptions} />
        </div>

        <div className={`p-4 rounded-lg shadow ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <h3 className="mb-4">Recent Activity</h3>
          {/* list of recent activities */}
          <div className="space-y-2">
            {maintenance.slice(0, 5).map((req, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>Maintenance Request: {req.description}</span>
                <span className={`px-2 py-1 rounded ${
                  req.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'
                }`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
