import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../global/contexts/AuthContext';
import { ThemeContext } from "../../../contexts/ThemeContext";
import { fetchLandlordMaintenanceRequests, updateMaintenanceStatus } from '../../../global/api/Maintenance';

const MaintenanceRequests = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [requests, setRequests] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRequests = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchLandlordMaintenanceRequests(user?._id);
        if (!data) {
          throw new Error('No maintenance requests data received');
        }
        
        setRequests(data);
        
        // Extract unique properties from requests
        const uniqueProperties = [...new Set(data
          .filter(request => request.propertyId && request.propertyId.title)
          .map(request => request.propertyId.title)
        )];
        setProperties(uniqueProperties);
      } catch (error) {
        console.error('Error loading maintenance requests:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
    
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className={`pt-20 pb-4 p-6 ${darkMode ? 'text-white' : 'text-black'}`}>
        <div className="text-center">Loading maintenance requests...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`pt-20 pb-4 p-6 ${darkMode ? 'text-white' : 'text-black'}`}>
        <div className="text-red-500 text-center">Error: {error}</div>
      </div>
    );
  }

  // Handle status update
  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await updateMaintenanceStatus(requestId, newStatus);
      // Update local state to reflect the change
      setRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === requestId 
            ? { ...request, status: newStatus }
            : request
        )
      );
    } catch (error) {
      console.error('Error updating maintenance status:', error);
    }
  };

  // Filter requests based on selected property
  const filteredRequests = selectedProperty === 'all'
    ? requests
    : requests.filter(request => request.propertyId.title === selectedProperty);

  return (
    <div className={`pt-20 pb-4 p-6 ${darkMode ? 'text-white' : 'text-black'}`}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${
          darkMode ? 'bg-gray-800' : 'bg-blue-900 text-white'
        }`}>
          <h3 className="text-sm opacity-75">Total Requests</h3>
          <p className="text-2xl font-bold mt-2">{requests.length}</p>
        </div>
        <div className={`p-4 rounded-lg ${
          darkMode ? 'bg-gray-800' : 'bg-blue-900 text-white'
        }`}>
          <h3 className="text-sm opacity-75">Pending Requests</h3>
          <p className="text-2xl font-bold mt-2">
            {requests.filter(r => r.status === 'Pending').length}
          </p>
        </div>
        <div className={`p-4 rounded-lg ${
          darkMode ? 'bg-gray-800' : 'bg-blue-900 text-white'
        }`}>
          <h3 className="text-sm opacity-75">Completed Requests</h3>
          <p className="text-2xl font-bold mt-2">
            {requests.filter(r => r.status === 'Completed').length}
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mb-4">
        <select 
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className={`p-2 rounded ${
            darkMode 
              ? 'bg-gray-800 text-white border-gray-700' 
              : 'bg-white text-black border-gray-300'
          }`}
        >
          <option value="all">All Properties</option>
          {properties.map(property => (
            <option key={property} value={property}>{property}</option>
          ))}
        </select>
      </div>

      {/* Maintenance Requests Grid */}
      <div className="grid gap-4">
        {filteredRequests.map(request => (
          <div key={request._id} className={`p-4 rounded-md shadow overflow-hidden ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">
                  {request.tenantId.info.firstName} {request.tenantId.info.lastName}
                </h3>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {request.propertyId.title}
                </p>
                <p className="mt-2">{request.description}</p>
                <p className={`mt-2 text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Submitted: {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
              <select
                value={request.status}
                onChange={(e) => handleStatusUpdate(request._id, e.target.value)}
                className={`p-2 rounded ${
                  darkMode 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-white text-black border-gray-300'
                }`}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            {request.images && request.images.length > 0 && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {request.images.map((image, index) => (
                  <img 
                    key={index}
                    src={image}
                    alt={`Maintenance request ${index + 1}`}
                    className="w-24 h-24 object-cover rounded"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Requests Message */}
      {filteredRequests.length === 0 && (
        <div className={`text-center py-8 ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          No maintenance requests found.
        </div>
      )}
    </div>
  );
};

export default MaintenanceRequests;
