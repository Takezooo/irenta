// frontend/src/components/OwnerDashboard/ManageTenants/ManageTenant.js
import React, { useState, useEffect, useContext } from "react";
import { Waitlist } from "./WaitList";
import { ThemeContext } from "../../../contexts/ThemeContext";
import { fetchTenantList } from "../../../global/api/Tenants";
import { fetchRentDatesByLease } from "../../../global/api/RentDates";
import { fetchPayments } from "../../../global/api/Payments";
import { fetchSpecificList } from "../../../global/api/Listings";

const TenantsList = () => {
  const { darkMode } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState("current");
  const [tenants, setTenants] = useState([]);
  const [rentDates, setRentDates] = useState({});
  const [payments, setPayments] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch tenants
        const tenantsData = await fetchTenantList();
        setTenants(tenantsData);

        // Fetch properties
        const propertyData = await Promise.all(
          tenantsData.map((tenant) => fetchSpecificList(tenant.propertyId))
        );
        setProperties([...new Set(propertyData.map((prop) => prop.title))]);

        // Fetch rent dates
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
        console.error("Error loading tenant data:", error);
      }
    };

    loadData();
  }, []);

  const filteredTenants =
    selectedProperty === "all"
      ? tenants
      : tenants.filter(
          (tenant) => tenant.propertyId.title === selectedProperty
        );

  return (
    <div className="p-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div
          className={`p-4 rounded-lg ${
            darkMode ? "bg-gray-800" : "bg-blue-900 text-white"
          }`}
        >
          <h3 className="text-sm opacity-75">Total Tenants</h3>
          <p className="text-2xl font-bold mt-2">{tenants.length}</p>
        </div>
        <div
          className={`p-4 rounded-lg ${
            darkMode ? "bg-gray-800" : "bg-blue-900 text-white"
          }`}
        >
          <h3 className="text-sm opacity-75">Active Leases</h3>
          <p className="text-2xl font-bold mt-2">
            {tenants.filter((t) => t.active).length}
          </p>
        </div>
        <div
          className={`p-4 rounded-lg ${
            darkMode ? "bg-gray-800" : "bg-blue-900 text-white"
          }`}
        >
          <h3 className="text-sm opacity-75">Properties Occupied</h3>
          <p className="text-2xl font-bold mt-2">{properties.length}</p>
        </div>
        <div className="p-6 mb-2">
          <Waitlist />
        </div>
      </div>

      {/* Filter and Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className={`p-2 rounded ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-gray-900 border-gray-300"
            }`}
          >
            <option value="all">All Properties</option>
            {properties.map((property) => (
              <option key={property} value={property}>
                {property}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("current")}
            className={`px-4 py-2 rounded ${
              activeTab === "current"
                ? darkMode
                  ? "bg-blue-600"
                  : "bg-blue-900 text-white"
                : darkMode
                ? "bg-gray-700"
                : "bg-gray-200"
            }`}
          >
            Current Tenants
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 rounded ${
              activeTab === "payments"
                ? darkMode
                  ? "bg-blue-600"
                  : "bg-blue-900 text-white"
                : darkMode
                ? "bg-gray-700"
                : "bg-gray-200"
            }`}
          >
            Payment History
          </button>
        </div>
      </div>

      {/* Tenants Table */}
      {activeTab === "current" && (
        <div
          className={`rounded-lg overflow-hidden shadow ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <table className="min-w-full">
            <thead
              className={darkMode ? "bg-gray-700" : "bg-blue-900 text-white"}
            >
              <tr>
                <th className="px-6 py-3 text-left">Tenant</th>
                <th className="px-6 py-3 text-left">Property</th>
                <th className="px-6 py-3 text-left">Move In Date</th>
                <th className="px-6 py-3 text-left">Lease End Date</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTenants.map((tenant) => (
                <tr key={tenant._id}>
                  <td className="px-6 py-4">
                    {tenant.seekerId.info.firstName}{" "}
                    {tenant.seekerId.info.lastName}
                  </td>
                  <td className="px-6 py-4">{tenant.propertyId.title}</td>
                  <td className="px-6 py-4">
                    {new Date(tenant.movedInDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(
                      tenant.leaseId.contractDetails.endDate
                    ).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        tenant.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {tenant.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment History */}
      {activeTab === "payments" && (
        <div
          className={`rounded-lg overflow-hidden shadow ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <table className="min-w-full">
            <thead
              className={darkMode ? "bg-gray-700" : "bg-blue-900 text-white"}
            >
              <tr>
                <th className="px-6 py-3 text-left">Tenant</th>
                <th className="px-6 py-3 text-left">Property</th>
                <th className="px-6 py-3 text-left">Payment Date</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td className="px-6 py-4">
                    {payment.tenantId.seekerId.info.firstName}{" "}
                    {payment.tenantId.seekerId.info.lastName}
                  </td>
                  <td className="px-6 py-4">{payment.propertyId.title}</td>
                  <td className="px-6 py-4">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">${payment.paidAmount}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        payment.status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TenantsList;
