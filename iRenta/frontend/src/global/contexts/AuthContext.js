import React, { createContext, useState, useEffect } from "react";
import { GetToken, SaveToken, RemoveToken } from "../utils/Token.js"; // Import utilities

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store user info, including role
  const [token, setToken] = useState(null); // Store token in memory

  // Load token and user from `token.js` on app initialization
  useEffect(() => {
    const storedToken = GetToken(); // Retrieve token from cookies
    if (storedToken) {
      setToken(storedToken);

      try {
        // Decode JWT payload to extract user info
        const storedUser = JSON.parse(atob(storedToken.split(".")[1])); // Decode payload
        setUser(storedUser);
      } catch (err) {
        console.error("Invalid token format:", err);
      }
    }
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
