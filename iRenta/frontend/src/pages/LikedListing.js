import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaChevronLeft } from "react-icons/fa"; // Import back arrow icon
import { Footer } from "../components/global/Footer";
import Topbar from "../components/global/Topbar";

import { GetToken } from "../global/utils/Token";
import { AuthContext } from "../global/contexts/AuthContext";
import { useProperty } from "../global/contexts/PropertyContext";
import { fetchUserData, toggleLike } from "../global/api/Users";
import { fetchSpecificList } from "../global/api/Listings";

const LikedListing = () => {
  const { user } = useContext(AuthContext); // Access logged-in user
  const [likedListings, setLikedListings] = useState([]); // State to store liked listings
  const [isLoading, setIsLoading] = useState(true);
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const likedIds = likedListings.map((liked) => liked._id);
  const { setSelectedProperty } = useProperty();
  const navigate = useNavigate();
  const authToken = GetToken();

  useEffect(() => {
    const fetchLikedListings = async () => {
      if (!user || !authToken) return;
      try {
        const userData = await fetchUserData(user.id, authToken);
        const likedIds = userData?.likedListings || [];

        // Use Promise.all to fetch all liked listings
        const likedDetails = await Promise.all(
          likedIds.map((id) => fetchSpecificList(id))
        );

        // Filter out null or undefined listings
        const validListings = likedDetails.filter(
          (listing) => listing !== null
        );
        setLikedListings(validListings);
        console.log(likedListings);
      } catch (error) {
        console.error("Error fetching liked listings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedListings();
    console.log(likedListings);
  }, [user, authToken]);

  const handleLikeToggle = async (listingId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const updatedLikes = await toggleLike(listingId);
      const filteredListings = likedListings.filter(
        (listing) => listing?._id !== listingId
      ); // Remove unliked listing
      setLikedListings(filteredListings);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleViewProperty = (listings) => {
    setSelectedProperty(listings);
    navigate(`/${listings?._id}`);
  };

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
            {isLoading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : likedListings.length > 0 ? (
              <div className="flex flex-wrap gap-4 justify-center">
                {likedListings.map((listing) => (
                  <div
                    key={listing?._id}
                    className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden border h-96 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1rem)] hover:shadow-lg transition-all"
                  >
                    {/* Image Section */}
                    <div className="relative flex-shrink-0 h-2/3">
                      <img
                        src={
                          listing.images?.[0]?.link || "/placeholder-image.jpg"
                        } // Default image if not available
                        alt={listing?.title}
                        className="w-full h-full object-cover"
                        onClick={() => handleViewProperty(listing)}
                      />
                      <button
                        onClick={() => handleLikeToggle(listing?._id)}
                        className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md text-gray-600 hover:text-red-500"
                      >
                        {likedIds.includes(listing?._id) ? (
                          <AiFillHeart size={20} className="text-red-500" />
                        ) : (
                          <AiOutlineHeart size={20} />
                        )}
                      </button>
                    </div>

                    {/* Details Section */}
                    <div
                      className="p-4 flex-grow flex flex-col justify-between"
                      onClick={() => handleViewProperty(listing)}
                    >
                      <h3 className="text-lg font-semibold truncate">
                        {listing?.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2">
                        {listing?.description}
                      </p>
                      <p className="text-gray-700 font-bold mt-2">
                        ₱{listing?.price || "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No liked listings found.
              </p>
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
