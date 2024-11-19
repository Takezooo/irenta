import React, { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./global/Sidebar";
import Topbar from "./global/Topbar";
import { FaAngleLeft } from "react-icons/fa";

const OwnerDashboard = () => {

  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-screen h-screen flex bg-gray-200 overflow-x-hidden">

      <Topbar toggleSidebar={toggleSidebar} isOpen={isOpen}/>

      <Sidebar isOpen={isOpen}/>

      <div className="w-screen pt-20 pl-4 sm:ml-64 overflow-x-hidden">
        <h1 className="font-bold text-2xl">OWNER DASHBOARD</h1>
      </div>
    </div>
  );
};

export default OwnerDashboard;
