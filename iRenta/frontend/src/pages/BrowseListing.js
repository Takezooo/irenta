import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaChevronLeft } from "react-icons/fa";
import { Footer } from "../components/global/Footer";
import Topbar from "../components/global/Topbar";
import { toggleLike } from "../api/Users";
import { fetchListings } from "../api/Listings"; // API function
import { fetchUserData } from "../api/Users";
import { GetToken } from "../global/utils/Token";
import { AuthContext } from "../global/contexts/AuthContext"; //
import { useProperty } from "../global/contexts/PropertyContext";

const BrowseListing = () => {
  const [listings, setListings] = useState([]); // Listings Data
  const [likedListings, setLikedListings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [isMapFullScreen, setIsMapFullScreen] = useState(false); // Fullscreen Map for Phone
  const { setSelectedProperty } = useProperty();
  const { user } = useContext(AuthContext);
  const authToken = GetToken();
  const navigate = useNavigate(); // React Router navigation hook

  const listingsPerPage = 12;

  useEffect(() => {
    const fetchCurrentUserData = async () => {
      if (user) {
        const userdata = await fetchUserData(user?.id, authToken);
        setLikedListings(userdata?.likedListings);
      } else {
        setLikedListings([]);
      }
    };
    const fetchData = async () => {
      const data = await fetchListings();
      setListings(data);
    };
    fetchData();
    fetchCurrentUserData();
  }, [authToken, user]);

  const handleLikeToggle = async (listingId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const updatedLikes = await toggleLike(listingId);
      setLikedListings(updatedLikes); // Update local state
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const openMapFullScreen = () => {
    setIsMapFullScreen(true); // Show map fullscreen
  };

  const closeMapFullScreen = () => {
    setIsMapFullScreen(false); // Return to listings
  };

  // Calculate paginated listings
  const indexOfLastListing = currentPage * listingsPerPage;
  const indexOfFirstListing = indexOfLastListing - listingsPerPage;
  const currentListings = listings.slice(
    indexOfFirstListing,
    indexOfLastListing
  );

  const totalPages = Math.ceil(listings.length / listingsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleViewProperty = (listings) => {
    setSelectedProperty(listings);
    navigate(`/${listings._id}`);
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
            className="w-fit flex bg-gray-500 rounded-full items-center py-2 px-4 mb-4 text-gray-100 hover:bg-gray-700"
            >
                <FaChevronLeft className="text-lg" />
            </button>
            <div className="flex flex-wrap gap-4 ">
              {currentListings.map((listing) => (
                <div
                  key={listing._id}
                  className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden border h-96 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1rem)] hover:shadow-lg transition-all"
                >
                  {/* Image Section */}
                  <div className="relative flex-shrink-0 h-2/3">
                    <img
                      src={listing.images?.[0]?.link || "/placeholder-image.jpg"}
                      alt={listing.title}
                      onClick={() => handleViewProperty(listing)}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleLikeToggle(listing._id)}
                      className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md text-gray-600 hover:text-red-500"
                    >
                      {likedListings?.includes(listing._id) ? (
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
                      {listing.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2">
                      {listing.description}
                    </p>
                    <p className="text-gray-700 font-bold mt-2">
                      {listing.price} / night
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-4 py-2 mx-1 border rounded ${
                    currentPage === index + 1
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
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

export default BrowseListing;
