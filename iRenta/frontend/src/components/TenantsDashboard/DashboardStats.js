import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from "../../global/contexts/AuthContext";
import { ThemeContext } from '../../contexts/ThemeContext';
import { getCurrentTenant } from '../../global/api/Tenants';
import { fetchRentDatesByLease } from '../../global/api/RentDates';
import { fetchLeaseById } from '../../global/api/Leases';
import { fetchPayments } from '../../global/api/Payments';
import { fetchTenantMaintenanceRequests } from '../../global/api/Maintenance';

const DashboardStats = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [stats, setStats] = useState({
    nextPayment: { amount: 0, dueDate: '' },
    maintenanceRequests: { total: 0, pending: 0 },
    leaseStatus: { start: '', end: '', daysRemaining: 0 }
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Get current tenant data
        const tenantData = await getCurrentTenant();
        if (!tenantData) return;

        // Get lease details
        const maintenanceData = await fetchTenantMaintenanceRequests(user._id);
        const leaseData = await fetchLeaseById(tenantData.leaseId._id);

        if (leaseData) {
          const endDate = new Date(leaseData.contractDetails.endDate);
          const today = new Date();
          const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

          // Get rent dates
          const rentDates = await fetchRentDatesByLease(tenantData.leaseId._id);
          const nextRentDate = rentDates.find(
            date => 
              (date.status === "Upcoming" || 
               date.status === "Pending" || 
               date.status === "Confirmed") && 
              new Date(date.dueDate) > today
          );
          // Get payments
          const payments = await fetchPayments(user?._id);
          
          setStats({
            nextPayment: {
              amount: nextRentDate ? nextRentDate.baseAmount : 0,
              dueDate: nextRentDate?.dueDate || ''
            },
            maintenanceRequests: {
              total: maintenanceData?.length || 0,
              pending: maintenanceData?.filter(req => req.status === 'Pending').length || 0
            },
            leaseStatus: {
              start: leaseData.contractDetails.startDate,
              end: leaseData.contractDetails.endDate,
              daysRemaining
            }
          });

          // Set recent activity
          const activities = [
            ...payments.map(payment => ({
              type: 'payment',
              date: payment.date,
              description: `Rent payment ${payment.status}`
            })),
            ...maintenanceData.map(req => ({
              type: 'maintenance',
              date: req.createdAt,
              description: `Maintenance request: ${req.title}`
            }))
          ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

          setRecentActivity(activities);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadDashboardData();
  }, []);
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h3 className="text-lg font-semibold mb-2">Next Payment</h3>
          <p className="text-2xl font-bold">₱{stats.nextPayment.amount}</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Due on {stats.nextPayment.dueDate ? new Date(stats.nextPayment.dueDate).toLocaleDateString() : 'N/A'}
          </p>
        </div>

        <div className={`rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h3 className="text-lg font-semibold mb-2">Maintenance</h3>
          <p className="text-2xl font-bold">{stats.maintenanceRequests.pending}</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Pending requests
          </p>
        </div>

        <div className={`rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h3 className="text-lg font-semibold mb-2">Lease Status</h3>
          <p className="text-2xl font-bold">{stats.leaseStatus.daysRemaining} days</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Remaining on lease
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{activity.description}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {new Date(activity.date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm
                  ${activity.type === 'payment' ? 'bg-green-100 text-green-800' :
                    activity.type === 'maintenance' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'}`}>
                  {activity.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
