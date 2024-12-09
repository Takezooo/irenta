import React, { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../scenes/global/Sidebar.js";
import Topbar from "../scenes/global/Topbar.js";
import MainDashboard from "../components/OwnerDashboard/MainDashboard";

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
