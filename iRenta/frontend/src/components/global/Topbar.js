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
import { FaPowerOff, FaUserCircle, FaBell, FaBuilding, FaSearch } from "react-icons/fa";
import { AiFillHeart, AiFillHome } from "react-icons/ai";

const Topbar = ({ toggleSidebar, isOpen, setActiveContent }) => {
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

    if (notification.type === "RequestVisit") {
      setActiveContent("content4"); // Directly set the calendar as active content
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

  const handleReservations = () => {
    navigate("/reservations"); // Navigate to the Manage Listings page
  };

  const location = useLocation();
  const isOwnerDashboard = location.pathname === "/owner-dashboard";

  return (
    <nav className="fixed top-0 z-50 w-full bg-gray-100 border-b border-gray-200 shadow">
      <div className="">
        <div className="hidden lg:flex items-center justify-between px-6 py-3 lg:px-10 lg:pl-3">
          {/* Sidebar Toggle and Logo */}
          <div className="flex items-center justify-start">
            {isOwnerDashboard && (
              <button
                className="text-gray-900 rounded-lg hover:bg-gray-200 group"
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
                className="w-full bg-white border border-gray-300 rounded-full py-2 px-4 shadow-sm text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <div  className="relative">
              <ChatDropdown />
            </div>

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
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 cursor-pointer bg-gray-100"
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
                    <FaUserCircle className="h-10 w-10 text-blue-500 text-xl" />
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
                        <li className="flex w-full justify-center hover:bg-gray-100">
                          <button
                            className="flex items-center w-fit text-left px-4 py-3 text-sm text-gray-900"
                            onClick={handleReservations}
                          >
                            <h3 className="text-sm font-semibold text-gray-900 px-4">
                              Reservations
                            </h3>
                          </button>
                        </li>
                      {user.userType === "Owner" && (
                        <li className="flex w-full justify-center hover:bg-gray-100">
                          <button
                            className="flex items-center w-fit text-left px-4 py-3 text-sm text-gray-900"
                            onClick={handleManageListings}
                          >
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
                    <ul className="py-3">
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

        {/* Mobile Topbar Navigation */}
        <div className="lg:hidden grid grid-rows-2 shadow z-50">
          <div className="flex items-center justify-between w-full px-4 bg-white shadow-md">
            {/* Sidebar Toggle and Logo */}
            <div className="flex items-center justify-start">
              {isOwnerDashboard && (
                <button
                  className="text-gray-900 rounded-lg hover:bg-gray-200 group"
                  onClick={toggleSidebar}
                >
                  {isOpen ? (
                    <CgSidebarOpen className="text-center text-3xl text-blue-800 transition duration-75 group-hover:text-gray-900" />
                  ) : (
                    <CgSidebar className="text-center text-3xl text-blue-800 transition duration-75 group-hover:text-gray-900" />
                  )}
                </button>
              )}
              <Link to="/" className="flex flex-shrink-0 ms-2">
                <img
                  src="../assets/images/iRenta.png"
                  className="h-8 w-auto me-3"
                  alt="iRenta Logo"
                />
              </Link>
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap">
                iRenta
              </span>
            </div>

            {/* Search Bar */}
            <div className="w-full flex justify-end">
              <div className="max-w-xs">
                <button
                  className="h-full w-full py-4 hover:bg-gray-200 text-blue-500 hover:text-blue-600 flex justify-center items-center"
                >
                  <FaSearch className="text-2xl" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Nav bar */}
          <div className="grid grid-cols-5 w-full bg-white shadow-md z-50">
            {/* Home Button */}
            <div className="w-full group mx-auto">
              <button
                className={`h-full w-full py-1 ${
                  location.pathname === "/" ? "bg-blue-100 text-blue-500" : "text-gray-500"
                } hover:bg-gray-200 hover:text-blue-600 flex justify-center items-center`}
                onClick={() => navigate("/")}
              >
                <AiFillHome className="text-3xl" />
              </button>
              <h5 className="hidden group-hover:block absolute top-full left-1/2 transform -translate-x-1/2 text-nowrap mt-2 text-sm text-white bg-gray-500 p-1 rounded-lg opacity-90 cursor-default">
                Home
              </h5>
            </div>

            {/* Like Button */}
            <div className="w-full group mx-auto">
              <button
                className={`h-full w-full py-1 ${
                  location.pathname === "/liked-listing"
                    ? "bg-blue-100 text-blue-500"
                    : "text-gray-500"
                } hover:bg-gray-200 hover:text-red-600 flex justify-center items-center`}
                onClick={() => navigate("/liked-listing")}
              >
                <AiFillHeart className="text-3xl" />
              </button>
              <h5 className="hidden group-hover:block absolute top-full left-1/2 transform -translate-x-1/2 text-nowrap mt-2 text-sm text-white bg-gray-500 p-1 rounded-lg opacity-90 cursor-default">
                Liked Listings
              </h5>
            </div>

            {/* Chat Dropdown */}
            <div className="w-full group mx-auto">
              <ChatDropdown />
            </div>

            {/* Notification Button */}
            <div className="w-full group mx-auto" ref={notifRef}>
              <button
                className={`h-full w-full py-1 ${
                  notifOpen ? "bg-blue-100 text-blue-500" : "text-gray-500"
                } hover:bg-gray-200 hover:text-blue-600 flex justify-center items-center`}
                onClick={handleNotifToggle}
              >
                <FaBell className="text-3xl" />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              <h5 className="hidden group-hover:block absolute top-full left-1/2 transform -translate-x-1/2 text-nowrap mt-2 text-sm text-white bg-gray-500 p-1 rounded-lg opacity-90 cursor-default">
                Notification
              </h5>
              {notifOpen && (
                <div className="fixed mt-28 inset-0 bg-white mx-1 z-50 flex flex-col transition-all duration-300 lg:hidden">
                  <ul className="py-2">
                    <li className="flex gap-4 items-center text-left m-4 bg-gray-100 rounded-lg px-4 py-4 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
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
            <div className="group w-full mx-auto" ref={profileRef}>
              <button
                className={`h-full w-full py-1 ${
                  dropdownOpen ? "bg-blue-100 text-blue-500" : "text-gray-500"
                } hover:bg-gray-200 hover:text-blue-600 flex justify-center items-center`}
                onClick={handleProfileToggle}
              >
                <div className="h-full w-full flex items-center justify-center overflow-hidden">
                  {user ? (
                    <img
                      src={
                        userProfile?.info?.profile.link ||
                        "https://via.placeholder.com/150"
                      }
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <FaUserCircle className="h-10 w-10 text-blue-500 text-lg" />
                  )}
                </div>
              </button>
              <h5 className="hidden group-hover:block absolute top-full left-1/2 transform -translate-x-1/2 text-nowrap mt-2 text-sm text-white bg-gray-500 p-1 rounded-lg opacity-90 cursor-default">
                Your Profile
              </h5>
              {dropdownOpen && (
                <div className="fixed mt-28 inset-0 bg-white mx-1 z-50 flex flex-col transition-all duration-300 lg:hidden">
                  {user ? (
                    // Logged-in Dropdown
                    <ul className="py-2 flex flex-col">
                      <li className="flex gap-4 items-center text-left m-4 bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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
                            className="flex items-center w-fit text-left px-4 py-1 text-sm text-gray-900"
                            onClick={handleManageListings}
                          >
                            <h3 className="text-sm font-semibold text-gray-900 px-4">
                              Manage Listings
                            </h3>
                          </button>
                        </li>
                      )}
                      {/* Logout Button */}
                      <li className="flex self-end w-full justify-center">
                        <button
                          onClick={logout}
                          className="w-full flex gap-4 items-center text-left m-4 bg-gray-100 rounded-lg p-4 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FaPowerOff className="h-5 w-5" />
                          <h3 className="text-sm font-semibold px-4">
                            Log out
                          </h3>
                        </button>
                      </li>
                    </ul>
                  ) : (
                    // Logged-out Dropdown
                    <ul className="py-3">
                      <li className="flex w-full justify-center">
                        <Link
                          to="/login"
                          className="w-full flex gap-2 items-center justify-center text-left m-4 rounded-full p-4 bg-blue-500 text-gray-100 hover:bg-blue-600"
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
                          className="w-full flex gap-4 items-center justify-center text-center m-4 rounded-full p-4 bg-gray-100 text-gray-100 hover:bg-gray-200"
                        >
                          <span className="text-sm font-semibold text-gray-500 group-hover:text-gray-900">
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
