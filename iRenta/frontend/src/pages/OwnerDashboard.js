import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/global/Sidebar.js";
import Topbar from "../components/global/Topbar.js";

const OwnerDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeContent, setActiveContent] = useState("content1"); // Add activeContent state

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-screen h-screen flex bg-gray-200 overflow-x-hidden">
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
