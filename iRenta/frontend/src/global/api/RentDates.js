import axios from 'axios';

const API_BASE_URL = "http://localhost:5000/api/rentdates";

export const fetchRentDatesByLease = async (leaseId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/lease/${leaseId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching rent dates:", error);
    throw error;
  }
};
