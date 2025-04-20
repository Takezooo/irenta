import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  AiFillCheckCircle, 
  AiFillCloseCircle, 
  AiOutlineClockCircle,
  AiOutlineAppstore,
  AiOutlineUnorderedList,
  AiOutlineCalendar,
  AiOutlineUser,
  AiOutlineHome,
  AiOutlineDollar
} from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";

import Topbar from "../components/global/Topbar.js";
import ReservePopout from "../components/Listing/ReservePopout.js";

import { fetchReservedListings } from "../global/api/Listings.js";
import { AuthContext } from "../global/contexts/AuthContext.js";
import { ThemeContext } from "../contexts/ThemeContext.js";
import { useProperty } from "../global/contexts/PropertyContext";

const ReserveListing = () => {
  const [reservations, setReservations] = useState([]);
  const [showPopout, setShowPopout] = useState(false);
  const [activeProperty, setActiveProperty] = useState(null);
  const [requestDetails, setRequestDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewType, setViewType] = useState("grid"); // "grid" or "list"
  const { setSelectedProperty } = useProperty();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const isOwner = user?.userType === "Owner";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const reservedListings = await fetchReservedListings();
        setReservations(reservedListings);
      } catch (error) {
        console.error("Error fetching reserved listings:", error);
        toast.error("Failed to load reservations. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Navigate to the property details page
  const handleViewProperty = (listing, ownerId) => {
    const modifiedListing = {
      ...listing,
      userId: ownerId, // Assign ownerId as userId
    };
  
    setSelectedProperty(modifiedListing); // Set the modified listing
    navigate(`/${listing._id}`);
  };

  const handlePopoutOpen = (listing, seeker, reservation) => {
    setActiveProperty(listing);
    setRequestDetails({
      id: reservation._id,
      seekerId: reservation.seekerId || "Unknown",
      requesterName: `${seeker?.info?.firstName || "Unknown"} ${
        seeker?.info?.lastName || ""
      }`,
      dateTime: reservation?.createdAt || "Date not available",
      status: reservation?.status || "Unknown status",
      uploadedValidId: reservation.uploadedValidId || "No Uploaded Valid Id",
    });
    setShowPopout(true);
  };

  // Get status icon and color
  const getStatusDisplay = (status) => {
    switch(status) {
      case "Approved":
        return { 
          icon: <AiFillCheckCircle size={18} />,
          text: "Approved",
          bgColor: darkMode ? "bg-green-800" : "bg-green-100",
          textColor: darkMode ? "text-green-200" : "text-green-800" 
        };
      case "Declined":
        return { 
          icon: <AiFillCloseCircle size={18} />,
          text: "Declined",
          bgColor: darkMode ? "bg-red-800" : "bg-red-100",
          textColor: darkMode ? "text-red-200" : "text-red-800"
        };
      default:
        return { 
          icon: <AiOutlineClockCircle size={18} />,
          text: "Pending",
          bgColor: darkMode ? "bg-yellow-800" : "bg-yellow-100",
          textColor: darkMode ? "text-yellow-200" : "text-yellow-800"
        };
    }
  };

  // Handle closing the popout after a status update
  const handleClosePopout = () => {
    setShowPopout(false);
    // Fetch updated data
    const fetchUpdatedData = async () => {
      try {
        const reservedListings = await fetchReservedListings();
        setReservations(reservedListings);
      } catch (error) {
        console.error("Error fetching updated reservations:", error);
      }
    };
    fetchUpdatedData();
  };

  // Toggle between grid and list view
  const toggleViewType = () => {
    setViewType(viewType === "grid" ? "list" : "grid");
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Render Grid View
  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {reservations.map((reservation) => {
          const listing = reservation.listingId || {};
          const seeker = reservation.seekerId || {};
          const statusDisplay = getStatusDisplay(reservation.status);

          return (
            <div
              key={reservation._id}
              className={`h-96 rounded-xl shadow-md border overflow-hidden transition-transform hover:scale-[1.02] ${
                darkMode
                  ? "bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-gray-700"
                  : "bg-white border-gray-200 hover:shadow-lg"
              }`}
            >
              {/* Image Section */}
              <div className="relative h-3/5 overflow-hidden">
                <img
                  src={
                    listing.images?.[0]?.link || "/placeholder-image.jpg"
                  }
                  alt={listing.title || "No Title"}
                  className="w-full h-full object-cover transition-transform hover:scale-105 cursor-pointer"
                  onClick={() => handleViewProperty(listing, reservation.ownerId)}
                />
                <button
                  onClick={() => handlePopoutOpen(listing, seeker, reservation)}
                  className={`absolute top-3 right-3 rounded-full py-1 px-3 shadow-md transition-colors flex items-center gap-1 ${statusDisplay.bgColor} ${statusDisplay.textColor}`}
                >
                  {statusDisplay.icon}
                  <span className="text-sm font-medium">{statusDisplay.text}</span>
                </button>
                {/* Price tag */}
                <div className={`absolute bottom-3 left-3 rounded-md py-1 px-2 text-sm font-semibold ${
                  darkMode
                    ? "bg-gray-900/80 text-gray-200"
                    : "bg-white/80 text-gray-800"
                }`}>
                  ${listing.price || 0}<span className="text-xs font-normal"> / night</span>
                </div>
              </div>

              {/* Details Section */}
              <div 
                className={`p-4 h-2/5 flex flex-col ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                onClick={() => handlePopoutOpen(listing, seeker, reservation)}
              >
                <h3 className="text-lg font-semibold truncate cursor-pointer">
                  {listing.title || "No Title"}
                </h3>
                <p className={`text-sm line-clamp-2 mt-1 flex-grow ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                  {user.userType === "Owner"
                    ? `Reserved by: ${seeker.info?.firstName || "Unknown"} ${seeker.info?.lastName || ""}`
                    : listing.description || "No description available"}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-1 rounded-md ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}>
                    {formatDate(reservation.createdAt)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePopoutOpen(listing, seeker, reservation);
                    }}
                    className={`text-xs px-3 py-1 rounded-md ${
                      darkMode
                        ? "bg-blue-600 hover:bg-blue-500 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render List View
  const renderListView = () => {
    return (
      <div className="flex flex-col gap-4">
        {reservations.map((reservation) => {
          const listing = reservation.listingId || {};
          const seeker = reservation.seekerId || {};
          const statusDisplay = getStatusDisplay(reservation.status);

          return (
            <div
              key={reservation._id}
              className={`rounded-xl shadow-md border overflow-hidden transition-all hover:shadow-lg ${
                darkMode
                  ? "bg-gray-800 border-gray-700 hover:shadow-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0">
                  <img
                    src={listing.images?.[0]?.link || "/placeholder-image.jpg"}
                    alt={listing.title || "No Title"}
                    className="w-full h-full object-cover"
                    onClick={() => handleViewProperty(listing, reservation.ownerId)}
                  />
                  <div className={`absolute top-3 left-3 rounded-md py-1 px-2 text-sm font-semibold ${
                    darkMode
                      ? "bg-gray-900/80 text-gray-200"
                      : "bg-white/80 text-gray-800"
                  }`}>
                    ${listing.price || 0}<span className="text-xs font-normal"> / night</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-4 flex flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h3 className="text-xl font-semibold">
                      {listing.title || "No Title"}
                    </h3>
                    <div className={`rounded-full py-1 px-3 flex items-center gap-1 ${statusDisplay.bgColor} ${statusDisplay.textColor}`}>
                      {statusDisplay.icon}
                      <span className="text-sm font-medium">{statusDisplay.text}</span>
                    </div>
                  </div>

                  {/* Details with icons */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                        <AiOutlineCalendar className={darkMode ? "text-blue-400" : "text-blue-600"} />
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Reserved On
                        </p>
                        <p className="text-sm font-medium">
                          {formatDate(reservation.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {user.userType === "Owner" ? (
                        <>
                          <div className={`p-1.5 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                            <AiOutlineUser className={darkMode ? "text-blue-400" : "text-blue-600"} />
                          </div>
                          <div>
                            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                              Reserved By
                            </p>
                            <p className="text-sm font-medium">
                              {seeker.info?.firstName || "Unknown"} {seeker.info?.lastName || ""}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={`p-1.5 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                            <AiOutlineHome className={darkMode ? "text-blue-400" : "text-blue-600"} />
                          </div>
                          <div>
                            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                              Property Type
                            </p>
                            <p className="text-sm font-medium">
                              {listing.propertyType || "Apartment"}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                        <AiOutlineDollar className={darkMode ? "text-blue-400" : "text-blue-600"} />
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Price
                        </p>
                        <p className="text-sm font-medium">
                          ${listing.price || 0} <span className="text-xs font-normal">/ night</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description and action button */}
                  <div className="mt-3 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <p className={`text-sm line-clamp-2 flex-grow ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}>
                      {listing.description || "No description available"}
                    </p>
                    <button
                      onClick={() => handlePopoutOpen(listing, seeker, reservation)}
                      className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium ${
                        darkMode
                          ? "bg-blue-600 hover:bg-blue-500 text-white"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render the empty state
  const renderEmptyState = () => {
    return (
      <div className="col-span-full text-center py-12">
        <div className={`inline-flex flex-col items-center p-6 rounded-lg ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <p className={`text-xl mb-4 ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            No reserved properties found
          </p>
          <Link
            to={user.userType === "Seeker" ? "/" : "/owner-dashboard"}
            className={`px-4 py-2 rounded-md ${
              darkMode
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {user.userType === "Seeker" ? "Browse Properties" : "Back to Dashboard"}
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-200 text-black"
      }`}
    >
      <Topbar />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
      />
      
      {user ? (
        <div className="mx-auto flex flex-col rounded-xl mt-32 lg:mt-16 w-[90%] max-w-[1800px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-8">
            <h2 className="text-2xl font-bold">
              {user.userType === "Seeker"
                ? "Your Reserved Listings"
                : "Reservations Made on Your Listings"}
            </h2>
            
            {/* View Toggle */}
            <div className={`flex items-center rounded-lg p-1 ${
              darkMode ? "bg-gray-700" : "bg-gray-100"
            }`}>
              <button
                onClick={() => setViewType("grid")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewType === "grid"
                    ? darkMode 
                      ? "bg-gray-600 text-white" 
                      : "bg-white text-gray-800 shadow-sm"
                    : darkMode
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <AiOutlineAppstore size={16} />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewType("list")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewType === "list"
                    ? darkMode 
                      ? "bg-gray-600 text-white" 
                      : "bg-white text-gray-800 shadow-sm"
                    : darkMode
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <AiOutlineUnorderedList size={16} />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center my-12">
              <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
                darkMode ? "border-blue-400" : "border-blue-600"
              }`}></div>
            </div>
          ) : (
            reservations.length ? (
              viewType === "grid" ? renderGridView() : renderListView()
            ) : (
              renderEmptyState()
            )
          )}
        </div>
      ) : (
        <div className="text-center mt-20">
          <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Please log in to view your reserved properties.
          </p>
          <Link
            to="/login"
            className={`${
              darkMode
                ? "text-blue-400 hover:underline"
                : "text-blue-500 hover:underline"
            }`}
          >
            Go to Login
          </Link>
        </div>
      )}
      
      {showPopout && activeProperty && (
        <ReservePopout
          property={activeProperty}
          onClose={handleClosePopout}
          isOwner={isOwner}
          requestDetails={requestDetails}
        />
      )}
    </div>
  );
};

export default ReserveListing;
