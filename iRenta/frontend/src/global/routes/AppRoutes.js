// src/App.js

import React, {useContext} from "react";
import { Routes, Route } from 'react-router-dom';

// Pages
import LandingPage from "../../pages/LandingPage.js";
import Login from "../../pages/Login.js";
import Register from "../../pages/Register.js";
import OwnerDashboard from "../../pages/OwnerDashboard.js";
import NotAuthorized from "../../pages/Unauthorized/NotAuthorized.js";
import ViewListing from "../../pages/ViewListing.js";
import AddListing from "../../components/OwnerDashboard/AddListing.js";
import BrowseListing from "../../pages/BrowseListing.js";
import ViewLease from "../../pages/Seeker/ViewLease.js";
import EditListing from "../../components/OwnerDashboard/EditListing.js";
import LikedListing from "../../pages/LikedListing.js";
import ReserveListing from "../../pages/ReserveListing.js";
import ReservationPage from "../../pages/ReservationPage.js";
import AboutPage from "../../pages/AboutPage.js";
import TenantsDashboard from "../../pages/Tenants/TenantsDashboard.js";
import ViewProfile from "../../pages/ViewProfile.js";
import EditProfile from "../../pages/EditProfile.js";
import LoadingScreen from "../../components/global/Loading.js";

// Contexts
import { AuthContext } from "../../global/contexts/AuthContext.js";

// Routes
import PrivateRoute from "../../global/routes/PrivateRoute.js";
import PublicRoute from "../../global/routes/PublicRoute.js";

const AppRoutes = () => {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
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
    <Route path="/browse-listing" element={<BrowseListing />} />
    <Route path="/about-us" element={<AboutPage />} />
    <Route path="/:propertyId" element={<ViewListing />} />

    {/* Tenant Routes */}
    <Route
      path="/tenant-dashboard"
      element={
        <PrivateRoute
          allowedRoles={["Seeker"]}
          requireTenantBadge={true}
        >
          <TenantsDashboard />
        </PrivateRoute>
      }
    />

    {/* Seeker Routes */}
    <Route
      path="/request-reservation"
      element={
        <PrivateRoute allowedRoles={["Seeker"]}>
          <ReservationPage />
        </PrivateRoute>
      }
    />
    <Route
      path="/view-lease"
      element={
        <PrivateRoute allowedRoles={["Seeker"]}>
          <ViewLease />
        </PrivateRoute>
      }
    />

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
    <Route
      path="/edit-listing/:id"
      element={
        <PrivateRoute allowedRoles={["Owner"]}>
          <EditListing />
        </PrivateRoute>
      }
    />

    {/* Seeker and Owner Routes */}
    <Route
      path="/liked-listing"
      element={
        <PrivateRoute allowedRoles={["Seeker", "Owner"]}>
          <LikedListing />
        </PrivateRoute>
      }
    />
    <Route
      path="/reservations"
      element={
        <PrivateRoute allowedRoles={["Seeker", "Owner"]}>
          <ReserveListing />
        </PrivateRoute>
      }
    />
    <Route
      path="/view-profile"
      element={
        <PrivateRoute allowedRoles={["Seeker", "Owner"]}>
          <ViewProfile />
        </PrivateRoute>
      }
    />
    <Route
      path="/edit-profile"
      element={
        <PrivateRoute allowedRoles={["Seeker", "Owner"]}>
          <EditProfile />
        </PrivateRoute>
      }
    />

    {/* Fallback Route */}
    <Route path="*" element={<NotAuthorized />} />
    <Route path="/not-authorized" element={<NotAuthorized />} />
  </Routes>
  );
};

export default AppRoutes;
