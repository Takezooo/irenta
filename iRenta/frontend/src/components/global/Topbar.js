import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../global/contexts/AuthContext";
import { NotificationContext } from "../../global/contexts/NotificationContext";
import { ThemeContext } from "../../contexts/ThemeContext.js";
import { GetToken } from "../../global/utils/Token.js";
import { fetchUserData } from "../../global/api/Users.js";
import {
  fetchNotifications,
  markNotificationAsViewed,
} from "../../global/api/Notifications.js";
import ChatDropdown from "../Chat/ChatDropdown";
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';

// icons
import { CgSidebar, CgSidebarOpen } from "react-icons/cg";
import {
  FaPowerOff,
  FaUserCircle,
  FaBell,
  FaBuilding,
  FaSearch,
  FaTimes,
  FaCheck,
  FaClock,
  FaEye,
} from "react-icons/fa";
import { AiFillHeart, AiFillHome } from "react-icons/ai";
import socket, { subscribeToNotifications } from "../../global/utils/Socket.js";
import { ChatDropdownContext } from "../../global/contexts/ChatDropdownContext";

const Topbar = ({ toggleSidebar, isOpen, setActiveContent }) => {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { logout, user } = useContext(AuthContext);
  const [notifOpen, setNotifOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const { dropdownOpen: chatDropdownOpen, setDropdownOpen: setChatDropdownOpen, chatRoomOpen, setChatRoomOpen } = useContext(ChatDropdownContext);
  
  const storedToken = GetToken();
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const mobileNotifRef = useRef(null);
  const mobileProfileRef = useRef(null);

  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Function to close all dropdowns
  const closeAllDropdowns = () => {
    setNotifOpen(false);
    setDropdownOpen(false);
    setChatDropdownOpen(false);
    setChatRoomOpen(false);
  };

  // Close dropdowns when chat dropdown opens
  useEffect(() => {
    if (chatDropdownOpen) {
      setNotifOpen(false);
      setDropdownOpen(false);
    }
  }, [chatDropdownOpen]);
  
  // Close dropdowns when chat room opens
  useEffect(() => {
    if (chatRoomOpen) {
      setNotifOpen(false);
      setDropdownOpen(false);
    }
  }, [chatRoomOpen]);
  
  // Update notification toggle to close all other dropdowns
  const handleNotifToggle = () => {
    if (chatDropdownOpen) setChatDropdownOpen(false);
    if (chatRoomOpen) setChatRoomOpen(false);
    if (dropdownOpen) setDropdownOpen(false);
    setNotifOpen(!notifOpen);
  };

  // Update profile toggle to close all other dropdowns
  const handleProfileToggle = () => {
    if (chatDropdownOpen) setChatDropdownOpen(false);
    if (chatRoomOpen) setChatRoomOpen(false);
    if (notifOpen) setNotifOpen(false);
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Desktop notification dropdown
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      
      // Desktop profile dropdown
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      
      // Mobile notification panel
      if (mobileNotifRef.current && !mobileNotifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      
      // Mobile profile panel
      if (mobileProfileRef.current && !mobileProfileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      
      // Check if click is outside any dropdown area
      const isOutsideAllDropdowns = 
        (!notifRef.current || !notifRef.current.contains(event.target)) &&
        (!profileRef.current || !profileRef.current.contains(event.target)) &&
        (!mobileNotifRef.current || !mobileNotifRef.current.contains(event.target)) &&
        (!mobileProfileRef.current || !mobileProfileRef.current.contains(event.target));
        
      // If the event.target has data-dropdown-toggle attribute, don't close dropdowns
      // This prevents dropdowns from closing when clicking chat toggle buttons
      if (isOutsideAllDropdowns && !event.target.closest('[data-dropdown-toggle]')) {
        // Only close dropdowns if click is outside dropdown toggle buttons
        if (!event.target.closest('.dropdown-toggle')) {
          setNotifOpen(false);
          setDropdownOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogoutClick = () => {
    setShowConfirmation(true); // Show confirmation modal
  };

  const handleConfirmLogout = () => {
    setShowConfirmation(false); // Close the modal
    logout(); // Call the logout function
  };

  const handleCancelLogout = () => {
    setShowConfirmation(false); // Close the modal
  };

  useEffect(() => {
    if (user?.id) {
      subscribeToNotifications(user.id); // Subscribe to user's room

      socket.on("newNotification", (notification) => {
        // Show toast notification for new notifications
        toast.info(notification.message, {
          position: "top-right",
          autoClose: 5000,
        });
        
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1); // Increment unread count
      });

      return () => {
        socket.off("newNotification"); // Cleanup listener
      };
    }
  }, [user?.id]);

  useEffect(() => {
    const getNotifications = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.viewed).length); // Calculate unread count
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
    
    // Close notification dropdown
    setNotifOpen(false);
    
    if (setActiveContent) {
      if (notification.type === "RequestVisit") {
        setActiveContent("content4");
      } // Directly set the calendar as active content
    } else {
      // Fallback navigation logic if setActiveContent is not available
      if (notification.type === "RequestVisit") {
        console.warn("setActiveContent is not provided. Please define routes.");
      }
    }
    if (notification.type === "ReservationRequest") {
      navigate("/reservations");
    }
    if (notification.type === "LeaseSent" && notification.leaseId) {
      navigate("/view-lease", { state: { leaseId: notification.leaseId } });
    }
  };

  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      for (const notification of notifications) {
        if (!notification.viewed) {
          await markNotificationAsViewed(notification._id);
        }
      }
      
      // Update local state
      setNotifications(notifications.map(n => ({ ...n, viewed: true })));
      setUnreadCount(0);
      
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleManageListings = () => {
    navigate("/owner-dashboard");
    setDropdownOpen(false);
  };

  const handleReservations = () => {
    navigate("/reservations");
    setDropdownOpen(false);
  };

  // Format date for notifications
  const formatNotificationTime = (dateString) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const location = useLocation();
  const isOwnerDashboard = location.pathname === "/owner-dashboard";

  // Add clear all notifications function
  const handleClearAllNotifications = async () => {
    try {
      // First mark all as read
      for (const notification of notifications) {
        if (!notification.viewed) {
          await markNotificationAsViewed(notification._id);
        }
      }
      
      // Clear notifications array
      setNotifications([]);
      setUnreadCount(0);
      setShowClearConfirmation(false);
      
      toast.success("All notifications cleared");
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast.error("Failed to clear notifications");
      setShowClearConfirmation(false);
    }
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow">
      <div className="">
        <div className="hidden lg:flex items-center justify-between px-6 py-3 lg:px-10 lg:pl-3">
          <div className="flex items-center justify-start">
            {isOwnerDashboard && (
              <button
                className="text-gray-900 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 group"
                onClick={toggleSidebar}
              >
                {isOpen ? (
                  <CgSidebarOpen className="text-center text-3xl text-blue-800 transition duration-75 group-hover:text-gray-900 dark:group-hover:text-gray-300" />
                ) : (
                  <CgSidebar className="text-center text-3xl text-blue-800 transition duration-75 group-hover:text-gray-900 dark:group-hover:text-gray-300" />
                )}
              </button>
            )}
            <Link to="/" className="flex ms-2 md:me-24">
              <img
                src="./assets/images/irenta.png"
                className="h-8 me-3"
                alt="iRenta Logo"
                loading="lazy"
                decoding="async"
              />
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
                iRenta
              </span>
            </Link>
          </div>

          {/* <div className="flex-1 flex ml-[30%]">
            <div className="w-full max-w-xs">
              <input
                type="text"
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full py-2 px-4 shadow-sm text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search..."
              />
            </div>
          </div> */}

          <div className="flex items-center gap-3">
            <div className="relative group">
              <button
                className="h-10 w-10 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-full text-red-500 hover:text-red-600 flex justify-center items-center"
                onClick={() => navigate("/liked-listing")}
              >
                <AiFillHeart className="text-lg" />
              </button>
              <h5 className="hidden group-hover:block absolute top-full left-1/2 transform -translate-x-1/2 text-nowrap mt-2 text-sm text-white bg-gray-500 p-1 rounded-lg opacity-90 cursor-default">
                Liked Listings
              </h5>
            </div>

            <div className="relative">
              <ChatDropdown />
            </div>

            <div className="relative group" ref={notifRef}>
              <button
                onClick={handleNotifToggle}
                data-dropdown-toggle="notification-dropdown"
                className="dropdown-toggle h-10 w-10 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-full text-blue-500 hover:text-blue-600 flex justify-center items-center"
              >
                <FaBell className="text-lg" />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              <h5 className="hidden group-hover:block absolute top-full left-1/2 transform -translate-x-1/2 text-nowrap mt-2 text-sm text-white bg-gray-500 dark:bg-gray-700 p-1 rounded-lg opacity-90 cursor-default">
                Notification
              </h5>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50">
                  <div className="sticky top-0 flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Notifications</h3>
                    <div className="flex gap-2">
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button 
                          onClick={() => setShowClearConfirmation(true)}
                          className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      <FaBell className="mx-auto text-4xl mb-2 opacity-30" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    <div>
                      {notifications.map((notification) => (
                        <div
                          key={notification._id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`relative px-4 py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
                            notification.viewed 
                              ? "bg-white dark:bg-gray-700" 
                              : "bg-blue-50 dark:bg-gray-600"
                          } hover:bg-gray-100 dark:hover:bg-gray-600`}
                        >
                          {!notification.viewed && (
                            <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-blue-500"></span>
                          )}
                          
                          <div className="flex items-start">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                              notification.type === "ReservationRequest" 
                                ? "bg-purple-100 text-purple-500 dark:bg-purple-900 dark:text-purple-300"
                                : notification.type === "RequestVisit"
                                  ? "bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-300" 
                                  : notification.type === "LeaseSent"
                                    ? "bg-green-100 text-green-500 dark:bg-green-900 dark:text-green-300"
                                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                            }`}>
                              {notification.type === "ReservationRequest" ? (
                                <FaBuilding className="text-lg" />
                              ) : notification.type === "RequestVisit" ? (
                                <FaEye className="text-lg" />
                              ) : notification.type === "LeaseSent" ? (
                                <FaCheck className="text-lg" />
                              ) : (
                                <FaBell className="text-lg" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <p className={`text-sm ${
                                notification.viewed 
                                  ? "text-gray-700 dark:text-gray-300" 
                                  : "text-gray-900 dark:text-white font-medium"
                              }`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                <FaClock className="mr-1" />
                                {formatNotificationTime(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative group" ref={profileRef}>
              <button
                onClick={handleProfileToggle}
                data-dropdown-toggle="profile-dropdown"
                className="dropdown-toggle flex items-center gap-2 rounded-full hover:ring-blue-500 dark:hover:ring-gray-600 hover:ring-4 transition-all"
              >
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                  {user ? (
                    <img
                      src={
                        user?.info?.profile.link ||
                        "https://via.placeholder.com/150"
                      }
                      alt="Profile"
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <FaUserCircle className="h-10 w-10 text-blue-500 text-xl" />
                  )}
                </div>
              </button>
              <h5 className="hidden group-hover:block absolute top-full left-1/2 transform -translate-x-1/2 text-nowrap mt-2 text-sm text-white bg-gray-500 dark:bg-gray-700 p-1 rounded-lg opacity-90 cursor-default">
                Your Profile
              </h5>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-md">
                  {user ? (
                    <ul className="py-2">
                      <li className="flex justify-evenly items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 cursor-default">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                          <img
                            src={
                              user?.info?.profile.link ||
                              "https://via.placeholder.com/150"
                            }
                            alt="Profile"
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {user?.info?.firstName}
                        </h3>
                      </li>
                      <hr className="my-2"></hr>
                      <li className="flex w-full hover:bg-gray-100 dark:hover:bg-gray-600">
                        <button
                          className="flex items-center w-fit text-left px-4 py-3 text-sm text-gray-900 dark:text-gray-300"
                          onClick={() => navigate("/view-profile")}
                        >
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 px-4">
                            Your Profile
                          </h3>
                        </button>
                      </li>
                      {user?.tenantBadge === true && (
                        <li className="flex w-full hover:bg-gray-100 dark:hover:bg-gray-600">
                          <button
                            className="flex items-center w-fit text-left px-4 py-3 text-sm text-gray-900 dark:text-gray-300"
                            onClick={()=> navigate("/tenant-dashboard")}
                          >
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 px-4">
                              Tenant Dashboard
                            </h3>
                          </button>
                        </li>
                      )}
                      <li className="flex w-full hover:bg-gray-100 dark:hover:bg-gray-600">
                        <button
                          className="flex items-center w-fit text-left px-4 py-3 text-sm text-gray-900 dark:text-gray-300"
                          onClick={handleReservations}
                        >
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 px-4">
                            Reservations
                          </h3>
                        </button>
                      </li>
                      {user.userType === "Owner" && (
                        <li className="flex w-full hover:bg-gray-100 dark:hover:bg-gray-600">
                          <button
                            className="flex items-center w-fit text-left px-4 py-3 text-sm text-gray-900 dark:text-gray-300"
                            onClick={handleManageListings}
                          >
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 px-4">
                              Manage Listings
                            </h3>
                          </button>
                        </li>
                      )}
                      <li
                        className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-2"
                        onClick={toggleDarkMode} // Move the onClick here
                      >
                        <span className="px-4 text-sm font-medium dark:text-gray-100">
                          {darkMode ? "Dark Mode" : "Light Mode"}
                        </span>
                        <div
                          className={`w-12 h-6 flex items-center ${
                            darkMode ? "bg-gray-800" : "bg-gray-300"
                          } rounded-full p-1 cursor-pointer transition-colors duration-300`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow-md transform ${
                              darkMode ? "translate-x-6" : "translate-x-0"
                            } transition-transform duration-300`}
                          ></div>
                        </div>
                      </li>
                      <hr className="my-2"></hr>
                      <li className="flex w-full justify-center">
                        <button
                          onClick={handleLogoutClick}
                          className="flex items-center w-fit text-left px-4 py-3 text-sm rounded-full bg-blue-500 text-gray-100 hover:bg-blue-600"
                        >
                          <FaPowerOff className="h-5 w-5" />
                          <h3 className="text-sm font-semibold text-gray-100 px-4">
                            Log out
                          </h3>
                        </button>
                      </li>
                      {/* Confirmation Modal */}
                      {showConfirmation && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                          <div
                            className={`w-full max-w-sm p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md`}
                          >
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                              Are you sure you want to log out?
                            </h2>
                            <div className="flex justify-end space-x-4">
                              <button
                                onClick={handleCancelLogout}
                                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleConfirmLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                              >
                                Log out
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </ul>
                  ) : (
                    <ul className="py-3">
                      <li
                        className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-2"
                        onClick={toggleDarkMode} // Move the onClick here
                      >
                        <span className="px-4 text-sm font-medium dark:text-gray-100">
                          {darkMode ? "Dark Mode" : "Light Mode"}
                        </span>
                        <div
                          className={`w-12 h-6 flex items-center ${
                            darkMode ? "bg-gray-800" : "bg-gray-300"
                          } rounded-full p-1 cursor-pointer transition-colors duration-300`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow-md transform ${
                              darkMode ? "translate-x-6" : "translate-x-0"
                            } transition-transform duration-300`}
                          ></div>
                        </div>
                      </li>
                      <hr className="w-full my-2 mb-4"></hr>
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
          <div className="flex items-center justify-between w-full px-4 bg-white dark:bg-gray-800 shadow-md">
            {/* Sidebar Toggle and Logo */}
            <div className="flex items-center justify-start">
              {isOwnerDashboard && (
                <button
                  className="text-gray-900 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 group"
                  onClick={toggleSidebar}
                >
                  {isOpen ? (
                    <CgSidebarOpen className="text-center text-3xl text-blue-800 transition duration-75 group-hover:text-gray-900 dark:group-hover:text-gray-300" />
                  ) : (
                    <CgSidebar className="text-center text-3xl text-blue-800 transition duration-75 group-hover:text-gray-900 dark:group-hover:text-gray-300" />
                  )}
                </button>
              )}
              <Link to="/" className="flex flex-shrink-0 ms-2">
                <img
                  src="./assets/images/irenta.png"
                  className="h-8 w-auto me-3"
                  alt="iRenta Logo"
                  loading="lazy"
                  decoding="async"
                />
              </Link>
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
                iRenta
              </span>
            </div>

            {/* Search Bar */}
            {/* <div className="w-full flex justify-end">
              <div className="max-w-xs">
                <button className="h-full w-full py-4 hover:bg-gray-200 dark:hover:bg-gray-600 text-blue-500 hover:text-blue-600 flex justify-center items-center">
                  <FaSearch className="text-2xl" />
                </button>
              </div>
            </div> */}
          </div>

          {/* Mobile Nav bar */}
          <div className="grid grid-cols-5 w-full bg-white dark:bg-gray-800 shadow-md z-50">
            {/* Home Button */}
            <div className="w-full group mx-auto">
              <button
                className={`h-full w-full py-1 ${
                  location.pathname === "/"
                    ? "bg-blue-100 dark:bg-blue-800 text-blue-500"
                    : "text-gray-500 dark:text-gray-300"
                } hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-blue-600 flex justify-center items-center`}
                onClick={() => navigate("/")}
              >
                <AiFillHome className="text-3xl" />
              </button>
              <h5 className="hidden group-hover:block absolute top-full left-1/2 transform -translate-x-1/2 text-nowrap mt-2 text-sm text-white bg-gray-500 dark:bg-gray-700 p-1 rounded-lg opacity-90 cursor-default">
                Home
              </h5>
            </div>

            {/* Like Button */}
            <div className="w-full group mx-auto">
              <button
                className={`h-full w-full py-1 ${
                  location.pathname === "/liked-listing"
                    ? "bg-blue-100 dark:bg-blue-800 text-blue-500"
                    : "text-gray-500 dark:text-gray-300"
                } hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-red-600 flex justify-center items-center`}
                onClick={() => navigate("/liked-listing")}
              >
                <AiFillHeart className="text-3xl" />
              </button>
              <h5 className="hidden group-hover:block absolute top-full left-1/2 transform -translate-x-1/2 text-nowrap mt-2 text-sm text-white bg-gray-500 dark:bg-gray-700 p-1 rounded-lg opacity-90 cursor-default">
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
                  notifOpen
                    ? "bg-blue-100 dark:bg-blue-800 text-blue-500"
                    : "text-gray-500 dark:text-gray-300"
                } hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-blue-600 flex justify-center items-center dropdown-toggle`}
                onClick={handleNotifToggle}
                data-dropdown-toggle="notification-dropdown-mobile"
              >
                <FaBell className="text-3xl" />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              <h5 className="hidden group-hover:block absolute top-full left-1/2 transform -translate-x-1/2 text-nowrap mt-2 text-sm text-white bg-gray-500 dark:bg-gray-700 p-1 rounded-lg opacity-90 cursor-default">
                Notification
              </h5>
              {notifOpen && (
                <div 
                  ref={mobileNotifRef}
                  className="fixed mt-28 inset-0 bg-white dark:bg-gray-800 mx-1 z-50 flex flex-col transition-all duration-300 lg:hidden"
                >
                  <div className="sticky top-0 flex justify-between items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Notifications</h2>
                    <div className="flex gap-4">
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllAsRead}
                          className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button 
                          onClick={() => setShowClearConfirmation(true)}
                          className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Clear all
                        </button>
                      )}
                      <button 
                        onClick={() => setNotifOpen(false)}
                        className="rounded-full p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center p-4 text-center text-gray-500 dark:text-gray-400">
                        <FaBell className="text-6xl mb-4 opacity-30" />
                        <p className="text-lg">No notifications yet</p>
                        <p className="text-sm mt-2">We'll notify you when something important happens</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {notifications.map((notification) => (
                          <div
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`relative p-4 cursor-pointer transition-colors ${
                              notification.viewed 
                                ? "bg-white dark:bg-gray-800" 
                                : "bg-blue-50 dark:bg-gray-700"
                            } hover:bg-gray-100 dark:hover:bg-gray-600`}
                          >
                            <div className="flex items-start">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                                notification.type === "ReservationRequest" 
                                  ? "bg-purple-100 text-purple-500 dark:bg-purple-900 dark:text-purple-300"
                                  : notification.type === "RequestVisit"
                                    ? "bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-300" 
                                    : notification.type === "LeaseSent"
                                      ? "bg-green-100 text-green-500 dark:bg-green-900 dark:text-green-300"
                                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                              }`}>
                                {notification.type === "ReservationRequest" ? (
                                  <FaBuilding className="text-xl" />
                                ) : notification.type === "RequestVisit" ? (
                                  <FaEye className="text-xl" />
                                ) : notification.type === "LeaseSent" ? (
                                  <FaCheck className="text-xl" />
                                ) : (
                                  <FaBell className="text-xl" />
                                )}
                              </div>
                              
                              <div className="flex-1">
                                {!notification.viewed && (
                                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                                )}
                                <p className={`text-sm mb-2 ${
                                  notification.viewed 
                                    ? "text-gray-700 dark:text-gray-300" 
                                    : "text-gray-900 dark:text-white font-medium"
                                }`}>
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                  <FaClock className="mr-1" />
                                  {formatNotificationTime(notification.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Button */}
            <div className="group w-full mx-auto" ref={profileRef}>
              <button
                className={`h-full w-full py-1 ${
                  dropdownOpen
                    ? "bg-blue-100 dark:bg-blue-800 text-blue-500"
                    : "text-gray-500 dark:text-gray-300"
                } hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-blue-600 flex justify-center items-center dropdown-toggle`}
                onClick={handleProfileToggle}
                data-dropdown-toggle="profile-dropdown-mobile"
              >
                <div className="h-full w-full flex items-center justify-center overflow-hidden">
                  {user ? (
                    <img
                      src={
                        user?.info?.profile.link ||
                        "https://via.placeholder.com/150"
                      }
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <FaUserCircle className="h-10 w-10 text-blue-500 text-lg" />
                  )}
                </div>
              </button>
              <h5 className="hidden group-hover:block absolute top-full left-1/2 transform -translate-x-1/2 text-nowrap mt-2 text-sm text-white bg-gray-500 dark:bg-gray-700 p-1 rounded-lg opacity-90 cursor-default">
                Your Profile
              </h5>
              {dropdownOpen && (
                <div 
                  ref={mobileProfileRef}
                  className="fixed mt-28 inset-0 bg-white dark:bg-gray-800 mx-1 z-50 flex flex-col transition-all duration-300 lg:hidden"
                >
                  <div className="sticky top-0 flex justify-between items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Your Profile</h2>
                    <button 
                      onClick={() => setDropdownOpen(false)}
                      className="rounded-full p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    {user ? (
                      // Logged-in profile content
                      <div className="py-4 flex flex-col h-full">
                        <div className="flex gap-4 items-center px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-lg mx-4 mb-6">
                          <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                            <img
                              src={user?.info?.profile.link || "https://via.placeholder.com/150"}
                              alt="Profile"
                              className="h-full w-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                              {user?.info?.firstName} {user?.info?.lastName}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user?.credentials?.email}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 px-4">
                          <button 
                            onClick={() => {
                              navigate("/view-profile");
                              setDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            <FaUserCircle />
                            <span>Your Profile</span>
                          </button>
                          
                          {user.tenantBadge === true && (
                            <button 
                              onClick={() => {
                                navigate("/tenant-dashboard");
                                setDropdownOpen(false);
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              <FaBuilding />
                              <span>Tenant Dashboard</span>
                            </button>
                          )}
                          
                          <button 
                            onClick={() => {
                              handleReservations();
                              setDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            <FaBuilding />
                            <span>Reservations</span>
                          </button>
                          
                          {user.userType === "Owner" && (
                            <button 
                              onClick={() => {
                                handleManageListings();
                                setDropdownOpen(false);
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              <FaBuilding />
                              <span>Manage Listings</span>
                            </button>
                          )}
                          
                          <div 
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-700"
                            onClick={toggleDarkMode}
                          >
                            <span className="text-gray-800 dark:text-gray-200">
                              {darkMode ? "Dark Mode" : "Light Mode"}
                            </span>
                            <div
                              className={`w-12 h-6 flex items-center ${
                                darkMode ? "bg-blue-600" : "bg-gray-300"
                              } rounded-full p-1 cursor-pointer transition-colors duration-300`}
                            >
                              <div
                                className={`w-4 h-4 bg-white rounded-full shadow-md transform ${
                                  darkMode ? "translate-x-6" : "translate-x-0"
                                } transition-transform duration-300`}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-auto px-4 py-6">
                          <button
                            onClick={handleLogoutClick}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-full bg-red-500 text-white hover:bg-red-600"
                          >
                            <FaPowerOff />
                            <span>Log out</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Logged-out profile content
                      <div className="py-4 flex flex-col h-full">
                        <div 
                          className="flex items-center justify-between p-4 rounded-lg bg-gray-100 dark:bg-gray-700 mx-4 mb-6"
                          onClick={toggleDarkMode}
                        >
                          <span className="text-gray-800 dark:text-gray-200">
                            {darkMode ? "Dark Mode" : "Light Mode"}
                          </span>
                          <div
                            className={`w-12 h-6 flex items-center ${
                              darkMode ? "bg-blue-600" : "bg-gray-300"
                            } rounded-full p-1 cursor-pointer transition-colors duration-300`}
                          >
                            <div
                              className={`w-4 h-4 bg-white rounded-full shadow-md transform ${
                                darkMode ? "translate-x-6" : "translate-x-0"
                              } transition-transform duration-300`}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="space-y-4 px-4 mt-auto">
                          <Link
                            to="/login"
                            onClick={() => setDropdownOpen(false)}
                            className="w-full flex items-center justify-center gap-2 p-4 rounded-full bg-blue-500 text-white hover:bg-blue-600"
                          >
                            <span>Log in</span>
                          </Link>
                          
                          <Link
                            to="/register"
                            onClick={() => setDropdownOpen(false)}
                            className="w-full flex items-center justify-center p-4 rounded-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <span>Register</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Clear Notifications Confirmation Modal */}
      {showClearConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-sm p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Clear all notifications?
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              This will remove all your notifications. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowClearConfirmation(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllNotifications}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Topbar;
