import axios from "axios";
import { GetToken } from "../utils/Token";

const API_BASE_URL = "http://localhost:5000/api/notifications";

export const fetchNotifications = async () => {
  const authToken = GetToken();
  try {
    const { data } = await axios.get(`${API_BASE_URL}/`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return data;
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
    throw err;
  }
};

export const markNotificationAsViewed = async (notificationId) => {
  const authToken = GetToken();
  try {
    await axios.post(
      `${API_BASE_URL}/mark-as-viewed`,
      { notificationId },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
  } catch (err) {
    console.error("Failed to mark notification as viewed:", err);
    throw err;
  }
};