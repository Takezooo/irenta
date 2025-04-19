import React, { useState, useEffect, useContext } from "react";
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

const BrowseListing = () => {
  const [listings, setListings] = useState([]);
  const [likedListings, setLikedListings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [radius, setRadius] = useState(3); // Add radius state
  const { setSelectedProperty } = useProperty();
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [center, setCenter] = useState({
    lng: 0,
    lat: 0,
  });
  const [selectedCenter, setSelectedCenter] = useState("My Location"); // Default value

  const authToken = GetToken();
  const navigate = useNavigate();

  const listingsPerPage = 12;

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching listings...");
        const data = await fetchListings();

        let filteredData;
        if (!user) {
          filteredData = data?.filter((listing) => listing.vacant > 0) || [];
          setLikedListings([]);
        } else {
          filteredData =
            data?.filter(
              (listing) =>
                listing.vacant > 0 && listing.userId.toString() !== user.id
            ) || [];
          const userdata = await fetchUserData(user?.id, authToken);
          setLikedListings(userdata?.likedListings || []);
        }
        setListings(filteredData);
      } catch (error) {
        console.error("Error fetching or filtering listings:", error);
      }
    };
    fetchData();
    // fetchCurrentUserData();
  }, [authToken, user]);

  const { isLoaded, nearbyListings, mapCenter } = useMapLogic({
    fetchListings,
    initialCenter: { lat: 14.454, lng: 120.937 },
    RADIUS: radius,
    CENTER: center,
  });

  const filteredNearbyListings = user
  ? nearbyListings.filter(
      (listing) =>
        listing.userId?.toString() !== user.id &&
        listing.vacant > 0
    )
  : nearbyListings.filter((listing) => listing.vacant > 0);

  const handleRadiusChange = (event) => {
    setRadius(Number(event.target.value)); // Update the radius dynamically
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

  const handleCenterChange = (event) => {
    const selectedLocation = event.target.value;

    switch (selectedLocation) {
      case "PNU":
        const pnuCenter = { lat: 14.587681, lng: 120.982816 };
        setCenter(pnuCenter); // Update local center state
        break;
      case "ADAMSON":
        const adamsonCenter = { lat: 14.586207, lng: 120.986373 };
        setCenter(adamsonCenter); // Update local center state
        break;
      case "TUP":
        const tupCenter = { lat: 14.587394044654793, lng: 120.98484635353088 };
        setCenter(tupCenter); // Update local center state
        break;
      case "My Location":
        navigator.geolocation.getCurrentPosition((position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(userLocation); // Default to user's current location
        });
        break;
      default:
        console.error("Unknown location selected:", selectedLocation);
    }
  };

  const openMapFullScreen = () => setIsMapFullScreen(true);
  const closeMapFullScreen = () => setIsMapFullScreen(false);

  const indexOfLastListing = currentPage * listingsPerPage;
  const indexOfFirstListing = indexOfLastListing - listingsPerPage;
  const currentListings = listings.slice(
    indexOfFirstListing,
    indexOfLastListing
  );

  const totalPages = Math.ceil(listings.length / listingsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handleViewProperty = (listing) => {
    setSelectedProperty(listing);
    navigate(`/${listing._id}`);
  };

  const handleBackClick = () => navigate(-1);

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
              className={`w-fit flex rounded-full items-center py-2 px-4 mb-4 ${
                darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-500 text-gray-100 hover:bg-gray-700"
              }`}
            >
              <FaChevronLeft className="text-lg" />
            </button>

            {/* Dropdown for Radius Selection */}
            <div className="mb-4">
              <label htmlFor="radius" className="block mb-2 font-medium">
                Select Radius (km)
              </label>
              <select
                id="radius"
                value={radius}
                onChange={handleRadiusChange}
                className={`px-4 py-2 border rounded ${
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

            <div className="mb-4">
              <label htmlFor="center" className="block mb-2 font-medium">
                Select Center
              </label>
              <select
                id="center"
                value={selectedCenter} // Bind to the selectedCenter state
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCenter(value); // Update the selectedCenter state
                  handleCenterChange(e); // Call the existing handleCenterChange logic
                }}
                className={`px-4 py-2 border rounded ${
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

            <div className="flex flex-wrap gap-4">
              {filteredNearbyListings.map((listing) => (
                <div
                  key={listing._id}
                  onClick={() => handleViewProperty(listing)}
                  className={`h-96 rounded-xl shadow-md border overflow-hidden transition-transform hover:scale-[1.02] cursor-pointer ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-gray-700"
                      : "bg-white border-gray-200 hover:shadow-lg"
                  } w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1rem)]`}
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikeToggle(e, listing._id);
                      }}
                      className={`absolute top-3 right-3 rounded-full p-2 shadow-md transition-colors ${
                        darkMode
                          ? "bg-gray-800/70 hover:bg-gray-800"
                          : "bg-white/70 hover:bg-white"
                      }`}
                    >
                      {likedListings?.includes(listing._id) ? (
                        <AiFillHeart size={22} className="text-red-500" />
                      ) : (
                        <AiOutlineHeart size={22} className={darkMode ? "text-gray-300" : "text-gray-600"} />
                      )}
                    </button>
                    {/* Price tag */}
                    <div className={`absolute bottom-3 left-3 rounded-md py-1 px-2 text-sm font-semibold ${
                      darkMode
                        ? "bg-gray-900/80 text-gray-200"
                        : "bg-white/80 text-gray-800"
                    }`}>
                      ${listing.price}<span className="text-xs font-normal"> / night</span>
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
                      <span className={`inline-block px-2 py-1 rounded-md ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                        {listing.vacant} unit{listing.vacant !== 1 && 's'} available
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
          </div>

          <div className="hidden lg:flex lg:flex-shrink-0 lg:w-1/3 h-100% ">
            <MapListings
              isLoaded={isLoaded}
              mapCenter={mapCenter}
              nearbyListings={filteredNearbyListings}
              handleViewProperty={handleViewProperty}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default BrowseListing;
