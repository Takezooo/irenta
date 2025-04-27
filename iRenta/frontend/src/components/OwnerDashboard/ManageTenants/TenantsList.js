import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../global/contexts/AuthContext";
import { ThemeContext } from "../../../contexts/ThemeContext";
import { fetchTenantList } from "../../../global/api/Tenants";
import { fetchRentDatesByLease } from "../../../global/api/RentDates";
import { fetchLandlordPayments } from "../../../global/api/Payments";
import { Waitlist } from "./WaitList";

const TenantsList = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState("current");
  const [tenants, setTenants] = useState(() => {
    const saved = localStorage.getItem("tenants");
    return saved ? JSON.parse(saved) : [];
  });

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
        const propertyTitles = [
          ...new Set(tenantsData.map((tenant) => tenant.propertyId.title)),
        ];
        setProperties(propertyTitles);
        // Fetch rent dates
        const rentDatesData = {};
        for (const tenant of tenantsData) {
          const dates = await fetchRentDatesByLease(tenant.leaseId._id); // Ensure leaseId is a string
          rentDatesData[tenant.leaseId] = dates;
        }
        setRentDates(rentDatesData);

        // Fetch payments
        const paymentsData = await fetchLandlordPayments(user?._id);
        setPayments(paymentsData);
      } catch (error) {
        console.error("Error loading tenant data:", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem("tenants", JSON.stringify(tenants));
  }, [tenants]);

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
      </div>

      {/* Waitlist Section - full width */}
      <div className="mb-8">
        <Waitlist />
      </div>

      {/* Filter and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 gap-2 sm:gap-0">
        <div className="flex-1 max-w-xs w-full">
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className={`w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 ${
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
          {/* Desktop Table */}
          <table className="min-w-full hidden md:table">
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
          {/* Mobile Card Layout */}
          <div className="md:hidden flex flex-col gap-4 p-2">
            {filteredTenants.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No tenants found.</div>
            ) : (
              filteredTenants.map((tenant) => (
                <div
                  key={tenant._id}
                  className={`rounded-lg shadow border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-4"}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-lg break-words">
                      {tenant.seekerId.info.firstName} {tenant.seekerId.info.lastName}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        tenant.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {tenant.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="text-sm mb-1 break-words">
                    <span className="font-semibold">Property:</span> {tenant.propertyId.title}
                  </div>
                  <div className="text-sm mb-1">
                    <span className="font-semibold">Move In:</span> {new Date(tenant.movedInDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm mb-1">
                    <span className="font-semibold">Lease End:</span> {new Date(tenant.leaseId.contractDetails.endDate).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Payment History */}
      {activeTab === "payments" && (
        <div
          className={`rounded-lg overflow-hidden shadow ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          {/* Desktop Table */}
          <table className="min-w-full hidden md:table">
            <thead
              className={darkMode ? "bg-gray-700" : "bg-blue-900 text-white"}
            >
              <tr>
                <th className="px-6 py-3 text-left">Tenant</th>
                <th className="px-6 py-3 text-left">Payment Date</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td className="px-6 py-4">
                    {payment.tenantId?.info.firstName}{" "}
                    {payment.tenantId?.info.lastName}
                  </td>
                  {/* <td className="px-6 py-4">{payment.propertyId.title}</td> */}
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
          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-4 p-2">
            {payments.map((payment) => (
              <div
                key={payment._id}
                className={`rounded-lg shadow p-4 ${darkMode ? "bg-gray-800" : "bg-white"}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-lg">
                    {payment.tenantId?.info.firstName} {payment.tenantId?.info.lastName}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      payment.status === "Confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
                <div className="text-sm mb-1">
                  <span className="font-semibold">Payment Date:</span> {new Date(payment.paymentDate).toLocaleDateString()}
                </div>
                <div className="text-sm mb-1">
                  <span className="font-semibold">Amount:</span> ${payment.paidAmount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantsList;
