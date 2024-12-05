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

      <div className={`w-full h-full bg-gray-500 mt-12 ${isOpen ? "ml-2" : "ml-64"}`}>
        <h1 className="font-bold text-2xl">OWNER DASHBOARD</h1>
      </div>
    </div>
  );
};

export default OwnerDashboard;
