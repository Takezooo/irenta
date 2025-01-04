import axios from "axios";
import { GetToken } from "../utils/Token.js";

const API_BASE_URL = "http://localhost:5000/api/terms";

// Fetch all templates
export const fetchTermsTemplates = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch terms templates:", error);
    throw error;
  }
};

// Create a new terms template
export const createTermsTemplate = async (data) => {
  const authToken = GetToken();
  try {
    const response = await axios.post(`${API_BASE_URL}/`, data, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to create terms template:", error);
    throw error;
  }
};

export const updateTermsTemplate = async (id, updatedData) => {
  const authToken = GetToken();
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, updatedData, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating terms template:", error);
    throw error;
  }
};

export const attachTermsToListing = async (payload) => {
  const authToken = GetToken();
  try {
    const response = await axios.post(`${API_BASE_URL}/attach-terms`, payload, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to attach terms to listing:", error);
    throw error;
  }
};
