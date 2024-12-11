import React, { createContext, useState, useEffect } from "react";
import { GetToken, SaveToken, RemoveToken, GetRefreshToken  } from "../utils/Token.js"; // Import utilities
import { refreshAccessToken } from "../../api/Auth.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store user info, including role
  const [token, setToken] = useState(null); // Store token in memory

   // Load token and user on app initialization
   useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = GetToken();
      const storedRefreshToken = GetRefreshToken();

      if (storedToken) {
        try {
          // Decode JWT payload to extract user info
          const storedUser = JSON.parse(atob(storedToken.split(".")[1]));
          setUser(storedUser);
          setToken(storedToken);
        } catch (err) {
          console.error("Invalid token format:", err);
        }
      } else if (storedRefreshToken) {
        try {
          // Attempt to refresh the token
          const newToken = await refreshAccessToken();
          const refreshedUser = JSON.parse(atob(newToken.split(".")[1]));
          setUser(refreshedUser);
          setToken(newToken);
        } catch (err) {
          console.error("Failed to refresh access token:", err);
          logout(); // Clear tokens if refresh fails
        }
      }
    };

    initializeAuth();
  }, []);
  
  // Login: Save token and user
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    SaveToken(authToken); // Save token using `token.js`
  };

  // Logout: Clear token and user
  const logout = () => {
    setUser(null);
    setToken(null);
    RemoveToken(); // Remove token using `token.js`
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
