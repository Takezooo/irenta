// frontend/src/components/TenantDashboard/DashboardStats.js
import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';

const DashboardStats = () => {
  const { darkMode } = useContext(ThemeContext);

  const stats = {
    nextPayment: {
      amount: 1500,
      dueDate: '2024-03-01'
    },
    maintenanceRequests: {
      total: 3,
      pending: 1
    },
    leaseStatus: {
      start: '2024-01-01',
      end: '2024-12-31',
      daysRemaining: 300
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h3 className="text-lg font-semibold mb-2">Next Payment</h3>
          <p className="text-2xl font-bold">₱{stats.nextPayment.amount}</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Due on {new Date(stats.nextPayment.dueDate).toLocaleDateString()}
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
          {[
            { type: 'payment', date: '2024-02-01', description: 'Rent payment processed' },
            { type: 'maintenance', date: '2024-01-28', description: 'Maintenance request completed' },
            { type: 'notice', date: '2024-01-25', description: 'Building maintenance notice' }
          ].map((activity, index) => (
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
