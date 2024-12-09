import React, { useState } from "react";
import { CgSidebar } from "react-icons/cg";
import { CgSidebarOpen } from "react-icons/cg";

const Topbar = ({ toggleSidebar, isOpen }) => {

  return (
      <nav className="fixed top-0 z-50 w-full bg-gray-100 border-b border-gray-200 shadow">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start rtl:justify-end">
            <button
                className="text-gray-900 rounded-lg hover:bg-gray-300 group z-60"
                onClick={toggleSidebar}
            >
                {isOpen ? (
                <CgSidebarOpen 
                    className="text-center text-3xl text-blue-800 transition duration-75 group-hover:text-gray-900" 
                />
                ) : (
                <CgSidebar 
                    className="text-center text-3xl text-blue-800 transition duration-75 group-hover:text-gray-900" 
                />
                )}
                <span className="absolute mt-1 p-1 rounded-md text-xs whitespace-nowrap invisible group-hover:visible group-hover:opacity-80 bg-gray-700 text-white">
                {isOpen ? "Open Sidebar" : "Close Sidebar"}
                </span>
            </button>
              <a href="" className="flex ms-2 md:me-24">
                <img 
                  src="../assets/images/iRenta.png"
                  className="h-8 me-3"
                  alt="iRenta Logo"
                />
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap">
                  iRenta
                </span>
              </a>
            </div>
          </div>
        </div>
      </nav>
  );
};

export default Topbar;