import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../global/contexts/AuthContext";
import { ThemeContext } from "../../contexts/ThemeContext";
import { fetchPayments, createPayment } from "../../global/api/Payments";
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
  const [errors, setErrors] = useState({
    loading: '',
    fetch: '',
    payment: '',
    general: ''
  });

  const loadPayments = async () => {
    setErrors(prev => ({...prev, loading: ''}));
    try {
      const data = await fetchPayments();
      setPayments(data);
    } catch (error) {
      setErrors(prev => ({
        ...prev, 
        loading: error.message || 'Error loading payments'
      }));
    }
  };

  const loadTenantAndRentDates = async () => {
    setErrors(prev => ({...prev, fetch: ''}));
    try {
      setIsLoading(true);
      const tenant = await getCurrentTenant();
      setTenantDetails(tenant);

      if (tenant?.rentDates) {
        setRentDates(tenant.rentDates);
      }

      const paymentsData = await fetchPayments(user?._id);
      setPayments(paymentsData);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        fetch: error.message || 'Error loading tenant data'
      }));
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

    const [formErrors, setFormErrors] = useState({
      rentDate: '',
      paidAmount: '',
      paymentMethod: '',
      referenceNumber: '',
      remarks: '',
      submit: ''
    });

    useEffect(() => {
      if (selectedRentDate) {
        setFormData((prev) => ({
          ...prev,
          paidAmount: selectedRentDate.baseAmount,
        }));
      }
    }, [selectedRentDate]);

    const validatePayment = (amount, rentDate) => {
      return amount >= rentDate.baseAmount;
    };

    const validateForm = () => {
      let newErrors = {};
      let isValid = true;

      if (!selectedRentDate) {
        newErrors.rentDate = 'Please select a rent period';
        isValid = false;
      }

      if (!formData.paidAmount) {
        newErrors.paidAmount = 'Amount is required';
        isValid = false;
      } else if (!validatePayment(formData.paidAmount, selectedRentDate)) {
        newErrors.paidAmount = `Payment amount must be at least ₱${selectedRentDate.baseAmount}`;
        isValid = false;
      }

      if (['Bank Transfer', 'GCash', 'Maya'].includes(formData.paymentMethod) 
          && !formData.referenceNumber) {
        newErrors.referenceNumber = `Reference number is required for ${formData.paymentMethod}`;
        isValid = false;
      }

      setFormErrors(prevErrors => ({...prevErrors, ...newErrors}));
      return isValid;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setFormErrors({});
      
      try {
        if (!validateForm()) {
          return;
        }

        const paymentData = {
          rentDateId: selectedRentDate._id,
          tenantId: user._id,
          paidAmount: Number(formData.paidAmount),
          paymentMethod: formData.paymentMethod,
          referenceNumber: formData.referenceNumber || '',
          remarks: formData.remarks || '',
          paymentDate: new Date().toISOString()
        };

        await createPayment(paymentData);
        setShowPaymentModal(false);
        await Promise.all([loadPayments(), loadTenantAndRentDates()]);
      } catch (error) {
        setFormErrors(prev => ({
          ...prev,
          submit: error.message || 'Failed to process payment'
        }));
      }
    };

    if (rentDates.length === 0) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-lg`}>
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
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-lg w-96`}>
          <h3 className="text-lg font-semibold mb-4">Make Payment</h3>
          
          {formErrors.submit && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
              {formErrors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Rent Period</label>
              <select
                value={selectedRentDate?._id || ""}
                onChange={(e) => {
                  const selected = rentDates.find(
                    (date) => date._id === e.target.value
                  );
                  setSelectedRentDate(selected);
                  setFormErrors(prev => ({...prev, rentDate: ''}));
                }}
                className={`w-full p-2 rounded border ${
                  formErrors.rentDate ? 'border-red-500' :
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                }`}
                required
              >
                <option value="">Select rent period</option>
                {rentDates
                  .filter((date) => !date.payment && date.status !== "Paid")
                  .map((date) => (
                    <option key={date._id} value={date._id}>
                      {`${new Date(date.rentDate).toLocaleDateString()} - ${new Date(
                        date.endDate
                      ).toLocaleDateString()}`}
                      {` (₱${date.baseAmount.toFixed(2)})`}
                    </option>
                  ))}
              </select>
              {formErrors.rentDate && (
                <p className="text-red-500 text-xs mt-1">{formErrors.rentDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">Amount to Pay</label>
              <input
                type="number"
                value={formData.paidAmount}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    paidAmount: parseFloat(e.target.value),
                  });
                  setFormErrors(prev => ({...prev, paidAmount: ''}));
                }}
                className={`w-full p-2 rounded border ${
                  formErrors.paidAmount ? 'border-red-500' :
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                }`}
                required
              />
              {formErrors.paidAmount && (
                <p className="text-red-500 text-xs mt-1">{formErrors.paidAmount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => {
                  setFormData({ ...formData, paymentMethod: e.target.value });
                  setFormErrors(prev => ({...prev, paymentMethod: ''}));
                }}
                className={`w-full p-2 rounded border ${
                  formErrors.paymentMethod ? 'border-red-500' :
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
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
                onChange={(e) => {
                  setFormData({ ...formData, referenceNumber: e.target.value });
                  setFormErrors(prev => ({...prev, referenceNumber: ''}));
                }}
                className={`w-full p-2 rounded border ${
                  formErrors.referenceNumber ? 'border-red-500' :
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                }`}
              />
              {formErrors.referenceNumber && (
                <p className="text-red-500 text-xs mt-1">{formErrors.referenceNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => {
                  setFormData({ ...formData, remarks: e.target.value });
                  setFormErrors(prev => ({...prev, remarks: ''}));
                }}
                className={`w-full p-2 rounded border ${
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
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
    <div className={`rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"} p-6 shadow`}>
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
