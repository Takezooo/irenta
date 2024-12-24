import React, { createContext, useState, useEffect } from "react";
import { GetToken, SaveToken, RemoveToken, GetRefreshToken, RemoveRefreshToken  } from "../utils/Token.js"; // Import utilities
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
        const storedUser = JSON.parse(atob(storedToken.split(".")[1]));
        // Check token expiration
        const isExpired = storedUser.exp * 1000 < Date.now();
        if (isExpired) {
          if (storedRefreshToken) {
            try {
              const newToken = await refreshAccessToken(); // Refresh token
              const refreshedUser = JSON.parse(atob(newToken.split(".")[1]));
              setUser(refreshedUser);
              setToken(newToken);
            } catch (err) {
              console.error("Token refresh failed:", err);
              logout();
            }
          } else {
            logout();
          }
        } else {
          setUser(storedUser);
          setToken(storedToken);
        }
      } catch (err) {
        console.error("Invalid token format:", err);
        logout(); // Clear tokens if parsing fails
      }
    } else if (storedRefreshToken) {
      try {
        const newToken = await refreshAccessToken();
        const refreshedUser = JSON.parse(atob(newToken.split(".")[1]));
        setUser(refreshedUser);
        setToken(newToken);
      } catch (err) {
        console.error("Token refresh failed:", err);
        logout();
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
    RemoveRefreshToken();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
