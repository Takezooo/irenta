import axios from "axios";
import { GetToken } from "../global/utils/Token";
const API_BASE_URL = "http://localhost:5000/api/listings"; // Update with your backend API endpoint

export const fetchListings = async () => {
  try {
    const { data } = await axios.get(API_BASE_URL);
    return data;
  } catch (err) {
    console.error("Failed to fetch listings:", err);
  }
};

export const fetchSpecificList = async (id) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/${id}`);
    return data;
  } catch (err) {
    console.error("Failed to fetch listings:", err);
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
    return data;
  } catch (err) {
    console.error(err.response?.data?.message || "Error fetching listings");
  }
};

export const deleteList = async (id) => {
  const authToken = GetToken();
  try {
    await axios.delete(`http://localhost:5000/api/listings/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log("Deleted Successfully");
  } catch (err) {
    console.error(err.response?.data?.message || "Error fetching listings");
  }
};

