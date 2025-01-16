import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../global/contexts/AuthContext";
import { ThemeContext } from "../../contexts/ThemeContext";
import { fetchPayments, createPayment } from "../../global/api/Payments";
import { fetchRentDatesByLease } from "../../global/api/RentDates";
import { getCurrentTenant } from "../../global/api/Tenants";

const RentPayments = () => {
  const { darkMode } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [rentDates, setRentDates] = useState([]);
  const [selectedRentDate, setSelectedRentDate] = useState(null);
  const [tenantDetails, setTenantDetails] = useState(null);

  const loadPayments = async () => {
    try {
      const data = await fetchPayments();
      setPayments(data);
    } catch (error) {
      console.error("Error loading payments:", error);
    }
  };

  const loadTenantAndRentDates = async () => {
    try {
      setIsLoading(true);
      // First fetch tenant details
      const tenant = await getCurrentTenant();
      setTenantDetails(tenant);

      if (tenant?.rentDates) {
        setRentDates(tenant.rentDates);
      }

      // Fetch payments
      const paymentsData = await fetchPayments(user?._id);
      setPayments(paymentsData);
    } catch (error) {
      console.error("Error loading tenant and rent dates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenantAndRentDates();
    loadPayments();
  }, []);
  
  const PaymentModal = () => {
    const [formData, setFormData] = useState({
      paidAmount: selectedRentDate?.baseAmount || "",
      paymentMethod: "Bank Transfer",
      referenceNumber: "",
      remarks: "",
    });

    useEffect(() => {
      if (selectedRentDate) {
        setFormData((prev) => ({
          ...prev,
          paidAmount: selectedRentDate.baseAmount,
        }));
      }
    }, [selectedRentDate]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const tenantId = user._id; // Get from auth context
        const paymentData = {
          rentDateId: formData.rentDateId,
          tenantId: tenantId,
          paidAmount: Number(formData.paidAmount),
          paymentMethod: formData.paymentMethod,
          referenceNumber: formData.referenceNumber || '',
          remarks: formData.remarks || '',
          paymentDate: new Date().toISOString()
        };
    
        console.log('Submitting payment data:', paymentData);
    
        const response = await createPayment(paymentData);
        console.log('Payment response:', response);
        setShowPaymentModal(false);
        loadPayments();
        loadTenantAndRentDates();
      } catch (error) {
        console.error("Error submitting payment:", error);
      }
    };

    if (rentDates.length === 0) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } p-6 rounded-lg`}
          >
            <p>No rent dates available</p>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="mt-4 px-4 py-2 rounded bg-blue-500 text-white"
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div
          className={`${
            darkMode ? "bg-gray-800" : "bg-white"
          } p-6 rounded-lg w-96`}
        >
          <h3 className="text-lg font-semibold mb-4">Make Payment</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rent Date Selection */}
            <div>
              <label className="block text-sm mb-1">Rent Period</label>
              <select
                value={selectedRentDate?._id || ""}
                onChange={(e) => {
                  const selected = rentDates.find(
                    (date) => date._id === e.target.value
                  );
                  setSelectedRentDate(selected);
                }}
                className={`w-full p-2 rounded border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
                required
              >
                <option value="">Select rent period</option>
                {rentDates
                  .filter((date) => !date.payment && date.status !== "Paid")
                  .map((date) => (
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
            </div>
            <div>
              <label className="block text-sm mb-1">Amount to Pay</label>
              <input
                type="number"
                value={formData.paidAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paidAmount: parseFloat(e.target.value),
                  })
                }
                className={`w-full p-2 rounded border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
                required
              />
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
                className={`px-4 py-2 rounded ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
              >
                Submit Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  const calculateTotalPaid = () => {
    return payments
      .filter((payment) => payment.status === "Confirmed")
      .reduce((total, payment) => total + payment.paidAmount, 0);
  };

  const getNextPaymentDue = () => {
    const pendingPayment = payments.find(
      (payment) => payment.status === "Pending"
    );
    return pendingPayment?.toBePaid || 0;
  };

  return (
    <div
      className={`rounded-lg ${
        darkMode ? "bg-gray-800" : "bg-white"
      } p-6 shadow`}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Payment Summary</h3>
        <button
          onClick={() => setShowPaymentModal(true)}
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Make Payment
        </button>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div
          className={`p-4 rounded-lg ${
            darkMode ? "bg-gray-700" : "bg-gray-50"
          }`}
        >
          <p className="text-sm text-gray-500">Next Payment Due</p>
          <p className="text-xl font-bold">₱{getNextPaymentDue()}</p>
        </div>
        <div
          className={`p-4 rounded-lg ${
            darkMode ? "bg-gray-700" : "bg-gray-50"
          }`}
        >
          <p className="text-sm text-gray-500">Total Paid</p>
          <p className="text-xl font-bold">₱{calculateTotalPaid()}</p>
        </div>
        <div
          className={`p-4 rounded-lg ${
            darkMode ? "bg-gray-700" : "bg-gray-50"
          }`}
        >
          <p className="text-sm text-gray-500">Payment Status</p>
          <p className="text-xl font-bold text-green-500">
            {payments.some((p) => p.status === "Pending")
              ? "Pending"
              : "Current"}
          </p>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Payment History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Method</th>
                <th className="px-4 py-2 text-left">Reference</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr
                    key={payment._id}
                    className={`border-b ${
                      darkMode ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <td className="px-4 py-3">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">₱{payment.paidAmount}</td>
                    <td className="px-4 py-3">{payment.paymentMethod}</td>
                    <td className="px-4 py-3">{payment.referenceNumber}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-sm 
                        ${
                          payment.status === "Confirmed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPaymentModal && <PaymentModal />}
    </div>
  );
};

export default RentPayments;
