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

  // Handle like toggle
  const handleLikeToggle = async (listingId) => {
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
            <div className="flex flex-col flex-grow overflow-y-auto scrollbar-hide p-4">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={handleBackClick}
                  className={`w-fit flex rounded-full items-center py-2 px-4 ${
                    darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-500 text-gray-100 hover:bg-gray-700"
                  }`}
                >
                  <FaChevronLeft className="text-lg" />
                </button>

                <button
                  onClick={toggleMapFullscreen}
                  className={`lg:hidden px-4 py-2 rounded ${
                    darkMode
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {isMapFullScreen ? "Hide Map" : "Show Map"}
                </button>
              </div>

              <div className="flex flex-wrap gap-4 mb-4">
                <div className="w-full sm:w-1/2">
                  <label htmlFor="radius" className="block mb-2 font-medium">
                    Select Radius (km)
                  </label>
                  <select
                    id="radius"
                    value={radius}
                    onChange={handleRadiusChange}
                    className={`w-full px-4 py-2 border rounded ${
                      darkMode
                        ? "bg-gray-800 text-white border-gray-700"
                        : "bg-white text-black border-gray-300"
                    }`}
                  >
                    <option value={1}>1 km</option>
                    <option value={3}>3 km</option>
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={20}>20 km</option>
                  </select>
                </div>

                <div className="w-full sm:w-1/2">
                  <label htmlFor="center" className="block mb-2 font-medium">
                    Select Center
                  </label>
                  <select
                    id="center"
                    value={selectedCenter}
                    onChange={handleCenterChange}
                    className={`w-full px-4 py-2 border rounded ${
                      darkMode
                        ? "bg-gray-800 text-white border-gray-700"
                        : "bg-white text-black border-gray-300"
                    }`}
                  >
                    <option value="PNU">PNU</option>
                    <option value="ADAMSON">Adamson</option>
                    <option value="TUP">TUP</option>
                    <option value="My Location">My Location</option>
                  </select>
                </div>
              </div>

              {/* Display a loading state while data is being fetched */}
              {!isLoaded ? (
                <div className="w-full p-6 text-center">
                  <p className="text-lg">Loading properties...</p>
                </div>
              ) : filteredNearbyListings.length === 0 ? (
                <div className="w-full p-6 text-center">
                  <p className="text-lg">No properties found within {radius}km of the selected location.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {currentListings.map((listing) => {
                    console.log('Rendering listing card:', listing._id);
                    return (
                      <div
                        key={listing._id}
                        className={`flex flex-col rounded-lg shadow-md overflow-hidden border h-96 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1rem)] hover:shadow-lg transition-all ${
                          darkMode
                            ? "bg-gray-800 border-gray-700"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <div className="relative flex-shrink-0 h-2/3">
                          <img
                            src={listing.images?.[0]?.link || "/placeholder-image.jpg"}
                            alt={listing.title}
                            onClick={() => handleViewProperty(listing)}
                            className="w-full h-full object-cover cursor-pointer"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLikeToggle(listing._id);
                            }}
                            className={`absolute top-2 right-2 rounded-full p-2 shadow-md ${
                              darkMode
                                ? "bg-gray-700 text-gray-300 hover:text-red-500"
                                : "bg-white text-gray-600 hover:text-red-500"
                            }`}
                          >
                            {likedListings?.includes(listing._id) ? (
                              <AiFillHeart size={20} className="text-red-500" />
                            ) : (
                              <AiOutlineHeart size={20} />
                            )}
                          </button>
                        </div>

                        <div className="p-4 flex-grow flex flex-col justify-between">
                          <h3 className="text-lg font-semibold truncate">
                            {listing.title}
                          </h3>
                          <p
                            className={`text-sm line-clamp-2 ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {listing.description}
                          </p>
                          <p
                            className={`font-bold mt-2 ${
                              darkMode ? "text-gray-200" : "text-gray-700"
                            }`}
                          >
                            {listing.price} / night
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index + 1)}
                      className={`px-4 py-2 mx-1 border rounded ${
                        currentPage === index + 1
                          ? darkMode
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : darkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden lg:flex lg:flex-shrink-0 lg:w-1/3 h-full relative">
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
              className={`absolute top-4 left-4 z-10 px-4 py-2 rounded ${
                darkMode
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              Back to Listings
            </button>
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
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BrowseListing;