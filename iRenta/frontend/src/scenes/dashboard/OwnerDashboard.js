import React, { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./global/Sidebar";
import Topbar from "./global/Topbar";
import MainDashboard from "../../components/OwnerDashboard/MainDashboard";

const OwnerDashboard = () => {

  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-screen h-screen flex bg-gray-200 overflow-x-hidden">

      <Topbar toggleSidebar={toggleSidebar} isOpen={isOpen}/>

      <div>
        <Sidebar isOpen={isOpen}/>
      </div>

    </div>

  );
};

export default OwnerDashboard;
