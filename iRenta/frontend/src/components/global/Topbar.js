import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../global/contexts/AuthContext";
import { NotificationContext } from "../../global/contexts/NotificationContext";
import { GetToken } from "../../global/utils/Token.js";
import { fetchUserData } from "../../global/api/Users.js";
import {
  fetchNotifications,
  markNotificationAsViewed,
} from "../../global/api/Notifications.js";
import ChatDropdown from "../Chat/ChatDropdown";

// icons
import { CgSidebar, CgSidebarOpen } from "react-icons/cg";
import { FaPowerOff, FaUserCircle, FaBell, FaBuilding } from "react-icons/fa";
import { AiFillHeart } from "react-icons/ai";

const Topbar = ({ toggleSidebar, isOpen }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { logout, user } = useContext(AuthContext);
  const [notifOpen, setNotifOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    info: {
      firstName: "",
      lastName: "",
      profile: { link: "" },
    },
  });

  const storedToken = GetToken();
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const navigate = useNavigate();

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const getNotifications = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.viewed).length);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    getNotifications();
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.viewed) {
      await markNotificationAsViewed(notification._id);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id ? { ...n, viewed: true } : n
        )
      );
      setUnreadCount((prev) => prev - 1);
    }

    if (notification.type === "RequestVisit" && user?.userType === "Owner") {
      navigate("/owner-dashboard"); // Navigate to the OcularVisitCalendar
    }
  };

  const handleNotifToggle = () => {
    setNotifOpen(!notifOpen);
    setDropdownOpen(false);
  };

  const handleProfileToggle = () => {
    setDropdownOpen(!dropdownOpen);
    setNotifOpen(false);
  };

  const handleManageListings = () => {
    navigate("/owner-dashboard"); // Navigate to the Manage Listings page
  };

  const location = useLocation();
  const isOwnerDashboard = location.pathname === "/owner-dashboard";

  return (
    <nav className="fixed top-0 z-50 w-full bg-gray-100 border-b border-gray-200 shadow">
      <div className="px-6 py-3 lg:px-10 lg:pl-3">
        <div className="flex items-center justify-between">
          {/* Sidebar Toggle and Logo */}
          <div className="flex items-center justify-start">
            {isOwnerDashboard && (
              <button
                className="text-gray-900 rounded-lg hover:bg-gray-300 group"
                onClick={toggleSidebar}
              >
                {isOpen ? (
                  <CgSidebarOpen className="text-center text-3xl text-blue-800 transition duration-75 group-hover:text-gray-900" />
                ) : (
                  <CgSidebar className="text-center text-3xl text-blue-800 transition duration-75 group-hover:text-gray-900" />
                )}
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
            {/* Like Button */}
            <div className="relative group">
              <button
                className="h-10 w-10 bg-gray-200 hover:bg-gray-300 rounded-full text-red-500 hover:text-red-600 flex justify-center items-center"
                onClick={() => navigate("/liked-listing")}
              >
                <AiFillHeart className="text-lg" />
              </button>
              <h5 className="hidden group-hover:block absolute top-full left-1/2 transform -translate-x-1/2 text-nowrap mt-2 text-sm text-white bg-gray-500 p-1 rounded-lg opacity-90 cursor-default">
                Liked Listings
              </h5>
            </div>

            {/* Chat Dropdown */}
            <ChatDropdown />

            {/* Notification Button */}
            <div className="relative group" ref={notifRef}>
              <button
                onClick={handleNotifToggle}
                className="h-10 w-10 bg-gray-200 hover:bg-gray-300 rounded-full text-blue-500 hover:text-blue-600 flex justify-center items-center"
              >
                <FaBell className="text-lg" />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              <h5 className="hidden group-hover:block absolute top-full left-1/2 transform -translate-x-1/2 text-nowrap mt-2 text-sm text-white bg-gray-500 p-1 rounded-lg opacity-90 cursor-default">
                Notification
              </h5>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-md z-50">
                  <ul className="py-2">
                    <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                      <Link
                        to="/view-contract"
                        className="block w-full text-left"
                      >
                        View Contract
                      </Link>
                    </li>
                  </ul>
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {notification.message}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Button */}
            <div className="relative group" ref={profileRef}>
              <button
                onClick={handleProfileToggle}
                className="flex items-center gap-2 rounded-full hover:ring-blue-500 hover:ring-4 transition-all"
              >
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {user ? (
                    <img
                      src={
                        userProfile?.info?.profile.link ||
                        "https://via.placeholder.com/150"
                      }
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FaUserCircle className="h-full w-full text-blue-500 text-xl" />
                  )}
                </div>
              </button>
              <h5 className="hidden group-hover:block absolute top-full left-1/2 transform -translate-x-1/2 text-nowrap mt-2 text-sm text-white bg-gray-500 p-1 rounded-lg opacity-90 cursor-default">
                Your Profile
              </h5>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-md">
                  {user ? (
                    // Logged-in Dropdown
                    <ul className="py-2">
                      <li className="flex justify-evenly items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          <img
                            src={
                              userProfile?.info?.profile.link ||
                              "https://via.placeholder.com/150"
                            }
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-800">
                          {userProfile?.info?.firstName}
                        </h3>
                      </li>
                      <hr className="my-2"></hr>
                      {user.userType === "Owner" && (
                        <li className="flex w-full justify-center hover:bg-gray-100">
                          <button
                            className="flex items-center w-fit text-left px-4 py-3 text-sm text-gray-900"
                            onClick={handleManageListings}
                          >
                            <FaBuilding className="h-5 w-5" />
                            <h3 className="text-sm font-semibold text-gray-900 px-4">
                              Manage Listings
                            </h3>
                          </button>
                        </li>
                      )}
                      {/* Liked Button */}
                      <hr className="my-2"></hr>
                      <li className="flex w-full justify-center">
                        <button
                          onClick={logout}
                          className="flex items-center w-fit text-left px-4 py-3 text-sm rounded-full bg-blue-500 text-gray-100 hover:bg-blue-600"
                        >
                          <FaPowerOff className="h-5 w-5" />
                          <h3 className="text-sm font-semibold text-gray-100 px-4">
                            Log out
                          </h3>
                        </button>
                      </li>
                    </ul>
                  ) : (
                    // Logged-out Dropdown
                    <ul className="py-4">
                      <li className="flex w-full justify-center">
                        <Link
                          to="/login"
                          className="flex items-center w-fit px-4 py-3 text-sm rounded-full bg-blue-500 text-gray-100 hover:bg-blue-600"
                        >
                          <FaPowerOff className="h-5 w-5" />
                          <span className="text-sm font-semibold text-gray-100 px-4">
                            Log in
                          </span>
                        </Link>
                      </li>
                      <li className="flex w-full justify-center">
                        <Link
                          to="/register"
                          className="flex items-center w-fit px-4 py-3 text-sm text-gray-100 group "
                        >
                          <span className="text-sm font-semibold text-gray-500 px-4 group-hover:text-gray-900">
                            Register
                          </span>
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
