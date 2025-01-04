import axios from "axios";
import { GetToken } from "../utils/Token";

const API_BASE_URL = "http://localhost:5000/api/reservations";

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

export const moveToRenterList = async (seekerId) => {
  const authToken = GetToken();
  try {
    await axios.post(
      `${API_BASE_URL}/move-to-renter`,
      { seekerId },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
  } catch (error) {
    console.error("Error moving seeker to renter list:", error);
  }
};
