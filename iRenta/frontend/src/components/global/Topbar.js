import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { GetToken } from "../../global/utils/Token.js"; // Import utilities
import { fetchUserData } from "../../api/Users.js";
import { AuthContext } from "../../global/contexts/AuthContext";

// icons
import { CgSidebar, CgSidebarOpen } from "react-icons/cg";
import { FaPowerOff, FaUserCircle } from "react-icons/fa";

const Topbar = ({ toggleSidebar, isOpen }) => {
  const { logout, user } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    info: {
      firstName: "",
      lastName: "",
      profile: { link: "" },
    },
  });

  const storedToken = GetToken();

  useEffect(() => {
    const fetchUser = async () => {
      if (user?.id) {
        try {
          const user_data = await fetchUserData(user.id, storedToken);
          setUserProfile(user_data);
        } catch (err) {
          console.error("Failed to fetch user data:", err);
        }
      }
    };

    fetchUser();
  }, [user, storedToken]);

  const location = useLocation(); // Get the current route

  // Check if current route is OwnerDashboard
  const isOwnerDashboard = location.pathname === "/owner-dashboard";

  return (
    <nav className="fixed top-0 z-50 w-full bg-gray-100 border-b border-gray-200 shadow">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          {/* Sidebar Toggle and Logo */}
          <div className="flex items-center justify-start rtl:justify-end">
            {isOwnerDashboard && (
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
                  {isOpen ? "Close Sidebar" : "Open Sidebar"}
                </span>
              </button>
            )}
            <Link to="/" className="flex ms-2 md:me-24">
              <img
                src="../assets/images/iRenta.png"
                className="h-8 me-3"
                alt="iRenta Logo"
              />
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap">
                iRenta
              </span>
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

          {/* User Section */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 py-2 px-4 bg-gray-200 rounded-full hover:bg-blue-500 transition-all"
              >
                <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img
                    src={userProfile.info.profile.link || "https://via.placeholder.com/150"}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="text-md font-semibold text-gray-800">
                  {userProfile.info.firstName}
                </h3>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-md">
                  <ul className="py-2">
                    <li>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-4 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Topbar;