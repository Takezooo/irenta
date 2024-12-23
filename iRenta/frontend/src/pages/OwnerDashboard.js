import React, { useState } from "react";
import Sidebar from "../components/global/Sidebar.js";
import Topbar from "../components/global/Topbar.js";

const OwnerDashboard = () => {

  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-screen h-screen flex bg-gray-200 overflow-x-hidden">

      <Topbar toggleSidebar={toggleSidebar} isOpen={isOpen}/>

      <Sidebar isOpen={isOpen}/>

    </div>

  );
};

export default OwnerDashboard;
