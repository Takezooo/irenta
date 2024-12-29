import React, { useState, useContext } from "react";
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
import ManageTenants from "../OwnerDashboard/ManageTenants.js";
import OcularVisitCalendar from "../OwnerDashboard/OcularVisitCalendar.js";
import ContractHub from "../OwnerDashboard/ContractHub/ContractHub.js";

import { AuthContext } from "../../global/contexts/AuthContext.js";

const Sidebar = ({ isOpen, activeContent, setActiveContent }) => {

  const location = useLocation();

  const isActive = (content) => activeContent === content;

  // Show sidebar only on `/owner-dashboard` routes
  const isOwnerDashboard = location.pathname.startsWith("/owner-dashboard");

  if (!isOwnerDashboard) {
    return null; // Hide Sidebar for other routes
  }

  return (
    <div className="flex w-screen">
      <aside
        className={`hidden fixed top-20 left-0 z-40 ${
          isOpen ? "w-64" : "w-20"
        } h-[90%] ml-4 transform transition-all duration-300 ease-in-out bg-gray-100 rounded-lg shadow-md lg:inline-block`}
      >
        <div className="flex flex-col justify-between h-full py-3">
          {/* Sidebar Navigation */}
          <div
            className={`${
              isOpen ? "w-full" : "w-20"
            } flex flex-col items-center space-y-2 font-medium`}
          >
            <button
              onClick={() => setActiveContent("content1")}
              className={`flex items-center w-full py-3 px-6 hover:bg-gray-200 group ${
                isActive("content1") ? "bg-gray-300" : ""
              }`}
            >
              <IoHome
                className={`text-xl text-blue-700 transition duration-75 group-hover:text-gray-900 ${
                  isOpen ? "" : "mx-auto"
                }`}
              />
              {isOpen && (
                <span className="ml-2 p-1 opacity-90 text-sm font-medium text-black ms-3 whitespace-nowrap">
                  Main Dashboard
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveContent("content2")}
              className={`flex items-center w-full py-3 px-6 hover:bg-gray-200 group ${
                isActive("content2") ? "bg-gray-300" : ""
              }`}
            >
              <TbLayoutListFilled
                className={`text-xl text-blue-700 transition duration-75 group-hover:text-gray-900 ${
                  isOpen ? "" : "mx-auto"
                }`}
              />
              {isOpen && (
                <span className="ml-2 p-1 opacity-90 text-sm font-medium text-black ms-3 whitespace-nowrap">
                  Manage Listings
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveContent("content3")}
              className={`flex items-center w-full py-3 px-6 hover:bg-gray-200 group ${
                isActive("content3") ? "bg-gray-300" : ""
              }`}
            >
              <FaPeopleRoof
                className={`text-xl text-blue-700 transition duration-75 group-hover:text-gray-900 ${
                  isOpen ? "" : "mx-auto"
                }`}
              />
              {isOpen && (
                <span className="ml-2 p-1 opacity-90 text-sm font-medium text-black ms-3 whitespace-nowrap">
                  Manage Tenants
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveContent("content4")}
              className={`flex items-center w-full py-3 px-6 hover:bg-gray-200 group ${
                isActive("content4") ? "bg-gray-300" : ""
              }`}
            >
              <FaCalendar
                className={`text-xl text-blue-700 transition duration-75 group-hover:text-gray-900 ${
                  isOpen ? "" : "mx-auto"
                }`}
              />
              {isOpen && (
                <span className="ml-2 p-1 opacity-90 text-sm font-medium text-black ms-3 whitespace-nowrap">
                  Calendar
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveContent("content5")}
              className={`flex items-center w-full py-3 px-6 hover:bg-gray-200 group ${
                isActive("content5") ? "bg-gray-300" : ""
              }`}
            >
              <FaFileContract
                className={`text-xl text-blue-700 transition duration-75 group-hover:text-gray-900 ${
                  isOpen ? "" : "mx-auto"
                }`}
              />
              {isOpen && (
                <span className="ml-2 p-1 opacity-90 text-sm font-medium text-black ms-3 whitespace-nowrap">
                  ContractHub
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Content Section */}
      <div
        className={`transition-all duration-300 mx-4 ${
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
