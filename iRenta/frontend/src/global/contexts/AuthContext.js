import React, { createContext, useState, useEffect } from "react";
import {
  GetToken,
  SaveToken,
  RemoveToken,
  GetRefreshToken,
  RemoveRefreshToken,
} from "../utils/Token.js"; // Import utilities
import { refreshAccessToken } from "../api/Auth.js";
import { fetchUserData } from "../api/Users.js"; // Import the user data fetching function

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store user info, including role
  const [token, setToken] = useState(null); // Store token in memory
  const [loading, setLoading] = useState(true); // Add loading state
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
                setLoading(true);
                const newToken = await refreshAccessToken(); // Refresh token
                const refreshedUser = JSON.parse(atob(newToken.split(".")[1]));
                const fullUserData = await fetchUserData(
                  refreshedUser.id,
                  newToken
                );
                setUser({
                  ...refreshedUser,
                  ...fullUserData,
                });
                setToken(newToken);
              } catch (err) {
                console.error("Token refresh failed:", err);
                logout();
              } finally {
                setLoading(false); // Set loading to false when done
              }
            } else {
              logout();
            }
          } else {
            setLoading(true);
            const fullUserData = await fetchUserData(
              storedUser.id,
              storedToken
            );
            setUser({
              ...storedUser,
              ...fullUserData,
            });
            setToken(storedToken);
          }
        } catch (err) {
          console.error("Invalid token format:", err);
          logout(); // Clear tokens if parsing fails
        } finally {
          setLoading(false); // Set loading to false when done
        }
      } else if (storedRefreshToken) {
        try {
          setLoading(true);
          const newToken = await refreshAccessToken();
          const refreshedUser = JSON.parse(atob(newToken.split(".")[1]));
          const fullUserData = await fetchUserData(refreshedUser.id, newToken);
          setUser({
            ...refreshedUser,
            ...fullUserData,
          });
          setUser(refreshedUser);
          setToken(newToken);
        } catch (err) {
          console.error("Token refresh failed:", err);
          logout();
        } finally {
          setLoading(false); // Set loading to false when done
        }
      }
    };

    initializeAuth();
  }, []);

  // Login: Save token and user
  const login = async (userData, authToken) => {
    try {
      // Fetch full user data including tenantBadge
      const fullUserData = await fetchUserData(userData.id, authToken);
      setUser({
        ...userData,
        ...fullUserData,
      });
      setToken(authToken);
      SaveToken(authToken);
    } catch (err) {
      console.error("Error fetching full user data:", err);
      logout();
    }
  };

  // Logout: Clear token and user
  const logout = () => {
    setUser(null);
    setToken(null);
    RemoveToken(); // Remove token using `token.js`
    RemoveRefreshToken();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
