import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import React Router hook

import Topbar from "../components/global/Topbar.js";
import ReservePopout from "../components/Listing/ReservePopout.js";

import { fetchListings } from "../global/api/Listings.js";
import { AuthContext } from "../global/contexts/AuthContext.js";
import { useProperty } from "../global/contexts/PropertyContext";

const ReserveListing = () => {
  const [listings, setListings] = useState([]); // List of reserved properties
  const [showPopout, setShowPopout] = useState(false); // Toggle Popout visibility
  const [activeProperty, setActiveProperty] = useState(null); // Track the active property
  const { setSelectedProperty } = useProperty();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Fetch reserved listings on component mount or when the user changes
  useEffect(() => {
    const fetchReservedListings = async () => {
      try {
        const reservedListings = await fetchListings({ reserved: true });
        setListings(reservedListings);
      } catch (error) {
        console.error("Error fetching reserved listings:", error);
      }
    };

    if (user) {
      fetchReservedListings();
    }
  }, [user]);

  // Navigate to the property details page
  const handleViewProperty = (listing) => {
    setSelectedProperty(listing);
    navigate(`/${listing._id}`);
  };

  return (
    <div>
      <Topbar />
      {user ? (
        <div className="mx-auto flex align-center flex-col rounded-xl mt-32 lg:mt-20 w-[90%]">
          {/* Header Section */}
          <div className="flex flex-row w-full items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Reserved Properties</h2>
          </div>

          {/* Listings Section */}
          <div className="flex flex-col flex-grow overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
              {listings.length ? (
                listings.map((listing) => {
                  // Fallback to dummy data if a listing is undefined
                  const displayProperty = listing || {
                    title: "Modern Beachside Villa",
                    images: [{ link: "/placeholder-image.jpg" }],
                    price: "$250",
                  };

                  return (
                    <div
                      key={displayProperty._id || Math.random()} // Use unique keys
                      className="flex-shrink-0 bg-white rounded-lg shadow-md border overflow-hidden"
                    >
                      {/* Image Section */}
                      <div className="relative flex-shrink-0 h-48 md:h-56">
                        <img
                          src={
                            displayProperty.images?.[0]?.link ||
                            "/placeholder-image.jpg"
                          }
                          alt={displayProperty.title}
                          onClick={() => handleViewProperty(displayProperty)}
                          className="w-full h-full object-cover cursor-pointer"
                        />
                        {/* Reserved Button */}
                        <div
                          className="cursor-pointer absolute top-2 right-2 bg-blue-500 rounded-full px-4 py-2 shadow-md text-gray-100"
                          onClick={() => {
                            setActiveProperty(displayProperty);
                            setShowPopout(true); // Toggle Popout on Click
                          }}
                        >
                          <h5 className="text-sm">Reserved</h5>
                        </div>
                      </div>

                      {/* Details Section */}
                      <div
                        className="p-4 flex-grow flex flex-col justify-between cursor-pointer"
                        onClick={() => handleViewProperty(displayProperty)}
                      >
                        <h3 className="text-lg font-semibold truncate">
                          {displayProperty.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2">
                          {displayProperty.description || "No description available"}
                        </p>
                        <p className="text-gray-700 font-bold mt-2">
                          {displayProperty.price} / night
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500">No reserved properties found.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center mt-20">
          <p className="text-gray-600">Please log in to view your reserved properties.</p>
          <Link to="/login" className="text-blue-500 hover:underline">
            Go to Login
          </Link>
        </div>
      )}

      {/* Popout Component */}
      {showPopout && activeProperty && (
        <ReservePopout
          property={activeProperty} // Pass the active property
          onClose={() => setShowPopout(false)} // Close Popout
        />
      )}
    </div>
  );
};

export default ReserveListing;
