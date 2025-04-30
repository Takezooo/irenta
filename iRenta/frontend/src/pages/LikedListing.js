import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillHeart } from "react-icons/ai";
import { FaChevronLeft } from "react-icons/fa";
import { Footer } from "../components/global/Footer";
import Topbar from "../components/global/Topbar";
import { ThemeContext } from "../contexts/ThemeContext";
import { GetToken } from "../global/utils/Token";
import { AuthContext } from "../global/contexts/AuthContext";
import { useProperty } from "../global/contexts/PropertyContext";
import { fetchUserData, toggleLike } from "../global/api/Users";
import { fetchSpecificList } from "../global/api/Listings";

const LikedListing = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [likedListingsData, setLikedListingsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setSelectedProperty } = useProperty();
  const navigate = useNavigate();
  const authToken = GetToken();

  // Fetch liked listings data
  useEffect(() => {
    const fetchLikedListings = async () => {
      if (!user || !authToken) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        // Get user data with liked listings IDs
        const userData = await fetchUserData(user.id, authToken);
        const likedIds = userData?.likedListings || [];
        
        if (likedIds.length === 0) {
          setLikedListingsData([]);
          setIsLoading(false);
          return;
        }

        // Fetch full details for each liked listing
        const likedDetailsPromises = likedIds.map(id => 
          fetchSpecificList(id).catch(() => null)
        );
        
        const likedDetails = await Promise.all(likedDetailsPromises);
        
        // Filter out any failed fetches and set the data
        const validListings = likedDetails.filter(listing => listing && listing._id);
        setLikedListingsData(validListings);
      } catch (error) {
        console.error("Error fetching liked listings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedListings();
  }, [user, authToken]);

  // Handle unliking a property
  const handleUnlike = async (e, listingId) => {
    e.stopPropagation(); // Prevent card click
    
    if (!user) {
      navigate("/login");
      return;
    }
    
    try {
      await toggleLike(listingId);
      
      // Remove the unliked listing from the current view
      setLikedListingsData(prev => 
        prev.filter(listing => listing._id !== listingId)
      );
    } catch (error) {
      console.error("Error unliking property:", error);
    }
  };

  const handleViewProperty = (listing) => {
    setSelectedProperty(listing);
    navigate(`/${listing._id}`);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className={`flex flex-col min-h-screen ${
      darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
    }`}>
      <Topbar />

      <div className="flex-grow flex pt-[70px] h-screen">
        <div className="flex flex-col flex-grow overflow-y-auto scrollbar-hide p-4 w-[calc(100%-200px)] max-w-[1800px] mx-auto">
          {/* Back button */}
          <button
            onClick={handleBackClick}
            className={`flex items-center gap-2 p-2 mb-2 ${
              darkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <FaChevronLeft className="text-lg" />
            <span>Back</span>
          </button>
          
          <h1 className="text-2xl font-bold mb-6">Your Liked Properties</h1>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className={`animate-pulse text-center ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
                Loading your liked properties...
              </div>
            </div>
          ) : likedListingsData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {likedListingsData.map((listing) => (
                <div
                  key={listing._id}
                  onClick={() => handleViewProperty(listing)}
                  className={`h-96 rounded-xl shadow-md border overflow-hidden transition-transform hover:scale-[1.02] cursor-pointer ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-gray-700"
                      : "bg-white border-gray-200 hover:shadow-lg"
                  }`}
                >
                  {/* Image Section */}
                  <div className="relative h-3/5 overflow-hidden">
                    <img
                      src={listing.images?.[0]?.link || "/placeholder-image.jpg"}
                      alt={listing.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                    {/* Unlike button */}
                    <button
                      onClick={(e) => handleUnlike(e, listing._id)}
                      className={`absolute top-3 right-3 rounded-full p-2 shadow-md transition-colors ${
                        darkMode
                          ? "bg-gray-800/70 hover:bg-gray-800"
                          : "bg-white/70 hover:bg-white"
                      }`}
                      aria-label="Unlike property"
                    >
                      <AiFillHeart size={22} className="text-red-500" />
                    </button>
                    {/* Price tag */}
                    <div className={`absolute bottom-3 left-3 rounded-md py-1 px-2 text-sm font-semibold ${
                      darkMode
                        ? "bg-gray-900/80 text-gray-200"
                        : "bg-white/80 text-gray-800"
                    }`}>
                      ₱{listing.price || "N/A"}<span className="text-xs font-normal"> / night</span>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className={`p-4 h-2/5 flex flex-col ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <h3 className="text-lg font-semibold truncate">
                      {listing.title}
                    </h3>
                    <p className={`text-sm line-clamp-2 mt-1 flex-grow ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {listing.description}
                    </p>
                    <div className="flex items-center mt-2 text-xs">
                      {(listing.vacantUnits || listing.vacant) && (
                        <span className={`inline-block px-2 py-1 rounded-md ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                          {listing.vacantUnits || listing.vacant} unit{(listing.vacantUnits !== 1 && listing.vacant !== 1) && 's'} available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                You haven't liked any properties yet.
              </p>
              <button 
                onClick={() => navigate('/browse-listing')}
                className={`mt-4 px-4 py-2 rounded-lg ${
                  darkMode 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Browse Properties
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
      
      {/* Add custom styles for hiding scrollbar */}
      <style jsx="true">{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default LikedListing;
