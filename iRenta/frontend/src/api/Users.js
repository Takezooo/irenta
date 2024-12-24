// for users interactions such as edit profile, etc.
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/users"; // Update with your backend API endpoint

export const fetchUserData = async (id, auth) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      });
      return data;
    } catch (err) {
      if (err.response?.status === 401) {
        console.error("Invalid or expired token. Logging out.");
      }
      console.error(err.response?.data?.message || "Error fetching user data");
      return null;
    }
  };
