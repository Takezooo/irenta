import React, { useState, useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext"; // Import ThemeContext
import Sidebar from "../components/global/Sidebar.js";
import Topbar from "../components/global/Topbar.js";

const OwnerDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeContent, setActiveContent] = useState("content1"); // Add activeContent state
  const { darkMode } = useContext(ThemeContext); // Access dark mode state

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`w-screen h-screen flex overflow-x-hidden ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-200 text-black"
      }`}
    >
      <Topbar
        toggleSidebar={toggleSidebar}
        isOpen={isOpen}
        setActiveContent={setActiveContent} // Pass setActiveContent
      />
      <Sidebar
        isOpen={isOpen}
        activeContent={activeContent} // Pass activeContent
        setActiveContent={setActiveContent} // Pass setActiveContent
      />
    </div>
  );
};

export default OwnerDashboard;
