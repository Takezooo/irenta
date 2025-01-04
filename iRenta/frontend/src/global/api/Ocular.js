import axios from "axios";
import { GetToken } from "../utils/Token";

const API_BASE_URL = "http://localhost:5000/api/ocular";

export const scheduleOcularVisit = async (propertyId, date, time) => {
  const authToken = GetToken();
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/schedule`,
      { propertyId, date, time },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    return data;
  } catch (err) {
    console.error("Failed to schedule ocular visit:", err);
    throw err;
  }
};

export const fetchReservedDates = async (propertyId) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/reserved-dates/${propertyId}`);
    return data;
  } catch (err) {
    console.error("Failed to fetch reserved dates:", err);
    throw err;
  }
};

export const fetchReservedDatesByOwner = async (authToken) => {
  const response = await axios.get(`${API_BASE_URL}/reserved-dates-by-owner`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return response.data;
};

export const updateOcularRequest = async (ocularId, action) => {
  const authToken = GetToken();
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/update-remarks`,
      { ocularId, action },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    return data;
  } catch (err) {
    console.error("Failed to update ocular request:", err);
    throw err;
  }
};

export const checkVisitRequest = async (propertyId, userId) => {
  const authToken = GetToken();
  try {
    const { data } = await axios.get(
      `${API_BASE_URL}/check-visit-request`,
      {
        params: { propertyId, userId },
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    return data;
  } catch (err) {
    console.error("Error checking visit request:", err);
    throw err;
  }
};