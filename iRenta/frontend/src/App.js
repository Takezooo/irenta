// src/App.js

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import LandingPage from "./pages/LandingPage.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import OwnerDashboard from "./pages/OwnerDashboard.js";
import NotAuthorized from "./pages/unauthorized/NotAuthorized.js";

import { AuthProvider } from "./global/contexts/AuthContext.js";
import PrivateRoute from "./global/routes/PrivateRoute.js";
import PublicRoute from "./global/routes/PublicRoute.js";

// import Chat from "./components/Chat";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route path="/" element={<LandingPage />} />

            {/* Owner Routes */}
            <Route
              path="/owner-dashboard"
              element={
                <PrivateRoute allowedRoles={["Owner"]}>
                  <OwnerDashboard />
                </PrivateRoute>
              }
            />

            {/* Seeker Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute allowedRoles={["Seeker", "Owner"]}>
                  <LandingPage />
                </PrivateRoute>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<NotAuthorized />} />
          </Routes>
        </Router>
      </AuthProvider>
      <ToastContainer />
    </>
  );
};

export default App;
