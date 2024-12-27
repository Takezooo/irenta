import axios from "axios";
import { GetToken } from "../global/utils/Token.js";

const API_BASE_URL = "http://localhost:5000/api/chats"; // Update with your backend API endpoint

export const fetchUserChats = async () => {
  const authToken = GetToken();
  try {
    const { data } = await axios.get(`${API_BASE_URL}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return data; // This will contain the list of chats
  } catch (err) {
    console.error(err.response?.data?.message || "Error fetching chats");
    throw err; // Re-throw error to handle it in the component if needed
  }
};

export const getOrCreateChat = async (recipientId, listingId) => {
  const authToken = GetToken();

  try {
    const { data } = await axios.post(
      `${API_BASE_URL}`,
      { recipientId, listingId },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error in getOrCreateChat API call:", error);
    throw error;
  }
};
  
export const sendMessage = async (chatId, message) => {
  const authToken = GetToken();
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/send`,
      { chatId, message }, // Send the chat ID and message content
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return data; // This will return the updated chat object
  } catch (err) {
    console.error(err.response?.data?.message || "Error sending message");
    throw err;
  }
};

export const fetchChatMessages = async (chatId) => {
  const authToken = GetToken();
  try {
    const { data } = await axios.get(`${API_BASE_URL}/chats/${chatId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return data; // This will contain the list of messages
  } catch (err) {
    console.error(
      err.response?.data?.message || "Error fetching chat messages"
    );
    throw err;
  }
};
