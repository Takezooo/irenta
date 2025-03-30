import axios from 'axios';
import { GetToken } from '../utils/Token';

const API_BASE_URL = "http://localhost:5000/api/rentdates";

export const fetchRentDatesByLease = async (leaseId) => {
  try {
    const authToken = GetToken();
    const response = await axios.get(`${API_BASE_URL}/lease/${leaseId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching rent dates:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch rent dates');
  }
};
