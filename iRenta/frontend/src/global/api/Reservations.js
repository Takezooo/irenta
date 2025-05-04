import axios from "axios";
import { GetToken } from "../utils/Token";

const API_BASE_URL = "https://irenta-production.up.railway.app/api/reservations";

export const createReservation = async (formData) => {
  const authToken = GetToken();
  try {
    await axios.post(
      `${API_BASE_URL}/create`,
      formData,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
  } catch (error) {
    console.error(
      "Error creating reservation:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateReservationStatus = async (reservationId, status) => {
  const authToken = GetToken();
  try {
    await axios.put(
      `${API_BASE_URL}/update-status`,
      { reservationId, status },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
  } catch (error) {
    console.error("Error updating reservation status:", error);
  }
};

export const fetchReservationById = async (reservationId) => {
  const authToken = GetToken();

  try {
    const response = await axios.get(`${API_BASE_URL}/${reservationId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return response.data; // Returns the reservation object
  } catch (error) {
    console.error("Error fetching reservation:", error.response?.data || error.message);
    throw error;
  }
};

export const checkUserReservation = async (propertyId) => {
  const authToken = GetToken();
  try {
    const response = await axios.get(
      `${API_BASE_URL}/check-user-reservation`, 
      {
        params: { propertyId },
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error checking user reservation status:", error.response?.data || error.message);
    return { hasReservation: false };
  }
};

export const fetchSeekersWithReservations = async () => {
  const authToken = GetToken();
  try {
    const response = await axios.get(
      `https://irenta-production.up.railway.app/api/reservations/seekers`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching seekers with reservations:", error.response?.data || error.message);
    throw error;
  }
};