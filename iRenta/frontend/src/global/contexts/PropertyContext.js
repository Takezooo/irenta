import React, { createContext, useState, useContext, useEffect } from "react";

// Create context
const PropertyContext = createContext();

// Custom hook for easier access
export const useProperty = () => useContext(PropertyContext);

// Provider component
export const PropertyProvider = ({ children }) => {
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Load selected property from sessionStorage on component mount
  useEffect(() => {
    const storedProperty = sessionStorage.getItem("selectedProperty");
    if (storedProperty) {
      setSelectedProperty(JSON.parse(storedProperty));
    }
  }, []);

  // Save selected property to sessionStorage whenever it changes
  useEffect(() => {
    if (selectedProperty) {
        sessionStorage.setItem("selectedProperty", JSON.stringify(selectedProperty));
    } else {
        sessionStorage.removeItem("selectedProperty"); // Clean up if null
    }
  }, [selectedProperty]);

  return (
    <PropertyContext.Provider value={{ selectedProperty, setSelectedProperty }}>
      {children}
    </PropertyContext.Provider>
  );
};
