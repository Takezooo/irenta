import axios from "axios";
import { GetToken } from "../utils/Token";

const API_BASE_URL = "https://irenta-production.up.railway.app/api/maintenance";

export const createMaintenanceRequest = async (requestData) => {
  try {
    const authToken = GetToken();
    const response = await axios.post(API_BASE_URL, requestData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const fetchTenantMaintenanceRequests = async (tenantId) => {
  try {
    const authToken = GetToken();
    const response = await axios.get(`${API_BASE_URL}/tenant/${tenantId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchLandlordMaintenanceRequests = async (landlordId) => {
  try {
    const authToken = GetToken();
    const response = await axios.get(`${API_BASE_URL}/landlord/${landlordId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateMaintenanceStatus = async (id, status) => {
  try {
    const authToken = GetToken();
    const response = await axios.patch(
      `${API_BASE_URL}/${id}`, 
      { status },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};