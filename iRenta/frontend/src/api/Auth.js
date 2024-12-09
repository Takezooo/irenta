// src/api/auth.js
import axios from "axios";
import {
  SaveToken,
  RemoveToken,
  SaveRefreshToken,
  GetRefreshToken,
} from "../global/utils/Token.js";

// Base API URL
const API_BASE_URL = "http://localhost:5000/api/users"; // Update with your backend API endpoint

// Login API call
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      username,
      password,
    });
    const { token, user, refreshToken } = response.data;

    // Save tokens
    SaveToken(token);
    SaveRefreshToken(refreshToken);
    
    return response.data;// Return user details for use in the app
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

// Google Login API call
export const googleLogin = async (idToken) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/google-login`, {
      idToken,
    });

    // Extract token and user details
    const { token, refreshToken, user, userDetails, unregistered } = response.data;

    // Save tokens
    SaveToken(token);
    SaveRefreshToken(refreshToken);

    // Handle unregistered user scenario
    if (unregistered) {
      return {
        unregistered: true,
        userDetails,
      };
    }

    // Return token and user
    return { token, user };
  } catch (err) {
    // Handle and rethrow errors for calling function to handle
    console.error("Google Login failed:", err);
    throw err;
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
    throw new Error("No refresh token available");
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/refresh-token`, {
      refreshToken,
    });
    const { token } = response.data;

    // Save new access token
    SaveToken(token);
    return token;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to refresh access token"
    );
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
