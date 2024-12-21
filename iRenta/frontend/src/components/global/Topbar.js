import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { GetToken } from "../../global/utils/Token.js"; // Import utilities
import { fetchUserData } from "../../api/Users.js";
import { AuthContext } from "../../global/contexts/AuthContext";

// icons
import { CgSidebar, CgSidebarOpen } from "react-icons/cg";
import { FaPowerOff, FaUserCircle, FaBell, FaCommentAlt } from "react-icons/fa";

const Topbar = ({ toggleSidebar, isOpen }) => {
  const { logout, user } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    info: {
      firstName: "",
      lastName: "",
      profile: { link: "" },
    },
  });

  const storedToken = GetToken();

  const chatRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

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

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatRef.current &&
        !chatRef.current.contains(event.target) &&
        notifRef.current &&
        !notifRef.current.contains(event.target) &&
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setChatOpen(false);
        setNotifOpen(false);
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close other dropdowns when clicking a button
  const handleChatToggle = () => {
    setChatOpen(!chatOpen);
    setNotifOpen(false);
    setDropdownOpen(false);
  };

  const handleNotifToggle = () => {
    setNotifOpen(!notifOpen);
    setChatOpen(false);
    setDropdownOpen(false);
  };

  const handleProfileToggle = () => {
    setDropdownOpen(!dropdownOpen);
    setChatOpen(false);
    setNotifOpen(false);
  };

  const location = useLocation(); // Get the current route

  // Check if current route is OwnerDashboard
  const isOwnerDashboard = location.pathname === "/owner-dashboard";

  return (
    <nav className="fixed top-0 z-50 w-full bg-gray-100 border-b border-gray-200 shadow">
      <div className="px-6 py-3 lg:px-10 lg:pl-3">
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
          <div className="flex items-center gap-3">
            {/* Chat Button */}
            <div className="relative" ref={chatRef}>
              <button
                onClick={handleChatToggle}
                className="h-10 w-10 bg-gray-200 hover:bg-gray-300 rounded-full text-blue-500 hover:text-blue-600 flex justify-center items-center"
              >
                <FaCommentAlt className="text-md" />
              </button>
              {chatOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-md z-50">
                  <ul className="py-2">
                    <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                      No new messages
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Notification Button */}
            <div className="relative" ref={notifRef}>
            <button
              onClick={handleNotifToggle}
              className="h-10 w-10 bg-gray-200 hover:bg-gray-300  rounded-full text-blue-500 hover:text-blue-600 flex justify-center items-center"
            >
              <FaBell className="text-lg" />
            </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-md z-50">
                  <ul className="py-2">
                    <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                    <Link to="/view-contract" className="block w-full text-left">
                      View Contract
                    </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Profile Button */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={handleProfileToggle}
                className="flex items-center gap-2 rounded-full hover:ring-blue-500 hover:ring-4 transition-all"
              >
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {user ? (
                    <img
                      src={userProfile.info.profile.link || "https://via.placeholder.com/150"}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FaUserCircle className="text-blue-500 text-xl" />
                  )}
                </div>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-md">
                  {user ? (
                    // Logged-in Dropdown
                    <ul className="py-2">
                      <li className="flex justify-evenly items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          <img
                            src={userProfile.info.profile.link || "https://via.placeholder.com/150"}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-800">
                          {userProfile.info.firstName}
                        </h3>
                      </li>
                      <hr className="my-2"></hr>
                      <li>
                        <button
                          onClick={logout}
                          className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FaPowerOff className="h-5 w-5" />
                          <h3 className="text-sm font-semibold text-gray-800 px-4">
                            Log Out
                          </h3>
                        </button>
                      </li>
                    </ul>
                  ) : (
                    // Logged-out Dropdown
                    <ul className="py-2">
                      <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <Link to="/login" className="block w-full text-left">
                          Log in
                        </Link>
                      </li>
                      <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <Link to="/register" className="block w-full text-left">
                          Register
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Topbar;