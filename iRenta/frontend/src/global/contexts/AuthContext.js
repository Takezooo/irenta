import React, { createContext, useState, useEffect } from "react";
import {
  GetToken,
  SaveToken,
  RemoveToken,
  GetRefreshToken,
  RemoveRefreshToken,
} from "../utils/Token.js";
import { refreshAccessToken } from "../api/Auth.js";
import { fetchUserData } from "../api/Users.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = GetToken();
        const storedRefreshToken = GetRefreshToken();

        // If no tokens exist at all, set loading false and return early
        if (!storedToken && !storedRefreshToken) {
          setLoading(false);
          return;
        }

        if (storedToken) {
          try {
            const storedUser = JSON.parse(atob(storedToken.split(".")[1]));
            const isExpired = storedUser.exp * 1000 < Date.now();

            if (isExpired) {
              if (storedRefreshToken) {
                const newToken = await refreshAccessToken();
                const refreshedUser = JSON.parse(atob(newToken.split(".")[1]));
                const fullUserData = await fetchUserData(refreshedUser.id, newToken);
                setUser({
                  ...refreshedUser,
                  ...fullUserData,
                });
                setToken(newToken);
              } else {
                logout();
              }
            } else {
              const fullUserData = await fetchUserData(storedUser.id, storedToken);
              setUser({
                ...storedUser,
                ...fullUserData,
              });
              setToken(storedToken);
            }
          } catch (err) {
            console.error("Invalid token format:", err);
            logout();
          }
        } else if (storedRefreshToken) {
          try {
            const newToken = await refreshAccessToken();
            const refreshedUser = JSON.parse(atob(newToken.split(".")[1]));
            const fullUserData = await fetchUserData(refreshedUser.id, newToken);
            setUser({
              ...refreshedUser,
              ...fullUserData,
            });
            setToken(newToken);
          } catch (err) {
            console.error("Token refresh failed:", err);
            logout();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        logout();
      } finally {
        setLoading(false); // Always set loading to false when done
      }
    };

    initializeAuth();
  }, []);

  const login = async (userData, authToken) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    RemoveToken();
    RemoveRefreshToken();
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
