import axios from 'axios';
import { GetToken } from '../utils/Token';

const API_BASE_URL = "https://irenta-production.up.railway.app/api/payments";

export const fetchPayments = async (tenantId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${tenantId}`);
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

export const fetchLandlordPayments = async (landlordId) => {
  const authToken = GetToken();
  try {
    const response = await axios.get(`${API_BASE_URL}/landlord-payments/${landlordId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching landlord payments:", error);
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

