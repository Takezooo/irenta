import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaChevronLeft } from "react-icons/fa";
import { Footer } from "../components/global/Footer";
import Topbar from "../components/global/Topbar";
import { ThemeContext } from "../contexts/ThemeContext"; // Import ThemeContext
import { GetToken } from "../global/utils/Token";
import { AuthContext } from "../global/contexts/AuthContext";
import { useProperty } from "../global/contexts/PropertyContext";
import { fetchUserData, toggleLike } from "../global/api/Users";
import { fetchSpecificList } from "../global/api/Listings";

const LikedListing = () => {
  const { user } = useContext(AuthContext); // Access user from AuthContext
  const { darkMode } = useContext(ThemeContext); // Access darkMode from ThemeContext
  const [likedListings, setLikedListings] = useState([]);
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

        const likedDetails = await Promise.all(
          likedIds.map((id) => fetchSpecificList(id).catch(() => null))
        );

        const validListings = likedDetails.filter(
          (listing) => listing && listing._id
        );
        setLikedListings(validListings);
      } catch (error) {
        console.error("Error fetching liked listings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedListings();
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
      );
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
    navigate(-1);
  };

  return (
    <div
      className={`flex flex-col min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <Topbar />

      {!isMapFullScreen && (
        <div className="flex-grow flex pt-[70px] h-screen">
          <div className="flex flex-col flex-grow overflow-y-auto scrollbar-hide p-4">
            <button
              onClick={handleBackClick}
              className={`flex items-center gap-2 p-2 ${
                darkMode
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <FaChevronLeft className="text-lg" />
            </button>
            <h1 className="text-2xl font-bold mb-2 p-4">Your Liked Listings</h1>
            {isLoading ? (
              <p
                className={`text-center ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Loading...
              </p>
            ) : likedListings.length > 0 ? (
              <div className="flex flex-wrap gap-4 justify-center">
                {likedListings.map((listing) => (
                  <div
                    key={listing?._id}
                    className={`flex flex-col rounded-lg shadow-md overflow-hidden border h-96 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1rem)] hover:shadow-lg transition-all ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <div className="relative flex-shrink-0 h-2/3">
                      <img
                        src={listing.images?.[0]?.link || "/placeholder-image.jpg"}
                        alt={listing?.title}
                        className="w-full h-full object-cover"
                        onClick={() => handleViewProperty(listing)}
                      />
                      <button
                        onClick={() => handleLikeToggle(listing?._id)}
                        className={`absolute top-2 right-2 rounded-full p-2 shadow-md ${
                          darkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-white text-gray-600"
                        } hover:text-red-500`}
                      >
                        {likedIds.includes(listing?._id) ? (
                          <AiFillHeart size={20} className="text-red-500" />
                        ) : (
                          <AiOutlineHeart size={20} />
                        )}
                      </button>
                    </div>

                    <div
                      className={`p-4 flex-grow flex flex-col justify-between ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                      onClick={() => handleViewProperty(listing)}
                    >
                      <h3 className="text-lg font-semibold truncate">
                        {listing?.title}
                      </h3>
                      <p
                        className={`text-sm line-clamp-2 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {listing?.description}
                      </p>
                      <p
                        className={`font-bold mt-2 ${
                          darkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        ₱{listing?.price || "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p
                className={`text-center ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No liked listings found.
              </p>
            )}
          </div>

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

      <Footer />
    </div>
  );
};

export default LikedListing;
