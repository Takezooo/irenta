import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../global/contexts/AuthContext";
import { ThemeContext } from "../../../contexts/ThemeContext";
import { fetchTenantList } from "../../../global/api/Tenants";
import { fetchRentDatesByLease } from "../../../global/api/RentDates";
import {
  fetchLandlordPayments,
  createPayment,
  updatePaymentStatus,
} from "../../../global/api/Payments";

// Payment Status Component
const PaymentStatus = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case "Pending":
        return "bg-green-100 text-green-800";
      case "Confirmed":
        return "bg-yellow-100 text-yellow-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-sm ${getStatusStyle()}`}>
      {status || "Unknown"}
    </span>
  );
};

const RentTracker = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [tenants, setTenants] = useState([]);
  const [rentDates, setRentDates] = useState({});
  const [payments, setPayments] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [errors, setErrors] = useState({
    fetch: "",
    payment: "",
    confirmation: "",
    general: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    setErrors((prev) => ({ ...prev, fetch: "" }));
    try {
      // Fetch all data in parallel
      const [tenantsData, paymentsData] = await Promise.all([
        fetchTenantList(),
        fetchLandlordPayments(user?._id),
      ]);

      if (!tenantsData || !paymentsData) {
        throw new Error("Failed to load data");
      }

      setTenants(tenantsData);
      setPayments(paymentsData);
      // Fetch rent dates for each tenant
      const rentDatesPromises = tenantsData.map((tenant) =>
        fetchRentDatesByLease(tenant.leaseId._id)
      );
      const rentDatesResults = await Promise.all(rentDatesPromises);

      const rentDatesMap = {};
      tenantsData.forEach((tenant, index) => {
        if (tenant.leaseId && tenant.leaseId._id) {
          rentDatesMap[tenant.leaseId._id] = rentDatesResults[index];
        }
      });
      setRentDates(rentDatesMap);

      // Set unique properties
      const uniqueProperties = [
        ...new Set(tenantsData.map((tenant) => tenant.propertyId.title)),
      ];
      setProperties(uniqueProperties);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        fetch: error.message || "Failed to load rent tracker data",
      }));
      console.error("Error loading rent tracker data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = async (paymentId) => {
    try {
      await updatePaymentStatus(paymentId, "Confirmed");
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        confirmation: error.message || "Failed to confirm payment",
      }));
    }
  };

  const getPaymentsForTenant = (tenantId) => {
    return payments.filter((payment) => {
      // Check both the populated and unpopulated tenantId
      const paymentTenantId = payment.tenantId?._id || payment.tenantId;
      // Convert both IDs to strings for comparison
      const paymentIdStr = String(paymentTenantId);
      const tenantIdStr = String(tenantId);
      return paymentIdStr === tenantIdStr;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tenantsData, paymentsData] = await Promise.all([
          fetchTenantList(),
          fetchLandlordPayments(user?._id),
        ]);

        if (!tenantsData || !paymentsData) {
          throw new Error("Failed to load data");
        }

        setTenants(tenantsData);
        setPayments(paymentsData);
        loadData();
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          fetch: error.message || "Error in fetchData",
        }));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  const filteredTenants =
    selectedProperty === "all"
      ? tenants
      : tenants.filter(
          (tenant) => tenant.propertyId.title === selectedProperty
        );

  const getNextDueDate = (tenant) => {
    const tenantRentDates = rentDates[tenant.leaseId._id] || [];
    return tenantRentDates.find(
      (date) =>
        date.status === "Upcoming" ||
        date.status === "Pending" ||
        date.status === "Confirmed"
    );
  };

  return (
    <div className={`pt-20 pb-4 p-6 ${darkMode ? "text-white" : "text-black"}`}>
      {errors.general && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {errors.general}
        </div>
      )}

      {errors.fetch && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {errors.fetch}
        </div>
      )}
      {/* Header with  Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Rent Tracker</h2>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div
          className={`p-4 rounded-lg ${
            darkMode ? "bg-gray-800" : "bg-blue-900 text-white"
          }`}
        >
          <h3 className="text-sm opacity-75">Total Active Tenants</h3>
          <p className="text-2xl font-bold mt-2">{tenants.length}</p>
        </div>
        <div
          className={`p-4 rounded-lg ${
            darkMode ? "bg-gray-800" : "bg-blue-900 text-white"
          }`}
        >
          <h3 className="text-sm opacity-75">Pending Payments</h3>
          <p className="text-2xl font-bold mt-2">
            {
              Object.values(rentDates)
                .flat()
                .filter((date) => date.status === "Upcoming").length
            }
          </p>
        </div>
        <div
          className={`p-4 rounded-lg ${
            darkMode ? "bg-gray-800" : "bg-blue-900 text-white"
          }`}
        >
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
              ? "bg-gray-800 text-white border-gray-700"
              : "bg-white text-black border-gray-300"
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

      {/* Rent Tracking Table */}
      <div className="overflow-x-auto">
        <table
          className={`min-w-full rounded-md shadow overflow-hidden ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <thead
            className={darkMode ? "bg-gray-700" : "bg-blue-900 text-white"}
          >
            <tr>
              <th className="p-4">Tenant</th>
              <th className="p-4">Property</th>
              <th className="p-4">Next Due Date</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.map((tenant) => {
              const nextDueDate = getNextDueDate(tenant);
              return (
                <tr
                  key={tenant._id}
                  className={darkMode ? "border-gray-700" : "border-gray-200"}
                >
                  <td className="p-4">
                    {tenant.seekerId.info.firstName}{" "}
                    {tenant.seekerId.info.lastName}
                  </td>
                  <td className="p-4">{tenant.propertyId.title}</td>
                  <td className="p-4">
                    {nextDueDate
                      ? new Date(nextDueDate.dueDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="p-4">
                    ₱{nextDueDate ? nextDueDate.baseAmount.toFixed(2) : "N/A"}
                  </td>
                  <td className="p-4">
                    {nextDueDate && (
                      <PaymentStatus status={nextDueDate.status} />
                    )}
                  </td>
                  <td className="p-4 space-x-2">
                    <button
                      onClick={() => {
                        setSelectedTenant(tenant);
                        setShowPaymentModal(true);
                      }}
                      className="px-3 py-1 rounded bg-blue-500 text-white text-sm hover:bg-blue-600"
                    >
                      Record Payment
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTenant(tenant);
                        setShowPaymentHistoryModal(true);
                      }}
                      className="px-3 py-1 rounded bg-gray-500 text-white text-sm hover:bg-gray-600"
                    >
                      View Payments
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredTenants.length === 0 && (
        <div
          className={`text-center py-8 ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          No tenants found for the selected property.
        </div>
      )}

      {errors.confirmation && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
          {errors.confirmation}
        </div>
      )}

      {showPaymentHistoryModal && (
        <PaymentHistoryModal
          selectedTenant={selectedTenant}
          payments={getPaymentsForTenant(selectedTenant.seekerId._id)}
          setShowModal={setShowPaymentHistoryModal}
          darkMode={darkMode}
          onConfirmPayment={handleConfirmPayment}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          selectedTenant={selectedTenant}
          setShowPaymentModal={setShowPaymentModal}
          darkMode={darkMode}
          rentDates={rentDates}
          // loadData={loadData}
        />
      )}
    </div>
  );
};

const PaymentHistoryModal = ({
  selectedTenant,
  payments,
  setShowModal,
  darkMode,
  onConfirmPayment,
}) => {
  const [modalErrors, setModalErrors] = useState({
    confirmation: "",
  });

  const handleConfirm = async (paymentId) => {
    setModalErrors({ confirmation: "" });
    try {
      await onConfirmPayment(paymentId);
    } catch (error) {
      setModalErrors({
        confirmation: error.message || "Failed to confirm payment",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`${
          darkMode ? "bg-gray-800" : "bg-white"
        } p-6 rounded-lg w-[800px]`}
      >
        <h3 className="text-lg font-semibold mb-4">
          Payment History - {selectedTenant?.seekerId?.info?.firstName}
        </h3>

        {modalErrors.confirmation && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
            {modalErrors.confirmation}
          </div>
        )}

        {payments && payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Date</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Method</th>
                  <th className="p-2">Reference</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="p-2">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="p-2">₱{payment.paidAmount.toFixed(2)}</td>
                    <td className="p-2">{payment.paymentMethod}</td>
                    <td className="p-2">{payment.referenceNumber || "-"}</td>
                    <td className="p-2">
                      <PaymentStatus status={payment.status} />
                    </td>
                    <td className="p-2">
                      {payment.status === "Pending" && (
                        <button
                          onClick={() => onConfirmPayment(payment._id)}
                          className="px-2 py-1 rounded bg-green-500 text-white text-sm hover:bg-green-600"
                        >
                          Confirm
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4">
            No payment records found for this tenant.
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentModal = ({
  selectedTenant,
  setShowPaymentModal,
  darkMode,
  rentDates,
}) => {
  const [formData, setFormData] = useState({
    paidAmount: "",
    paymentMethod: "Cash",
    referenceNumber: "",
    remarks: "",
    rentDateId: "",
    status: "Pending",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    rentDateId: "",
    paidAmount: "",
    paymentMethod: "",
    referenceNumber: "",
    remarks: "",
    general: "", // For general errors
  });

  const validatePayment = (amount, rentDate) => {
    return amount >= rentDate.baseAmount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let newErrors = {};

    try {
      if (!formData.rentDateId) {
        newErrors.rentDateId = "Please select a rent period";
      }

      if (
        ["Bank Transfer", "GCash", "Maya"].includes(formData.paymentMethod) &&
        !formData.referenceNumber
      ) {
        newErrors.referenceNumber = `Reference number is required for ${formData.paymentMethod}`;
      }

      const selectedRentDate = rentDates[selectedTenant.leaseId._id].find(
        (date) => date._id === formData.rentDateId
      );

      if (!validatePayment(formData.paidAmount, selectedRentDate)) {
        newErrors.paidAmount = `Payment amount must be at least ₱${selectedRentDate.baseAmount}`;
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      await createPayment({
        ...formData,
        tenantId: selectedTenant.seekerId._id,
        paymentDate: new Date().toISOString(),
      });

      setShowPaymentModal(false);
    } catch (error) {
      setErrors({
        general: error.message || "An error occurred while processing payment",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableRentDates =
    rentDates[selectedTenant?.leaseId._id]?.filter(
      (date) => date.status !== "Paid"
    ) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`${
          darkMode ? "bg-gray-800" : "bg-white"
        } p-6 rounded-lg w-96`}
      >
        <h3 className="text-lg font-semibold mb-4">
          Record Payment for {selectedTenant?.seekerId.info.firstName}
        </h3>

        {errors.general && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
              {errors.general}
            </div>
          )}
          <div>
            <label className="block text-sm mb-1">Rent Period</label>
            <select
              value={formData.rentDateId}
              onChange={(e) =>
                setFormData({ ...formData, rentDateId: e.target.value })
              }
              className={`w-full p-2 rounded border ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
              required
            >
              <option value="">Select rent period</option>
              {availableRentDates.map((date) => (
                <option key={date._id} value={date._id}>
                  {`${new Date(
                    date.rentDate
                  ).toLocaleDateString()} - ${new Date(
                    date.endDate
                  ).toLocaleDateString()}`}
                  {` (₱${date.baseAmount.toFixed(2)})`}
                </option>
              ))}
            </select>
            {errors.rentDateId && (
              <p className="text-red-500 text-xs mt-1">{errors.rentDateId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Amount</label>
            <input
              type="number"
              value={formData.paidAmount}
              onChange={(e) =>
                setFormData({ ...formData, paidAmount: Number(e.target.value) })
              }
              className={`w-full p-2 rounded border ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
              required
              min="0"
              step="0.01"
            />
            {errors.paidAmount && (
              <p className="text-red-500 text-xs mt-1">{errors.paidAmount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData({ ...formData, paymentMethod: e.target.value })
              }
              className={`w-full p-2 rounded border ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
              required
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="GCash">GCash</option>
              <option value="Maya">Maya</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Reference Number</label>
            <input
              type="text"
              value={formData.referenceNumber}
              onChange={(e) =>
                setFormData({ ...formData, referenceNumber: e.target.value })
              }
              className={`w-full p-2 rounded border ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
            />
            {errors.referenceNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.referenceNumber}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              className={`w-full p-2 rounded border ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
              rows="3"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RentTracker;
