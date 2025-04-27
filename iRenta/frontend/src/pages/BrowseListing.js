import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaChevronLeft } from "react-icons/fa";
import { Footer } from "../components/global/Footer";
import Topbar from "../components/global/Topbar";
import { toggleLike } from "../global/api/Users";
import { fetchListings } from "../global/api/Listings";
import { fetchUserData } from "../global/api/Users";
import { GetToken } from "../global/utils/Token";
import { AuthContext } from "../global/contexts/AuthContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { useProperty } from "../global/contexts/PropertyContext";
import { useMapLogic, MapListings } from "../components/Mapping/MapListings";
import "leaflet/dist/leaflet.css";

const BrowseListing = () => {
  const [likedListings, setLikedListings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [radius, setRadius] = useState(3);
  const [selectedCenter, setSelectedCenter] = useState("My Location");
  const { setSelectedProperty } = useProperty();
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  
  const [center, setCenter] = useState(null);
  
  const authToken = GetToken();
  const navigate = useNavigate();
  
  const listingsPerPage = 12;

  // Use useCallback to memoize the fetchListings function to prevent unnecessary re-renders
  const fetchListingsCallback = useCallback(async () => {
    try {
      console.log("Fetching all listings from API...");
      const response = await fetchListings();
      console.log(`API returned ${response?.length || 0} listings`);
      return response;
    } catch (error) {
      console.error("Error in fetchListingsCallback:", error);
      return [];
    }
  }, []);

  // Initialize map logic with proper dependencies
  const { isLoaded, nearbyListings, mapCenter, updateCenter } = useMapLogic({
    fetchListings: fetchListingsCallback,
    initialCenter: { lat: 14.586207, lng: 120.986373 }, // Default center (ADAMSON)
    RADIUS: radius,
    CENTER: center,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching user data and liked listings...");
        if (user && authToken) {
          const userdata = await fetchUserData(user?.id, authToken);
          setLikedListings(userdata?.likedListings || []);
        } else {
          setLikedListings([]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLikedListings([]);
      }
    };
    fetchData();
  }, [authToken, user]);

  // Handle radius change
  const handleRadiusChange = (event) => {
    const newRadius = Number(event.target.value);
    console.log(`Changing radius to ${newRadius}km`);
    setRadius(newRadius);
  };

  const handleLikeToggle = async (e, listingId) => {
    e.stopPropagation(); // Prevent click from reaching parent
    
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const updatedLikes = await toggleLike(listingId);
      setLikedListings(updatedLikes);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Handle center change
  const handleCenterChange = (event) => {
    const selectedLocation = event.target.value;
    setSelectedCenter(selectedLocation);

    let newCenter;
    switch (selectedLocation) {
      case "PNU":
        newCenter = { lat: 14.587681, lng: 120.982816 };
        break;
      case "ADAMSON":
        newCenter = { lat: 14.586207, lng: 120.986373 };
        break;
      case "TUP":
        newCenter = { lat: 14.587394044654793, lng: 120.98484635353088 };
        break;
      case "My Location":
        navigator.geolocation.getCurrentPosition(
          (position) => {
            newCenter = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCenter(newCenter);
            updateCenter(newCenter);
          },
          (error) => {
            console.error("Error getting location:", error);
            // Fall back to ADAMSON if location fails
            newCenter = { lat: 14.586207, lng: 120.986373 };
            setCenter(newCenter);
            updateCenter(newCenter);
          }
        );
        return;
      default:
        console.error("Unknown location selected:", selectedLocation);
        return;
    }
    
    setCenter(newCenter);
    updateCenter(newCenter);
  };

  // Filter listings based on user before displaying
  const filteredNearbyListings = nearbyListings ? (
    user
      ? nearbyListings.filter((listing) => {
          console.log('Filtering listing details:', {
            listingId: listing._id,
            listingUserId: listing.userId,
            currentUserId: user.id,
            vacant: listing.vacant,
            hasCoordinates: Boolean(listing.address?.lat && listing.address?.lng),
            fullListing: listing
          });

          // Temporarily remove the vacancy check for debugging
          const isNotOwnListing = listing.userId?.toString() !== user.id;
          // const hasVacancy = listing.vacant > 0;
          
          return isNotOwnListing; // && hasVacancy;
        })
      : nearbyListings.filter((listing) => {
          console.log('Filtering listing (no user):', {
            listingId: listing._id,
            vacant: listing.vacant,
            hasCoordinates: Boolean(listing.address?.lat && listing.address?.lng),
            fullListing: listing
          });
          
          // Temporarily remove the vacancy check for debugging
          // return listing.vacant > 0;
          return true;
        })
  ) : [];

  // Calculate pagination for the filtered nearby listings
  const indexOfLastListing = currentPage * listingsPerPage;
  const indexOfFirstListing = indexOfLastListing - listingsPerPage;
  const currentListings = filteredNearbyListings.slice(indexOfFirstListing, indexOfLastListing);
  const totalPages = Math.ceil(filteredNearbyListings.length / listingsPerPage);
  
  console.log('Detailed listings status:', {
    nearbyListings: nearbyListings?.map(l => ({
      id: l._id,
      userId: l.userId,
      vacant: l.vacant,
      hasCoordinates: Boolean(l.address?.lat && l.address?.lng)
    })),
    filteredNearbyListings: filteredNearbyListings.map(l => ({
      id: l._id,
      userId: l.userId,
      vacant: l.vacant,
      hasCoordinates: Boolean(l.address?.lat && l.address?.lng)
    })),
    currentListings: currentListings.map(l => ({
      id: l._id,
      userId: l.userId,
      vacant: l.vacant,
      hasCoordinates: Boolean(l.address?.lat && l.address?.lng)
    })),
    currentUser: user?.id,
    currentPage,
    totalPages
  });

  // Toggle map fullscreen
  const toggleMapFullscreen = () => setIsMapFullScreen(!isMapFullScreen);

  // Handle view property
  const handleViewProperty = (listing) => {
    setSelectedProperty(listing);
    navigate(`/${listing._id}`);
  };

  // Handle back click
  const handleBackClick = () => navigate(-1);

  // Handle page change
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  console.log(`Rendering with ${filteredNearbyListings.length} filtered nearby listings`);

  return (
    <div
      className={`flex flex-col min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <Topbar />

      <div className="flex-grow flex pt-[70px] h-screen">
        {!isMapFullScreen ? (
          <>
            <div className="flex flex-col flex-grow overflow-y-auto scrollbar-hide p-6 relative z-20 bg-inherit">
              {/* Header Section */}
              <div className="flex flex-col space-y-6 mb-8 relative">
                <div className="flex justify-between items-center">
                  <button
                    onClick={handleBackClick}
                    className={`flex items-center space-x-2 py-2 px-4 rounded-full transition-all duration-200 relative z-30 ${
                      darkMode
                        ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FaChevronLeft className="text-lg" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={toggleMapFullscreen}
                    className={`lg:hidden px-6 py-2 rounded-full transition-all duration-200 relative z-30 ${
                      darkMode
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {isMapFullScreen ? "Hide Map" : "Show Map"}
                  </button>
                </div>

                {/* Filters Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-30">
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="radius" className="text-lg font-medium">
                      Search Radius
                    </label>
                    <div className="relative">
                      <select
                        id="radius"
                        value={radius}
                        onChange={handleRadiusChange}
                        className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 appearance-none ${
                          darkMode
                            ? "bg-gray-800 text-white border-gray-700 focus:border-blue-500"
                            : "bg-white text-gray-900 border-gray-300 focus:border-blue-500"
                        }`}
                      >
                        <option value={.5}>500 meters</option>
                        <option value={1}>1 kilometer</option>
                        <option value={3}>3 kilometers</option>
                        <option value={5}>5 kilometers</option>
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label htmlFor="center" className="text-lg font-medium">
                      Location Center
                    </label>
                    <div className="relative">
                      <select
                        id="center"
                        value={selectedCenter}
                        onChange={handleCenterChange}
                        className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 appearance-none ${
                          darkMode
                            ? "bg-gray-800 text-white border-gray-700 focus:border-blue-500"
                            : "bg-white text-gray-900 border-gray-300 focus:border-blue-500"
                        }`}
                      >
                        <option value="My Location">My Location</option>
                        <option value="PNU">PNU</option>
                        <option value="ADAMSON">Adamson University</option>
                        <option value="TUP">TUP Manila</option>
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section with proper z-index */}
              <div className="relative z-20">
                {!isLoaded ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-pulse text-lg">Loading properties...</div>
                  </div>
                ) : filteredNearbyListings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <p className="text-xl font-medium">No Properties Found</p>
                    <p className="text-gray-500 text-center">
                      We couldn't find any properties within {radius}km of the selected location.<br />
                      Try adjusting your search radius or choosing a different location.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {currentListings.map((listing) => (
                        <div
                          key={listing._id}
                          className={`flex flex-col rounded-xl overflow-hidden transition-all duration-200 hover:transform hover:scale-[1.02] ${
                            darkMode
                              ? "bg-gray-800 shadow-lg hover:shadow-xl"
                              : "bg-white shadow-md hover:shadow-xl"
                          }`}
                        >
                          <div className="relative aspect-[4/3] overflow-hidden">
                            <img
                              src={listing.images?.[0]?.link || "/placeholder-image.jpg"}
                              alt={listing.title}
                              onClick={() => handleViewProperty(listing)}
                              className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-110"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLikeToggle(listing._id);
                              }}
                              className={`absolute top-3 right-3 p-2.5 rounded-full shadow-lg transition-all duration-200 ${
                                darkMode
                                  ? "bg-gray-900/80 text-white hover:bg-gray-900"
                                  : "bg-white/80 hover:bg-white"
                              }`}
                            >
                              {likedListings?.includes(listing._id) ? (
                                <AiFillHeart size={24} className="text-red-500" />
                              ) : (
                                <AiOutlineHeart size={24} className="text-gray-600" />
                              )}
                            </button>
                          </div>

                          <div 
                            className="p-5 flex flex-col space-y-3 flex-grow cursor-pointer"
                            onClick={() => handleViewProperty(listing)}
                          >
                            <h3 className="text-xl font-semibold line-clamp-1">
                              {listing.title}
                            </h3>
                            <p className={`text-sm line-clamp-2 ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}>
                              {listing.description}
                            </p>
                            <div className="flex items-center justify-between mt-auto pt-2">
                              <p className={`text-lg font-bold ${
                                darkMode ? "text-blue-400" : "text-blue-600"
                              }`}>
                                ₱{listing.price} <span className="text-sm font-normal">/night</span>
                              </p>
                              <span className={`text-sm px-3 py-1 rounded-full ${
                                listing.vacantUnits > 0
                                  ? darkMode
                                    ? "bg-green-900/30 text-green-400"
                                    : "bg-green-100 text-green-700"
                                  : darkMode
                                    ? "bg-red-900/30 text-red-400"
                                    : "bg-red-100 text-red-700"
                              }`}>
                                {listing.vacantUnits > 0 ? `${listing.vacantUnits} Available` : 'Fully Booked'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center mt-8 space-x-2">
                        {Array.from({ length: totalPages }, (_, index) => (
                          <button
                            key={index}
                            onClick={() => handlePageChange(index + 1)}
                            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                              currentPage === index + 1
                                ? darkMode
                                  ? "bg-blue-600 text-white"
                                  : "bg-blue-500 text-white"
                                : darkMode
                                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="hidden lg:block lg:w-1/3 h-full relative z-10">
              {isLoaded && (
                <MapListings
                  isLoaded={isLoaded}
                  mapCenter={mapCenter}
                  nearbyListings={filteredNearbyListings}
                  handleViewProperty={handleViewProperty}
                  radius={radius}
                />
              )}
            </div>
          </>
        ) : (
          <div className="w-full h-full relative">
            <button
              onClick={toggleMapFullscreen}
              className={`absolute top-4 left-4 z-50 px-6 py-2 rounded-full shadow-lg transition-all duration-200 ${
                darkMode
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-white text-gray-900 hover:bg-gray-100"
              }`}
            >
              Back to Listings
            </button>
            <div className="relative z-10">
              {isLoaded && (
                <MapListings
                  isLoaded={isLoaded}
                  mapCenter={mapCenter}
                  nearbyListings={filteredNearbyListings}
                  handleViewProperty={handleViewProperty}
                  radius={radius}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BrowseListing;