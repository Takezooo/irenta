import React, {useState} from "react";
import { Link } from "react-router-dom";
import { IoHome } from "react-icons/io5";
import { TbLayoutListFilled } from "react-icons/tb";
import { FaPeopleRoof } from "react-icons/fa6";
import { FaSignOutAlt } from "react-icons/fa";
 
const Sidebar = ({ isOpen }) => {

  return (
    <div className="flex">
        <aside className={`fixed top-12 left-0 w-64 h-full text-white transform transition-transform duration-300 ${isOpen ? "-translate-x-full" : "translate-x-0"}`}>
            <div className="h-full px-3 py-4 overflow-y-auto bg-gray-100">
                <ul className="space-y-2 font-medium">
                <li>
                    <a
                    href="#"
                    className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-200 group"
                    >
                    <IoHome className="text-2xl text-blue-700 transition duration-75 group-hover:text-gray-900" />
                    <span className="ms-3">Owner Dashboard</span>
                    </a>
                </li>
                <li>
                    <a
                    href="#"
                    className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-200 group"
                    >
                    <TbLayoutListFilled className="text-2xl text-blue-700 transition duration-75 group-hover:text-gray-900" />
                    <span className="flex-1 ms-3 whitespace-nowrap">
                        Property Listings
                    </span>
                    </a>
                </li>
                <li>
                    <a
                    href="#"
                    className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-200 group"
                    >
                    <FaPeopleRoof className="text-2xl text-blue-700 transition duration-75 group-hover:text-gray-900" />
                    <span className="flex-1 ms-3 whitespace-nowrap">Tenants</span>
                    </a>
                </li>
                <li>
                    <Link
                    to="/login"
                    className="flex items-center text-gray-900 rounded-lg hover:bg-gray-200 group"
                    >
                    <button className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-200 group">
                        <FaSignOutAlt className="text-2xl text-blue-700 transition duration-75 group-hover:text-gray-900" />
                        <span className="flex-1 ms-3 whitespace-nowrap">Sign Out</span>
                    </button>
                    </Link>
                </li>
                </ul>
            </div>
        </aside>
    </div>
  );
};

export default Sidebar;