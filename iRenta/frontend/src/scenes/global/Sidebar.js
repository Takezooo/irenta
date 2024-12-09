import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IoHome } from "react-icons/io5";
import { TbLayoutListFilled } from "react-icons/tb";
import { FaCalendar, FaPeopleRoof, FaPowerOff } from "react-icons/fa6";
import MainDashboard from "../../components/OwnerDashboard/MainDashboard.js";
import { PropertyListing } from "../../components/OwnerDashboard/PropertyListing";
import { ManageTenants } from "../../components/OwnerDashboard/ManageTenants";
import { Calendar } from "../../components/OwnerDashboard/Calendar";

const Sidebar = ({ isOpen }) => {
  const [activeContent, setActiveContent] = useState("");

  const isActive = (content) => activeContent === content;

  return (
    <div className="flex w-screen">
      <aside className={`fixed top-0 left-0 z-40 w-56 h-screen pt-20 transform transition-transform duration-300 ease-in-out ${isOpen ? "-translate-x-full ml-0" : "translate-x-0 ml-4"}`}>
        <div className="flex flex-col justify-between items-center w-full h-[95%] rounded-lg py-3 overflow-y-auto overflow-hidden bg-gray-100 transition duration-75 ease-in-out">
          <div className="w-full mx-auto space-y-2 font-medium">
            <button
              onClick={() => setActiveContent("content1")}
              className={`flex w-full items-center py-2 px-8 hover:bg-gray-200 group ${
                isActive('content1')
              ? 'bg-gray-200 scale-110'
              : ''
                }`}
            >
              <IoHome className="text-xl text-blue-700 transition duration-75 group-hover:text-gray-900" />
              <span className="ml-2 p-1 opacity-90 text-sm font-medium text-black ms-3 whitespace-nowrap">
                Main Dashboard
              </span>
            </button>

            <button
              onClick={() => setActiveContent("content2")}
              className={`flex w-full items-center py-2 px-8 hover:bg-gray-200 group ${
                isActive('content2')
              ? 'bg-gray-200 scale-110'
              : ''
                }`}
            >
              <TbLayoutListFilled className="text-xl text-blue-700 transition duration-75 group-hover:text-gray-900" />
              <span className="ml-2 p-1 opacity-90 text-sm font-medium text-black ms-3 whitespace-nowrap">
                Property Listings
              </span>
            </button>

            <button
              onClick={() => setActiveContent("content3")}
              className={`flex w-full items-center py-2 px-8 hover:bg-gray-200 group ${
                isActive('content3')
              ? 'bg-gray-200 scale-110'
              : ''
                }`}
            >
              <FaPeopleRoof className="text-xl text-blue-700 transition duration-75 group-hover:text-gray-900" />
              <span className="ml-2 p-1 opacity-90 text-sm font-medium text-black ms-3 whitespace-nowrap">
                Tenants
              </span>
            </button>

            <button
              onClick={() => setActiveContent("content4")}
              className={`flex w-full items-center py-2 px-8 hover:bg-gray-200 group ${
                isActive('content4')
              ? 'bg-gray-200 scale-110'
              : ''
                }`}
            >
              <FaCalendar className="text-xl text-blue-700 transition duration-75 group-hover:text-gray-900" />
              <span className="ml-2 p-1 opacity-90 text-sm font-medium text-black ms-3 whitespace-nowrap">
                Calendar
              </span>
            </button>
          </div>
          <div>
              <hr className="w-full my-2"></hr>
              <Link
                to="/login"
                className="w-full flex items-center text-gray-900 hover:bg-gray-200 group"
              >
                <button className="flex items-center py-2 px-16 text-gray-900 hover:bg-gray-200 group">
                  <FaPowerOff className="text-xl text-blue-700 transition duration-75 group-hover:text-gray-900" />
                  <span className="ml-2 p-1 opacity-90 text-sm font-medium text-black ms-3 whitespace-nowrap">
                    Sign Out
                  </span>
                </button>
              </Link>
          </div>
        </div>
      </aside>

      <div className="w-full">
        {activeContent === 'content1' && (
          <MainDashboard />
        )}
        {activeContent === 'content2' && (
          <PropertyListing />
        )}
        {activeContent === 'content3' && (
          <ManageTenants />
        )}
        {activeContent === 'content4' && (
          <Calendar />
        )}
      </div>
    </div>
  );
};

export default Sidebar;