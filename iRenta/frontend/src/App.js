import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./global/routes/AppRoutes";
import { AuthProvider } from "./global/contexts/AuthContext";
import { PropertyProvider } from "./global/contexts/PropertyContext";
import { ChatDropdownProvider } from "./global/contexts/ChatDropdownContext";
import { NotificationProvider } from "./global/contexts/NotificationContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const App = () => {
  return (
    <AuthProvider>
      <PropertyProvider>
        <ChatDropdownProvider>
          <NotificationProvider>
            <Router>
              <ThemeProvider>
                <AppRoutes />
              </ThemeProvider>
            </Router>
          </NotificationProvider>
        </ChatDropdownProvider>
      </PropertyProvider>
      <ToastContainer />
    </AuthProvider>
  );
};

export default App;
