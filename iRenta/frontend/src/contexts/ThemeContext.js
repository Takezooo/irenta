import React, { createContext, useState, useEffect } from "react";

// Create ThemeContext
export const ThemeContext = createContext();

// ThemeProvider Component
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const storedMode = localStorage.getItem("darkMode");
    return storedMode === "true"; // Parse string into boolean
  });

  // Apply dark mode on mount and when darkMode state changes
  useEffect(() => {
    console.log("Applying dark mode:", darkMode);

    // Persist darkMode state to localStorage
    localStorage.setItem("darkMode", darkMode);

    // Add/remove "dark" class on <body>
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  // Continuously reapply the `dark` class if removed unexpectedly
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          if (darkMode && !document.body.classList.contains("dark")) {
            console.warn("Reapplying dark mode to <body>");
            document.body.classList.add("dark");
          }
        }
      });
    });

    observer.observe(document.body, { attributes: true });

    return () => observer.disconnect(); // Clean up the observer
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
