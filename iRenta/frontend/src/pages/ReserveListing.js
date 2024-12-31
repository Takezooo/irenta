import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import React Router hook

import Topbar from "../components/global/Topbar.js";

import { fetchListings } from "../global/api/Listings.js";
import { AuthContext } from "../global/contexts/AuthContext.js";
import { useProperty } from "../global/contexts/PropertyContext";

const ReserveListing = () => {
  const [listings, setListings] = useState([]);
  const { setSelectedProperty } = useProperty();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchReservedListings = async () => {
      try {
        const reservedListings = await fetchListings({ reserved: true }); // Fetch reserved properties
        setListings(reservedListings);
      } catch (error) {
        console.error("Error fetching reserved listings:", error);
      }
    };

    if (user) {
      fetchReservedListings();
    }
  }, [user]);

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
                listings.map((listing) => (
                  <div
                    key={listing._id}
                    className="flex-shrink-0 bg-white rounded-lg shadow-md border overflow-hidden"
                  >
                    {/* Image Section */}
                    <div className="relative flex-shrink-0 h-48 md:h-56">
                      <img
                        src={listing.images?.[0]?.link || "/placeholder-image.jpg"}
                        alt={listing.title}
                        onClick={() => handleViewProperty(listing)}
                        className="w-full h-full object-cover cursor-pointer"
                      />
                      <div className="cursor-default absolute top-2 right-2 bg-blue-500 rounded-full px-4 py-2 shadow-md text-gray-100"
                      >
                        <h5 className="text-sm">Reserved</h5>
                      </div>
                    </div>

                    {/* Details Section */}
                    <div
                      className="p-4 flex-grow flex flex-col justify-between cursor-pointer"
                      onClick={() => handleViewProperty(listing)}
                    >
                      <h3 className="text-lg font-semibold truncate">{listing.title}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2">
                        {listing.description}
                      </p>
                      <p className="text-gray-700 font-bold mt-2">{listing.price} / night</p>
                    </div>
                  </div>
                ))
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
    </div>
  );
};

export default ReserveListing;