import axios from "axios";
import { GetToken } from "../utils/Token";

const API_BASE_URL = "http://localhost:5000/api/tenants";

export const registerToWaitlist = async (data) => {
  const authToken = GetToken();
  const response = await axios.post(`${API_BASE_URL}/register`, data, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return response.data;
};

export const getCurrentTenant = async () => {
  try {
    const authToken = GetToken();
    const response = await axios.get(`${API_BASE_URL}/current`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching current tenant:", error);
    throw error;
  }
};

export const fetchWaitlist = async () => {
  const authToken = GetToken();
  const response = await axios.get(`${API_BASE_URL}/waitlist`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return response.data;
};

export const fetchTenantList = async () => {
    const authToken = GetToken();
    const response = await axios.get(`${API_BASE_URL}/tenantlist`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response.data;
  };

export const moveToTenant = async (tenantId) => {
  const authToken = GetToken();
  const response = await axios.put(
    `${API_BASE_URL}/move-to-tenant`,
    { tenantId },
    {
      headers: { Authorization: `Bearer ${authToken}` },
    }
  );
  return response.data;
};
