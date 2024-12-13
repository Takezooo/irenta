import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext.js";

const PublicRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (user) {
    if (user.userType === "Seeker") {
      // Redirect to a default logged-in page if user is authenticated
      return <Navigate to="/" />;
    }
    else if (user.userType === "Owner") { 
      return <Navigate to="/owner-dashboard" />;
    }
    else {
      return <Navigate to="/" />;
    }
}

  return children;
};

export default PublicRoute;
