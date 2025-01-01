import axios from "axios";
import { GetToken } from "../../global/utils/Token.js";

const API_BASE_URL = "http://localhost:5000/api/contracts";

export const createContract = async (contractData) => {
    const authToken = GetToken(); // Retrieve the user's auth token
    const response = await axios.post(
      API_BASE_URL, // Pass the URL directly here
      contractData, // Send the contract data directly
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  };

export const downloadPdf = async (contractId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${contractId}/pdf`, {
      responseType: "blob", // Treat the response as a binary file
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `contract_${contractId}.pdf`; // Default file name
    link.click();
    window.URL.revokeObjectURL(url); // Clean up the object URL
  } catch (error) {
    console.error("Error downloading PDF:", error);
  }
};


export const fetchContracts = async () => {
    const authToken = GetToken(); // Retrieve the user's auth token
    try {
        const { data } = await axios.get(`${API_BASE_URL}/created`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        return data;
      } catch (err) {
        console.error(err.response?.data?.message || "Error fetching contracts");
      }
  };

  export const fetchContractById = async (contractId) => {
    const authToken = GetToken(); // Retrieve the user's authentication token
  
    try {
      const response = await axios.get(`${API_BASE_URL}/${contractId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`, // Pass the token for authentication
        },
      });
  
      return response.data; // Return the contract data
    } catch (err) {
      console.error("Error fetching contract by ID:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || "Failed to fetch contract");
    }
  };
  

  export const updateContract = async (contractId, updatedData) => {
    const authToken = GetToken();
  
    try {
      const response = await axios.put(`${API_BASE_URL}/${contractId}`, updatedData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating contract:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to update contract");
    }
  };

  export const sendContractToSeeker = async (contractId) => {
    const authToken = GetToken();
    try {
      await axios.put(
        `${API_BASE_URL}/${contractId}/send`,
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      alert("Contract sent to Seeker successfully!");
    } catch (error) {
      console.error("Error sending contract:", error);
    }
  };
  