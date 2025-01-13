import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from "../../../contexts/ThemeContext";
import { fetchTenantList } from '../../../global/api/Tenants';
import { fetchRentDatesByLease } from '../../../global/api/RentDates';
import { fetchPayments } from '../../../global/api/Payments';

const RentTracker = () => {
  const { darkMode } = useContext(ThemeContext);
  const [tenants, setTenants] = useState([]);
  const [rentDates, setRentDates] = useState({});
  const [payments, setPayments] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch tenants
        const tenantsData = await fetchTenantList();
        setTenants(tenantsData);

        // Extract unique properties
        const uniqueProperties = [...new Set(tenantsData.map(tenant => 
          tenant.propertyId.title
        ))];
        setProperties(uniqueProperties);

        // Fetch rent dates for each tenant
        const rentDatesData = {};
        for (const tenant of tenantsData) {
          const dates = await fetchRentDatesByLease(tenant.leaseId);
          rentDatesData[tenant.leaseId] = dates;
        }
        setRentDates(rentDatesData);

        // Fetch payments
        const paymentsData = await fetchPayments();
        setPayments(paymentsData);
      } catch (error) {
        console.error('Error loading rent tracker data:', error);
      }
    };

    loadData();
  }, []);

  // Filter tenants based on selected property
  const filteredTenants = selectedProperty === 'all'
    ? tenants
    : tenants.filter(tenant => tenant.propertyId.title === selectedProperty);

  // Get next due date for a tenant
  const getNextDueDate = (tenant) => {
    const tenantRentDates = rentDates[tenant.leaseId] || [];
    return tenantRentDates.find(date => date.status === 'Upcoming');
  };

  return (
    <div className={`pt-20 pb-4 p-6 ${darkMode ? 'text-white' : 'text-black'}`}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${
          darkMode ? 'bg-gray-800' : 'bg-blue-900 text-white'
        }`}>
          <h3 className="text-sm opacity-75">Total Active Tenants</h3>
          <p className="text-2xl font-bold mt-2">{tenants.length}</p>
        </div>
        <div className={`p-4 rounded-lg ${
          darkMode ? 'bg-gray-800' : 'bg-blue-900 text-white'
        }`}>
          <h3 className="text-sm opacity-75">Pending Payments</h3>
          <p className="text-2xl font-bold mt-2">
            {Object.values(rentDates).flat().filter(date => date.status === 'Upcoming').length}
          </p>
        </div>
        <div className={`p-4 rounded-lg ${
          darkMode ? 'bg-gray-800' : 'bg-blue-900 text-white'
        }`}>
          <h3 className="text-sm opacity-75">Total Properties</h3>
          <p className="text-2xl font-bold mt-2">{properties.length}</p>
        </div>
      </div>

      {/* Property Filter */}
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

      {/* Rent Tracking Table */}
      <div className="overflow-x-auto">
        <table className={`min-w-full rounded-md shadow overflow-hidden ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <thead className={darkMode ? 'bg-gray-700' : 'bg-blue-900 text-white'}>
            <tr>
              <th className="p-4">Tenant</th>
              <th className="p-4">Property</th>
              <th className="p-4">Next Due Date</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.map(tenant => {
              const nextDueDate = getNextDueDate(tenant);
              return (
                <tr key={tenant._id} className={
                  darkMode ? 'border-gray-700' : 'border-gray-200'
                }>
                  <td className="p-4">
                    {tenant.seekerId.info.firstName} {tenant.seekerId.info.lastName}
                  </td>
                  <td className="p-4">{tenant.propertyId.title}</td>
                  <td className="p-4">
                    {nextDueDate ? new Date(nextDueDate.dueDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4">
                    ${nextDueDate ? nextDueDate.baseAmount.toFixed(2) : 'N/A'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      nextDueDate?.status === 'Paid'
                        ? 'bg-green-100 text-green-800'
                        : nextDueDate?.status === 'Overdue'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {nextDueDate ? nextDueDate.status : 'N/A'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* No Data Message */}
      {filteredTenants.length === 0 && (
        <div className={`text-center py-8 ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          No tenants found for the selected property.
        </div>
      )}
    </div>
  );
};

export default RentTracker;
