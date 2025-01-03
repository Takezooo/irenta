import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";

import { IoHome } from "react-icons/io5";
import { TbLayoutListFilled } from "react-icons/tb";
import {
  FaCalendar,
  FaPeopleRoof,
  FaPowerOff,
  FaFileContract,
} from "react-icons/fa6";

import MainDashboard from "../OwnerDashboard/MainDashboard.js";
import { PropertyListing } from "../OwnerDashboard/PropertyListing.js";
import ManageTenants from "../OwnerDashboard/Tenants/ManageTenants.js";
import OcularVisitCalendar from "../OwnerDashboard/OcularVisitCalendar.js";
import ContractHub from "../OwnerDashboard/ContractHub/ContractHub.js";

import { AuthContext } from "../../global/contexts/AuthContext.js";

const Sidebar = ({ isOpen, darkMode, toggleDarkMode }) => {
  const [activeContent, setActiveContent] = useState("content1"); // Default to Main Dashboard

  const location = useLocation();
  const { logout, user } = useContext(AuthContext);

  const isActive = (content) => activeContent === content;
  // Show sidebar only on `/owner-dashboard` routes
  const isOwnerDashboard = location.pathname.startsWith("/owner-dashboard");

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    // Check if contentActive exists in the location state and update activeContent
    if (location?.state.  contentActive) {
      setActiveContent(location.state.contentActive);
    }
  }, [location.state, darkMode]); // Run this effect when location.state changes

  if (!isOwnerDashboard) {
    return null; // Hide Sidebar for other routes
  }

  return (
    <div className="flex w-screen">
      <aside
        className={`hidden fixed top-20 left-0 z-40 ${
          isOpen ? "w-64" : "w-20"
        } h-[90%] ml-4 transform transition-all duration-300 ease-in-out bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md lg:inline-block`}
      >
        <div className="flex flex-col justify-between h-full py-3">
          {/* Sidebar Navigation */}
          <div
            className={`$${
              isOpen ? "w-full" : "w-20"
            } flex flex-col items-center space-y-2 font-medium`}
          >
            {user?.userType === "Owner" && (
              <>
                <button
                  onClick={() => setActiveContent("content1")}
                  className={`flex items-center w-full py-3 px-6 hover:bg-gray-200 dark:hover:bg-gray-600 group ${
                    isActive("content1") ? "bg-gray-300 dark:bg-gray-700" : ""
                  }`}
                >
                  <IoHome
                    className={`text-xl text-blue-700 dark:text-blue-400 transition duration-75 group-hover:text-gray-900 dark:group-hover:text-gray-300 ${
                      isOpen ? "" : "mx-auto"
                    }`}
                  />
                  {isOpen && (
                    <span className="ml-2 p-1 opacity-90 text-sm font-medium text-black dark:text-white ms-3 whitespace-nowrap">
                      Main Dashboard
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveContent("content2")}
                  className={`flex items-center w-full py-3 px-6 hover:bg-gray-200 dark:hover:bg-gray-600 group ${
                    isActive("content2") ? "bg-gray-300 dark:bg-gray-700" : ""
                  }`}
                >
                  <TbLayoutListFilled
                    className={`text-xl text-blue-700 dark:text-blue-400 transition duration-75 group-hover:text-gray-900 dark:group-hover:text-gray-300 ${
                      isOpen ? "" : "mx-auto"
                    }`}
                  />
                  {isOpen && (
                    <span className="ml-2 p-1 opacity-90 text-sm font-medium text-black dark:text-white ms-3 whitespace-nowrap">
                      Manage Listings
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveContent("content3")}
                  className={`flex items-center w-full py-3 px-6 hover:bg-gray-200 dark:hover:bg-gray-600 group ${
                    isActive("content3") ? "bg-gray-300 dark:bg-gray-700" : ""
                  }`}
                >
                  <FaPeopleRoof
                    className={`text-xl text-blue-700 dark:text-blue-400 transition duration-75 group-hover:text-gray-900 dark:group-hover:text-gray-300 ${
                      isOpen ? "" : "mx-auto"
                    }`}
                  />
                  {isOpen && (
                    <span className="ml-2 p-1 opacity-90 text-sm font-medium text-black dark:text-white ms-3 whitespace-nowrap">
                      Manage Tenants
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveContent("content4")}
                  className={`flex items-center w-full py-3 px-6 hover:bg-gray-200 dark:hover:bg-gray-600 group ${
                    isActive("content4") ? "bg-gray-300 dark:bg-gray-700" : ""
                  }`}
                >
                  <FaCalendar
                    className={`text-xl text-blue-700 dark:text-blue-400 transition duration-75 group-hover:text-gray-900 dark:group-hover:text-gray-300 ${
                      isOpen ? "" : "mx-auto"
                    }`}
                  />
                  {isOpen && (
                    <span className="ml-2 p-1 opacity-90 text-sm font-medium text-black dark:text-white ms-3 whitespace-nowrap">
                      Calendar
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveContent("content5")}
                  className={`flex items-center w-full py-3 px-6 hover:bg-gray-200 dark:hover:bg-gray-600 group ${
                    isActive("content5") ? "bg-gray-300 dark:bg-gray-700" : ""
                  }`}
                >
                  <FaFileContract
                    className={`text-xl text-blue-700 dark:text-blue-400 transition duration-75 group-hover:text-gray-900 dark:group-hover:text-gray-300 ${
                      isOpen ? "" : "mx-auto"
                    }`}
                  />
                  {isOpen && (
                    <span className="ml-2 p-1 opacity-90 text-sm font-medium text-black dark:text-white ms-3 whitespace-nowrap">
                      ContractHub
                    </span>
                  )}
                </button>
              </>
            )}
          </div>

          <div
            className={`${
              isOpen ? "w-full" : "w-20"
            } flex flex-col items-center`}
          >
            <hr className="w-full my-2" />
            <button
              onClick={logout}
              className={`flex items-center w-full py-3 px-6 hover:bg-gray-200 dark:hover:bg-gray-600 group`}
            >
              <FaPowerOff
                className={`text-xl text-blue-700 dark:text-blue-400 transition duration-75 group-hover:text-gray-900 dark:group-hover:text-gray-300 ${
                  isOpen ? "" : "mx-auto"
                }`}
              />
              {isOpen && (
                <span className="ml-2 p-1 opacity-90 text-sm font-medium text-black dark:text-white ms-3 whitespace-nowrap">
                  Sign Out
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 shadow-md z-50">
        <div className="flex justify-around py-3">
          <button
            onClick={() => setActiveContent("content1")}
            className={`flex flex-col items-center text-blue-500 dark:text-blue-400 ${
              isActive("content1") ? "text-blue-900 dark:text-blue-500" : ""
            }`}
          >
            <IoHome size={24} />
            <span className="text-xs dark:text-white">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveContent("content2")}
            className={`flex flex-col items-center text-blue-500 dark:text-blue-400 ${
              isActive("content2") ? "text-blue-900 dark:text-blue-500" : ""
            }`}
          >
            <TbLayoutListFilled size={24} />
            <span className="text-xs dark:text-white">Listings</span>
          </button>
          <button
            onClick={() => setActiveContent("content3")}
            className={`flex flex-col items-center text-blue-500 dark:text-blue-400 ${
              isActive("content3") ? "text-blue-900 dark:text-blue-500" : ""
            }`}
          >
            <FaPeopleRoof size={24} />
            <span className="text-xs dark:text-white">Tenants</span>
          </button>
          <button
            onClick={() => setActiveContent("content4")}
            className={`flex flex-col items-center text-blue-500 dark:text-blue-400 ${
              isActive("content4") ? "text-blue-900 dark:text-blue-500" : ""
            }`}
          >
            <FaCalendar size={24} />
            <span className="text-xs dark:text-white">Calendar</span>
          </button>
          <button
            onClick={() => setActiveContent("content5")}
            className={`flex flex-col items-center text-blue-500 dark:text-blue-400 ${
              isActive("content5") ? "text-blue-900 dark:text-blue-500" : ""
            }`}
          >
            <FaFileContract size={24} />
            <span className="text-xs">Contracts</span>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div
        className={`transition-all duration-300 mx-4 mt-16 lg:mt-0 ${
          isOpen ? "lg:ml-72" : "lg:ml-28"
        } w-full`}
      >
        {activeContent === "content1" && <MainDashboard />}
        {activeContent === "content2" && <PropertyListing />}
        {activeContent === "content3" && <ManageTenants />}
        {activeContent === "content4" && <OcularVisitCalendar />}
        {activeContent === "content5" && <ContractHub />}
      </div>
    </div>
  );
};

export default Sidebar;