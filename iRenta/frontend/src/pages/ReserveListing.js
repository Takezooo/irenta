import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import Topbar from "../components/global/Topbar.js";
import ReservePopout from "../components/Listing/ReservePopout.js";

import { fetchReservedListings } from "../global/api/Listings.js";
import { AuthContext } from "../global/contexts/AuthContext.js";
import { ThemeContext } from "../contexts/ThemeContext.js"; // Import ThemeContext
import { useProperty } from "../global/contexts/PropertyContext";

const ReserveListing = () => {
  const [reservations, setReservations] = useState([]); // List of reserved properties
  const [showPopout, setShowPopout] = useState(false); // Toggle Popout visibility
  const [activeProperty, setActiveProperty] = useState(null); // Track the active property
  const [requestDetails, setRequestDetails] = useState(null); // Add state for request details
  const { setSelectedProperty } = useProperty();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Access user from AuthContext
  const { darkMode } = useContext(ThemeContext); // Access darkMode from ThemeContext
  const isOwner = user?.userType === "Owner"; // Determine if the user is an Owner

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reservedListings = await fetchReservedListings();
        setReservations(reservedListings);
      } catch (error) {
        console.error("Error fetching reserved listings:", error);
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

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-200 text-black"
      }`}
    >
      <Topbar />
      {user ? (
        <div className="mx-auto flex flex-col rounded-xl mt-32 lg:mt-16 w-[90%]">
          <div className="flex flex-row items-center justify-between mb-4 pt-8">
            <h2 className="text-xl font-bold">
              {user.userType === "Seeker"
                ? "Your Reserved Listings"
                : "Reservations Made on Your Listings"}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {reservations.length ? (
              reservations.map((reservation) => {
                const listing = reservation.listingId || {};
                const seeker = reservation.seekerId || {};

                return (
                  <div
                    key={reservation._id}
                    className={`flex-shrink-0 rounded-lg shadow-md border overflow-hidden ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {/* Image Section */}
                    <div className="relative flex-shrink-0 h-48 md:h-56">
                      <img
                        src={
                          listing.images?.[0]?.link || "/placeholder-image.jpg"
                        }
                        alt={listing.title || "No Title"}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => handleViewProperty(listing, reservation.ownerId)}
                      />
                      <div
                        className={`cursor-pointer absolute top-2 right-2 rounded-full px-4 py-2 shadow-md ${
                          darkMode
                            ? "bg-blue-700 text-gray-200"
                            : "bg-blue-500 text-gray-100"
                        }`}
                        onClick={() =>
                          handlePopoutOpen(listing, seeker, reservation)
                        }
                      >
                        <h5 className="text-sm">{reservation.status}</h5>
                      </div>
                    </div>

                    {/* Details Section */}
                    <div
                      className={`p-4 flex-grow flex flex-col justify-between cursor-pointer ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                      onClick={() => handleViewProperty(listing)}
                    >
                      <h3 className="text-lg font-semibold truncate">
                        {listing.title || "No Title"}
                      </h3>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {user.userType === "Owner"
                          ? `Reserved by: ${
                              seeker.info.firstName || "Unknown"
                            } ${seeker.info.lastName || ""}`
                          : listing.description || "No description available"}
                      </p>
                      {user.userType === "Seeker" && (
                        <p
                          className={`font-bold mt-2 ${
                            darkMode ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          {listing.price
                            ? `$${listing.price} / night`
                            : "No Price"}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p
                className={`text-center ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No reserved properties found.
              </p>
            )}
          </div>
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
          onClose={() => setShowPopout(false)}
          isOwner={isOwner}
          requestDetails={requestDetails}
        />
      )}
    </div>
  );
};

export default ReserveListing;
