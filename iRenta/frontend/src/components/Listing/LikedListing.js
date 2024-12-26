import React, { useState } from "react";
import { AiFillHeart } from "react-icons/ai";
import { FaChevronLeft  } from "react-icons/fa"; // Import back arrow icon
import { useNavigate } from "react-router-dom";
import { Footer } from "../global/Footer";
import Topbar from "../global/Topbar";

const LikedListing = () => {
  const [likedListings] = useState([
    {
      _id: "1",
      title: "Modern Apartment in City Center",
      description: "A cozy apartment with stunning city views.",
      price: "$150 / night",
      imageUrl: "https://via.placeholder.com/300",
    },
    {
      _id: "2",
      title: "Luxury Villa with Private Pool",
      description: "Enjoy your stay in a luxurious villa with a private pool.",
      price: "$500 / night",
      imageUrl: "https://via.placeholder.com/300",
    },
    {
      _id: "3",
      title: "Charming Cottage in the Countryside",
      description: "Escape to a peaceful countryside retreat in this cottage.",
      price: "$200 / night",
      imageUrl: "https://via.placeholder.com/300",
    },
  ]);

  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const navigate = useNavigate();

  const openMapFullScreen = () => {
    setIsMapFullScreen(true);
  };

  const closeMapFullScreen = () => {
    setIsMapFullScreen(false);
  };

  const handleBackClick = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />

      {/* Back Button */}
      <div className="">
        
      </div>

      {/* Main Content */}
      {!isMapFullScreen && (
        <div className="flex-grow flex pt-[70px] h-screen">
          {/* Listings Section */}
          <div className="flex flex-col flex-grow overflow-y-auto scrollbar-hide p-4">
            <button
            onClick={handleBackClick}
            className="flex items-center gap-2 p-2 text-gray-500 hover:text-gray-900"
            >
                <FaChevronLeft className="text-lg" />
            </button>
            <h1 className="text-2xl font-bold mb-2 p-4">Your Liked Listings</h1>
            {likedListings.length > 0 ? (
              <div className="flex flex-wrap gap-4 justify-center">
                {likedListings.map((listing) => (
                  <div
                    key={listing._id}
                    className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden border h-96 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1rem)] hover:shadow-lg transition-all"
                  >
                    {/* Image Section */}
                    <div className="relative flex-shrink-0 h-2/3">
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                      <button className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md text-red-500">
                        <AiFillHeart size={20} />
                      </button>
                    </div>

                    {/* Details Section */}
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <h3 className="text-lg font-semibold truncate">
                        {listing.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2">
                        {listing.description}
                      </p>
                      <p className="text-gray-700 font-bold mt-2">{listing.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No liked listings found.</p>
            )}
          </div>

          {/* Map Section */}
          <div className="hidden lg:flex lg:flex-shrink-0 lg:w-1/3 h-screen">
            <iframe
              className="w-full h-full border-none"
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

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LikedListing;
