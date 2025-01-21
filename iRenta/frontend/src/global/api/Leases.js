import axios from "axios";
import { GetToken } from "../../global/utils/Token.js";

const API_BASE_URL = "https://irenta-production.up.railway.app/api/leases";

export const createLease = async (leaseData) => {
  const authToken = GetToken(); // Retrieve the user's auth token
  const response = await axios.post(
    API_BASE_URL, // Pass the URL directly here
    leaseData, // Send the lease data directly
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );
  return response.data;
};

export const downloadPdf = async (leaseId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${leaseId}/pdf`, {
      responseType: "blob", // Treat the response as a binary file
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lease_${leaseId}.pdf`; // Default file name
    link.click();
    window.URL.revokeObjectURL(url); // Clean up the object URL
  } catch (error) {
    console.error("Error downloading PDF:", error);
  }
};

export const fetchLeases = async () => {
  const authToken = GetToken(); // Retrieve the user's auth token
  try {
    const { data } = await axios.get(`${API_BASE_URL}/created`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return data;
  } catch (err) {
    console.error(err.response?.data?.message || "Error fetching leases");
  }
};

export const fetchLeaseById = async (leaseId) => {
  const authToken = GetToken(); // Retrieve the user's authentication token

  try {
    const response = await axios.get(`${API_BASE_URL}/${leaseId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`, // Pass the token for authentication
      },
    });

    return response.data; // Return the lease data
  } catch (err) {
    console.error(
      "Error fetching lease by ID:",
      err.response?.data || err.message
    );
    throw new Error(err.response?.data?.message || "Failed to fetch lease");
  }
};

export const updateLease = async (leaseId, updatedData) => {
  const authToken = GetToken();

  try {
    const response = await axios.put(
      `${API_BASE_URL}/${leaseId}`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating lease:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || "Failed to update lease");
  }
};

export const sendLeaseToSeeker = async (leaseId) => {
  const authToken = GetToken();
  try {
    await axios.put(
      `${API_BASE_URL}/${leaseId}/send-to-seeker`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    alert("Lease sent to Seeker successfully!");
  } catch (error) {
    console.error("Error sending lease:", error);
  }
};
