import axios from "axios";
import { GetToken } from "../utils/Token.js";

const API_BASE_URL = "http://localhost:5000/api/listings"; // Update with your backend API endpoint

export const fetchListings = async () => {
  try {
    const { data } = await axios.get(API_BASE_URL);
    return data; // Listings with images included
  } catch (err) {
    console.error("Failed to fetch listings:", err);
  }
};

export const fetchSpecificList = async (id) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/${id}`);
    return data; // Single listing with images included
  } catch (err) {
    console.error("Failed to fetch specific listing:", err);
  }
};

export const fetchOwnerListings = async () => {
  const authToken = GetToken();
  try {
    const { data } = await axios.get(`${API_BASE_URL}/user`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return data; // Owner's listings with images
  } catch (err) {
    console.error(err.response?.data?.message || "Error fetching listings");
  }
};

export const deleteList = async (id) => {
  const authToken = GetToken();
  try {
    await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log("Deleted Successfully");
  } catch (err) {
    console.error(err.response?.data?.message || "Error deleting listing");
  }
};

export const fetchReservedListings = async () => {
  const authToken = GetToken();

  try {
    const response = await axios.get(`${API_BASE_URL}/reserved`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (err) {
    console.error("Error fetching reserved listings:", err.response?.data || err.message);
    throw new Error(err.response?.data?.message || "Failed to fetch reserved listings");
  }
};