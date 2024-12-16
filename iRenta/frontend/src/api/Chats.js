// useEffect(() => {
//     const fetchChats = async () => {
//       const response = await fetch("/api/chats", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await response.json();
//       setChats(data);
//     };

//     fetchChats();
//   }, []);

import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/users"; // Update with your backend API endpoint

export const fetchUserChats = async () => {
  const authToken = GetToken();
  try {
    const { data } = await axios.get(`${API_BASE_URL}/chats`, {
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

export const getOrCreateChat = async (recipientId) => {
  const authToken = GetToken();
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/chats`,
      { recipientId }, // Send the recipient's user ID in the request body
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return data; // This will return the chat object
  } catch (err) {
    console.error(
      err.response?.data?.message || "Error creating or fetching chat"
    );
    throw err;
  }
};

export const sendMessage = async (chatId, message) => {
  const authToken = GetToken();
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/chats/send`,
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
