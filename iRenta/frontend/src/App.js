// src/App.js

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Pages
import LandingPage from "./pages/LandingPage.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import OwnerDashboard from "./pages/OwnerDashboard.js";
import NotAuthorized from "./pages/Unauthorized/NotAuthorized.js";
import ViewListing from "./pages/ViewListing.js";
import AddListing from "./components/OwnerDashboard/AddListing.js";
import BrowseListing from "./pages/BrowseListing.js";
import ChatPage from "./pages/ChatPage.js";
import ViewContract from "./components/OwnerDashboard/ContractHub/ViewContract.js";

import { AuthProvider } from "./global/contexts/AuthContext.js";
import { PropertyProvider } from "./global/contexts/PropertyContext";

// Routes
import PrivateRoute from "./global/routes/PrivateRoute.js";
import PublicRoute from "./global/routes/PublicRoute.js";

// import Chat from "./components/Chat";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <>
      <AuthProvider>
        <PropertyProvider>
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
              <Route
                path="/create-list"
                element={
                  <PrivateRoute allowedRoles={["Owner"]}>
                    <AddListing />
                  </PrivateRoute>
                }
              />

              {/* Seeker and Owner Routes */}

              <Route
                path="/browse-listing"
                element={
                  <PrivateRoute allowedRoles={["Seeker", "Owner"]}>
                    <BrowseListing />
                  </PrivateRoute>
                }
              />

              <Route
                path="/:propertyId"
                element={
                  <PrivateRoute allowedRoles={["Seeker", "Owner"]}>
                    <ViewListing />
                  </PrivateRoute>
                }
              />

              <Route
                path="/chat/"
                element={
                  <PrivateRoute allowedRoles={["Seeker", "Owner"]}>
                    <ChatPage />
                  </PrivateRoute>
                }
              />

              <Route
                path="/chat/:chatId"
                element={
                  <PrivateRoute allowedRoles={["Seeker", "Owner"]}>
                    <ChatPage />
                  </PrivateRoute>
                }
              />

              <Route 
                path="/view-contract"
                element={
                  <PrivateRoute allowedRoles={["Seeker", "Owner"]}>
                    <ViewContract />
                  </PrivateRoute>
                } />

              {/* Fallback Route */}
              <Route path="*" element={<NotAuthorized />} />
            </Routes>
          </Router>
        </PropertyProvider>
      </AuthProvider>
      <ToastContainer />
    </>
  );
};

export default App;
