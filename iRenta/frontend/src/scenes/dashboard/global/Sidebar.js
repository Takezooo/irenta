import React, {useState} from "react";
import { Link } from "react-router-dom";
import { IoHome } from "react-icons/io5";
import { TbLayoutListFilled } from "react-icons/tb";
import { FaPeopleRoof } from "react-icons/fa6";
import { FaSignOutAlt } from "react-icons/fa";
 
const Sidebar = ({ isOpen }) => {

  return (
    <div className="flex">
        <aside className={`absolute h-full flex items-center text-white transform transition-transform duration-300 ease-in-out ${isOpen ? "-translate-x-full" : "translate-x-0"}`}>
            <div className="h-fit rounded-e-3xl flex items-center self-center px-3 py-4 w-18 overflow-y-auto overflow-x-auto bg-gray-100 transition duration-75 ease-in-out">
                <ul className="space-y-2 font-medium">
                <li>
                    <a
                    href="#"
                    className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-200 group"
                    >
                    <IoHome className="text-2xl text-blue-700 transition duration-75 group-hover:text-gray-900" />
                    <span className="transition=transform transform duration-700 ease-in-out absolute ml-10 bg-gray-500 p-1 opacity-90 text-sm font-normal text-white ms-3 whitespace-nowrap invisible group-hover:visible">Owner Dashboard</span>
                    </a>
                </li>
                <li>
                    <a
                    href="#"
                    className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-200 group"
                    >
                    <TbLayoutListFilled className="text-2xl text-blue-700 transition duration-75 group-hover:text-gray-900" />
                    <span className="absolute ml-10 bg-gray-500 p-1 opacity-90 text-sm font-normal text-white flex-1 ms-3 whitespace-nowrap invisible group-hover:visible">
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
                    <span className="absolute flex-1 ml-10 bg-gray-500 p-1 opacity-90 text-sm font-normal text-white ms-3 whitespace-nowrap invisible group-hover:visible">Tenants</span>
                    </a>
                </li>
                <li>
                    <Link
                    to="/login"
                    className="flex items-center text-gray-900 rounded-lg hover:bg-gray-200 group"
                    >
                    <button className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-200 group">
                        <FaSignOutAlt className="text-2xl text-blue-700 transition duration-75 group-hover:text-gray-900" />
                        <span className="absolute flex-1 ml-10 bg-gray-500 p-1 opacity-90 text-sm font-normal text-white ms-3 whitespace-nowrap invisible group-hover:visible">Sign Out</span>
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