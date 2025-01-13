import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import { fetchTenantMaintenanceRequests, createMaintenanceRequest } from '../../global/api/Maintenance';

const MaintenanceRequests = () => {
  const { darkMode } = useContext(ThemeContext);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRequest, setNewRequest] = useState({ description: '', images: [] });

  useEffect(() => {
    loadMaintenanceRequests();
  }, []);

  const loadMaintenanceRequests = async () => {
    try {
      const tenantId = "current-tenant-id"; // Get from auth context
      const data = await fetchTenantMaintenanceRequests(tenantId);
      setRequests(data);
    } catch (error) {
      console.error('Error loading maintenance requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMaintenanceRequest(newRequest);
      loadMaintenanceRequests();
      setNewRequest({ description: '', images: [] });
    } catch (error) {
      console.error('Error creating maintenance request:', error);
    }
  };

  return (
    <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 shadow`}>
      {/* New Request Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <h3 className="text-lg font-semibold mb-4">New Maintenance Request</h3>
        <textarea
          value={newRequest.description}
          onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
          className={`w-full p-3 rounded-lg border ${
            darkMode
              ? 'bg-gray-700 text-gray-300 border-gray-600'
              : 'bg-white text-gray-800 border-gray-300'
          }`}
          placeholder="Describe the issue..."
        />
        <button
          type="submit"
          className={`mt-4 px-4 py-2 rounded-lg ${
            darkMode
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          Submit Request
        </button>
      </form>

      {/* Requests List */}
      <div className="space-y-4">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          requests.map((request) => (
            <div
              key={request._id}
              className={`p-4 rounded-lg border ${
                darkMode
                  ? 'border-gray-700 bg-gray-700'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <p className="font-semibold">{request.description}</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Status: {request.status}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Submitted: {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MaintenanceRequests;
