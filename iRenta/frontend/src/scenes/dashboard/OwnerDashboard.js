import React, { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./global/Sidebar";
import Topbar from "./global/Topbar";

const OwnerDashboard = () => {

  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-screen h-screen flex bg-gray-300 overflow-x-hidden">

      <Topbar toggleSidebar={toggleSidebar} isOpen={isOpen}/>

      <Sidebar isOpen={isOpen}/>

      <div className="w-full h-1/2 mt-20 flex align-center justify-center overflow-x-hidden">
        <div className="font-bold text-2xl border border-black border-dashed">OWNER DASHBOARD</div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
