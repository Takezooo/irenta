import axios from 'axios';

const API_BASE_URL = "http://localhost:5000/api/payments";

export const fetchPayments = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw error;
  }
};

export const createPayment = async (paymentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/add`, paymentData);
    return response.data;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

export const updatePaymentStatus = async (paymentId, status) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/update-status`, {
      paymentId,
      status
    });
    return response.data;
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
};
