import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/maintenance";

// Create a new maintenance request
export const createMaintenanceRequest = async (data) => {
  try {
    const response = await axios.post(API_BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error("Error creating maintenance request:", error);
    throw error;
  }
};

// Fetch maintenance requests for a tenant
export const fetchTenantMaintenanceRequests = async (tenantId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tenant/${tenantId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tenant maintenance requests:", error);
    throw error;
  }
};

// Fetch maintenance requests for a landlord
export const fetchLandlordMaintenanceRequests = async (landlordId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/landlord/${landlordId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching landlord maintenance requests:", error);
    throw error;
  }
};

// Update maintenance request status
export const updateMaintenanceStatus = async (id, status) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating maintenance request status:", error);
    throw error;
  }
};
