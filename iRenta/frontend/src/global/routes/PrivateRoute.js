import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext.js";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    // If the user is not authenticated, redirect to login
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.userType)) {
    // If the user's role is not allowed, redirect to a "not authorized" page
    return <Navigate to="/not-authorized" />;
  }

  return children;
};

export default PrivateRoute;
