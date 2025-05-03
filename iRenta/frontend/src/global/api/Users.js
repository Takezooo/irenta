// for users interactions such as edit profile, etc.
import axios from "axios";
import { GetToken } from "../utils/Token";

const API_BASE_URL = "https://irenta-production.up.railway.app/api/users"; // Update with your backend API endpoint

export const fetchUserData = async (id, auth) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${auth}`,
      },
    });
    return data;
  } catch (err) {
    if (err.response?.status === 401) {
      console.error("Invalid or expired token. Logging out.");
    }
    console.error(err.response?.data?.message || "Error fetching user data");
    return null;
  }
};

export const fetchOwnerData = async (id) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/prop-owner/${id}`);
    return data;
  } catch (err) {
    console.error(err.response?.data?.message || "Error fetching user data");
    return null;
  }
};

export const toggleLike = async (listingId) => {
  const authToken = GetToken();

  try {
    const response = await axios.post(
      `${API_BASE_URL}/toggle-like`,
      { listingId },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data.likedListings; // Return updated liked listings
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};

export const updateUserData = async (id, updatedData) => {
  const authToken = GetToken();

  console.log("API URL:", `${API_BASE_URL}/${id}`);
  console.log("Updated Data:", updatedData);

  try {
    const response = await axios.patch(`${API_BASE_URL}/${id}`, updatedData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user data:", error.response?.data || error);
    throw error;
  }
};
