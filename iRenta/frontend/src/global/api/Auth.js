// src/api/auth.js
import axios from "axios";
import {
  SaveToken,
  RemoveToken,
  SaveRefreshToken,
  GetRefreshToken,
} from "../utils/Token.js";

// Base API URL
const API_BASE_URL = "https://irenta-production.up.railway.app/api/users"; // Update with your backend API endpoint

// Login API call
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      username,
      password,
    });
    const { token, refreshToken, user } = response.data;

    // Save tokens
    SaveToken(token);
    SaveRefreshToken(refreshToken);

    return response.data; // Return user details for use in the app
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

// Google Login API call
export const googleLogin = async (idToken) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/google-login`,
      { idToken },
      { withCredentials: true }
    );

    console.log("Received response from backend:", response.data);

    const { token, refreshToken, user, userDetails, unregistered } =
      response.data;

    // Save tokens
    SaveToken(token);
    SaveRefreshToken(refreshToken);
    console.log("Saved Refresh Token:", refreshToken);

    if (unregistered === true) {
      console.warn("Unregistered user detected:", userDetails);
      return {
        unregistered: true,
        userDetails,
      };
    }

    return { token, refreshToken, user };
  } catch (err) {
    console.error("Google Login error:", err.response || err.message);

    // Display user-friendly error message
    if (err.response?.status === 500) {
      alert(
        "Server error occurred during Google login. Please try again later."
      );
    } else if (err.response?.status === 400) {
      alert("Invalid Google token. Please try again.");
    } else {
      alert("Google login failed. Check your connection and try again.");
    }

    throw err.response?.data || { error: "Google login failed" };
  }
};

// Logout API call
export const logout = () => {
  // Remove tokens
  RemoveToken();
  localStorage.removeItem("user"); // Optional: Clear user data
};

// Refresh token API call
export const refreshAccessToken = async () => {
  const refreshToken = GetRefreshToken();

  if (!refreshToken) {
    console.error("No refresh token available");
    throw new Error("No refresh token available");
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/refresh-token`, 
      {refreshToken}, // Empty body, as the refreshToken is in cookies
      { withCredentials: true } // Ensures cookies are included in the request
    );
    const { token } = response.data;

    SaveToken(token); // Save new access token
    return token;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to refresh access token");
  }
};

// Register API call
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, userData);
    return response.data; // Return registered user details
  } catch (error) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};
