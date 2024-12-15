import React, { useState, useEffect } from "react";
import { fetchListings } from "../api/Listings"; // API function
import Topbar from "../components/global/Topbar";
import { AiOutlineHeart } from "react-icons/ai";
import { Footer } from "../components/global/Footer";

const BrowseListing = () => {
  const [listings, setListings] = useState([]); // Listings Data
  const [isMapFullScreen, setIsMapFullScreen] = useState(false); // Fullscreen Map for Phone

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchListings();
      setListings(data);
    };
    fetchData();
  }, []);

  const openMapFullScreen = () => {
    setIsMapFullScreen(true); // Show map fullscreen
  };

  const closeMapFullScreen = () => {
    setIsMapFullScreen(false); // Return to listings
  };

  return (
    <div className="pt-16 h-screen relative">
      <Topbar />

      {/* Main Content */}
      {!isMapFullScreen && (
        <div className="flex flex-col lg:flex-row h-full">
          {/* Listings Section */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 flex-grow`}
          >
            {listings.map((listing) => (
              <div
                key={listing._id}
                className="bg-white rounded-lg shadow-md overflow-hidden border h-[420px] flex flex-col justify-between hover:shadow-lg transition-all"
              >
                {/* Image Section */}
                <div className="relative h-2/3">
                  <img
                    src={listing.imageUrl || "https://via.placeholder.com/300"}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  <button className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md text-gray-600 hover:text-red-500">
                    <AiOutlineHeart size={20} />
                  </button>
                </div>

                {/* Details Section */}
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <h3 className="text-lg font-semibold truncate">{listing.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{listing.description}</p>
                  <p className="text-gray-700 font-bold mt-2">{listing.price} / night</p>
                </div>
              </div>
            ))}
          </div>

          {/* Map Section for Desktop */}
          <div className="hidden lg:block lg:w-1/3 h-full bg-gray-200 relative transition-all duration-300">
            <iframe
              className="w-full h-full border-none rounded-md"
              src="https://maps.google.com/maps?q=Bacoor&t=&z=13&ie=UTF8&iwloc=&output=embed"
              allowFullScreen
              title="Map"
            ></iframe>
          </div>
        </div>
      )}

      {/* Show Map Button for Phone */}
      {!isMapFullScreen && (
        <div className="lg:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-sm">
          <button
            onClick={openMapFullScreen}
            className="w-full bg-blue-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-600 transition"
          >
            See Map
          </button>
        </div>
      )}

      {/* Full Screen Map for Phone */}
      {isMapFullScreen && (
        <div className="fixed inset-0 z-40 bg-gray-200">
          {/* Map */}
          <iframe
            className="absolute inset-0 w-full h-full border-none"
            src="https://maps.google.com/maps?q=Bacoor&t=&z=13&ie=UTF8&iwloc=&output=embed"
            allowFullScreen
            title="Full Screen Map"
          ></iframe>

          {/* See Listings Button */}
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm">
            <button
              onClick={closeMapFullScreen}
              className="w-full bg-blue-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-600 transition"
            >
              See Listings
            </button>
          </div>
        </div>
      )}

      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};

export default BrowseListing;
