// src/App.js

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { AuthProvider } from "./config/authContext.js";
import PrivateRoutes from "./components/PrivateRoutes.js";

import LandingPage from "./pages/LandingPage.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import Chat from "./pages/Chat.js";

const App = () => {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<PrivateRoutes />}>
              <Route path="/chat" element={<Chat />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>

      <ToastContainer />
    </>
  );
};

export default App;
