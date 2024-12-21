import axios from "axios";
import { GetToken } from "../global/utils/Token.js";

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
