import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext.js";
import { refreshAccessToken } from "../../api/Auth.js";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, token, login, logout } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        console.log("Token missing. Attempting to refresh...");
        try {
          const newToken = await refreshAccessToken();
          const refreshedUser = JSON.parse(atob(newToken.split(".")[1])); // Decode user info from token
          console.log("Refreshed User:", refreshedUser);
          login(refreshedUser, newToken); // Restore user and token in AuthContext
          console.log("Token refreshed successfully");
        } catch (err) {
          console.error("Failed to refresh token:", err.message || err);
          logout(); // Clear context and redirect to login
        }
      }
      setIsLoading(false); // Stop loading after validation
    };

    validateToken();
  }, [token, login, logout]);

  if (isLoading) {
    return <div>Loading...</div>; // Show loading indicator while validating
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.userType)) {
    console.log("Redirecting to not-authorized: User role mismatch");
    return <Navigate to="/not-authorized" />;
  }

  return children;
};

export default PrivateRoute;
