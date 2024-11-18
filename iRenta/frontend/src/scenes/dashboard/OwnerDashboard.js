import React from "react";
import { Link } from "react-router-dom";

const OwnerDashboard = () => {
  return (
    <div className="w-screen h-screen flex bg-gray-200">
      <nav className="fixed top-0 z-50 w-full bg-gray-100 border-b border-gray-200">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start rtl:justify-end">
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

      <aside
        id="default-sidebar"
        className="bg-gray-100 fixed top-0 left-0 z-40 pt-12 w-64 h-screen transition-transform -translate-x-full border-r border-gray-200 sm:translate-x-0"
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-100">
          <ul className="space-y-2 font-medium">
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-200 group"
              >
                <svg
                  className="w-5 h-5 text-blue-500 transition duration-75 group-hover:text-gray-900"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 15 15"
                >
                    <path d="M7.8254 0.120372C7.63815 -0.0401239 7.36185 -0.0401239 7.1746 0.120372L0 6.27003V13.5C0 14.3284 0.671573 15 1.5 15H5.5C5.77614 15 6 14.7761 6 14.5V11.5C6 10.6716 6.67157 10 7.5 10C8.32843 10 9 10.6716 9 11.5V14.5C9 14.7761 9.22386 15 9.5 15H13.5C14.3284 15 15 14.3284 15 13.5V6.27003L7.8254 0.120372Z"/>
                </svg>
                <span className="ms-3">Owner Dashboard</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-200 group"
              >
                <svg
                  className="flex-shrink-0 w-5 h-5 text-blue-500 transition duration-75 group-hover:text-gray-900"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 18 18"
                >
                    <path d="M0 0h4v3h-4v-3z"></path>
                    <path d="M0 4h4v3h-4v-3z"></path>
                    <path d="M0 12h4v3h-4v-3z"></path>
                    <path d="M0 8h4v3h-4v-3z"></path>
                    <path d="M5 0h11v3h-11v-3z"></path>
                    <path d="M5 4h11v3h-11v-3z"></path>
                    <path d="M5 12h11v3h-11v-3z"></path>
                    <path d="M5 8h11v3h-11v-3z"></path>                
                </svg>
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
                <svg
                  className="flex-shrink-0 w-5 h-5 text-blue-500 transition duration-75 group-hover:text-gray-900"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 18"
                >
                  <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Tenants</span>
              </a>
            </li>
            <li>
              <Link
                to="/login"
                className="flex items-center text-gray-900 rounded-lg hover:bg-gray-200 group"
              >
                <button className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-200 group">
                  <svg
                    className="flex-shrink-0 w-5 h-5 text-blue-500 transition duration-75 group-hover:text-gray-900"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 16"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"
                    />
                  </svg>
                  <span className="flex-1 ms-3 whitespace-nowrap">
                    Sign Out
                  </span>
                </button>
              </Link>
            </li>
          </ul>
        </div>
      </aside>

      <div className="w-screen pt-20 pl-4 sm:ml-64 overflow-x-hidden">
        <h1 className="font-bold text-2xl">OWNER DASHBOARD</h1>
      </div>
    </div>
  );
};

export default OwnerDashboard;
