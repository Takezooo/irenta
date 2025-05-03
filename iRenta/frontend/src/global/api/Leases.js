import axios from "axios";
import { GetToken } from "../../global/utils/Token.js";
import { toast } from "react-toastify";

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
  const authToken = GetToken();
  try {
    // First, fetch the lease details to get property name for better file naming
    const leaseDetails = await fetchLeaseById(leaseId);
    
    const response = await axios.get(`${API_BASE_URL}/${leaseId}/pdf`, {
      responseType: "blob", // Treat the response as a binary file
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    // Ensure response has data before proceeding
    if (!response.data) {
      throw new Error("Received empty PDF data");
    }

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    
    // Create and click a link to download the file
    const link = document.createElement("a");
    link.href = url;
    
    // Create a more descriptive filename
    const propertyName = leaseDetails?.property?.name 
      ? leaseDetails.property.name.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_') 
      : 'property';
    const today = new Date().toISOString().split('T')[0];
    
    link.download = `Lease_Agreement_${propertyName}_${today}.pdf`;
    document.body.appendChild(link); // Temporarily add to document
    link.click();
    document.body.removeChild(link); // Clean up
    
    // Clean up the object URL after a delay to ensure download starts
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
    
    return true;
  } catch (error) {
    console.error("Error downloading PDF:", error);
    alert("There was a problem downloading the PDF. Please try again.");
    throw error;
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
    // Determine if updatedData is FormData or a regular object
    const isFormData = updatedData instanceof FormData;
    
    // Set headers based on data type
    const headers = {
      Authorization: `Bearer ${authToken}`,
      ...(!isFormData && { 'Content-Type': 'application/json' })
    };

    const response = await axios.put(
      `${API_BASE_URL}/${leaseId}`,
      updatedData,
      { headers }
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
    toast.success("Lease sent to Seeker successfully!");
  } catch (error) {
    console.error("Error sending lease:", error);
    toast.error("Error sending lease. Please try again.");
  }
};
