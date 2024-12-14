import React, {useContext} from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../global/contexts/AuthContext";

// icons
import { CgSidebar } from "react-icons/cg";
import { CgSidebarOpen } from "react-icons/cg";
import { FaPowerOff } from "react-icons/fa6";
const Topbar = ({ toggleSidebar, isOpen }) => {
  const { logout } = useContext(AuthContext);
  return (
    <nav className="fixed top-0 z-50 w-full bg-gray-100 border-b border-gray-200 shadow">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          {/* Sidebar Toggle and Logo */}
          <div className="flex items-center justify-start rtl:justify-end">
            <button
              className="text-gray-900 rounded-lg hover:bg-gray-300 group z-60"
              onClick={toggleSidebar}
            >
              {isOpen ? (
                <CgSidebarOpen className="text-center text-3xl text-blue-800 transition duration-75 group-hover:text-gray-900" />
              ) : (
                <CgSidebar className="text-center text-3xl text-blue-800 transition duration-75 group-hover:text-gray-900" />
              )}
              <span className="absolute mt-1 p-1 rounded-md text-xs whitespace-nowrap invisible group-hover:visible group-hover:opacity-80 bg-gray-700 text-white">
                {isOpen ? "Open Sidebar" : "Close Sidebar"}
              </span>
            </button>
            <Link to="/">
            <a className="flex ms-2 md:me-24">
              <img
                src="../assets/images/iRenta.png"
                className="h-8 me-3"
                alt="iRenta Logo"
              />
              
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap">
                iRenta
              </span>
            </a>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 flex ml-[30%]">
            <div className="w-full max-w-xs">
              <input
                type="text"
                className="w-full bg-white border border-gray-300 rounded-md py-2 px-4 shadow-sm text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search..."
              />
            </div>
          </div>

          {/* Additional Items (if needed) */}
          <div className="ml-4 flex items-center">
            <button
              onClick={() => logout()}
              className="flex items-center py-2 px-4 text-gray-900 bg-gray-200 group rounded-full hover:bg-blue-500"
            >
              <FaPowerOff className="text-xl text-blue-700 transition duration-75 group-hover:text-gray-200" />
              <span className="ml-1 p-1 text-sm font-medium text-black ms-3 group-hover:text-white whitespace-nowrap">
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Topbar;
