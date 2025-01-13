import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext.js";
import { refreshAccessToken } from "../api/Auth.js";
import { GetRefreshToken } from "../utils/Token.js";
import LoadingScreen from "../../components/global/Loading.js";

const PrivateRoute = ({
  children,
  allowedRoles,
  requireTenantBadge = false,
}) => {
  const { user, token, login, logout, loading  } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      console.log("Validating token...");
      const refreshToken = GetRefreshToken();
      console.log("Retrieved Refresh Token:", refreshToken);

      if (!token && refreshToken) {
        try {
          const newToken = await refreshAccessToken();
          const refreshedUser = JSON.parse(atob(newToken.split(".")[1]));
          login(refreshedUser, newToken);
        } catch (err) {
          console.error("Failed to refresh token:", err.message || err);
          logout(); // Redirect to login if refresh fails
        }
      }
      setIsLoading(false);
    };

    validateToken();
  }, [token, login, logout]);

  // Debug logs
  console.log("Auth Status:", {
    userType: user?.userType,
    tenantBadge: user?.tenantBadge,
    requireTenantBadge,
  });

  // Add loading screen
  if (isLoading && loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.userType)) {
    console.log("Redirecting to not-authorized: User role mismatch");
    return <Navigate to="/not-authorized" />;
  }
  if (requireTenantBadge && !user.tenantBadge) {
    console.log("Redirecting to not-authorized: Tenant badge required");
    return <Navigate to="/not-authorized" />;
  }

  return children;
};

export default PrivateRoute;
