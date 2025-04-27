import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp, FaSearch, FaFilter } from "react-icons/fa";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

import Topbar from "../components/global/Topbar.js";
import Sidebar from "../components/global/Sidebar.js";
import { Footer } from "../components/global/Footer.js";
import LoadingScreen from "../components/global/Loading.js";

import { AuthContext } from "../global/contexts/AuthContext.js";
import { ThemeContext } from "../contexts/ThemeContext.js";
import { useProperty } from "../global/contexts/PropertyContext";
import { toggleLike, fetchUserData } from "../global/api/Users.js";
import { fetchListings } from "../global/api/Listings.js";
import { GetToken } from "../global/utils/Token.js";

const LandingPage = () => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const { setSelectedProperty } = useProperty();
  const [likedListings, setLikedListings] = useState([]);
  const navigate = useNavigate();
  const filterRef = useRef(null);
  const amenitiesList = [
    "Fully Furnished",
    "6 Bed and Bedframe",
    "Aircon",
    "WiFi / Internet",
    "Electricity Bill",
    "Water Bill",
    "Kitchen",
    "Parking Space",
    "CCTV",
    "Swimming Pool",
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);
  const [isOpen, setIsOpen] = useState(false);

  const handleBrowseListing = () => navigate("/browse-listing");
  const handleAboutUs = () => navigate("/about-us");

  // Close filter when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterRef]);

  const filterListings = () => {
    let results = [...listings];

    // Filter by search query (match title, description, or location)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter((listing) => 
        listing.title?.toLowerCase().includes(searchLower) || 
        listing.description?.toLowerCase().includes(searchLower) || 
        listing.location?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by price range
    if (minPrice) {
      results = results.filter(
        (listing) => listing.price >= parseFloat(minPrice)
      );
    }
    if (maxPrice) {
      results = results.filter(
        (listing) => listing.price <= parseFloat(maxPrice)
      );
    }

    // Filter by selected amenities
    if (selectedAmenities.length > 0) {
      results = results.filter((listing) =>
        selectedAmenities.every((amenity) =>
          listing.amenities?.includes(amenity)
        )
      );
    }

    setFilteredListings(results);
  };

  const scrollContainerRef = useRef(null);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const isAtStart = container.scrollLeft === 0;
      const isAtEnd =
        container.scrollWidth - container.clientWidth <= container.scrollLeft + 1;

      setShowLeftArrow(!isAtStart);
      setShowRightArrow(!isAtEnd);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  useEffect(() => {
    filterListings();
  }, [searchTerm, minPrice, maxPrice, selectedAmenities, listings]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchListings();
        
        let filteredData;
        if (!user) {
          filteredData = data?.filter((listing) => listing.vacantUnits > 0) || [];
          setLikedListings([]);
        } else {
          filteredData = data?.filter((listing) => listing.vacantUnits > 0 && listing.userId.toString() !== user.id) || [];
          // Fetch fresh liked listings data
          const freshUserData = await fetchUserData(user.id, GetToken());
          setLikedListings(freshUserData?.likedListings || []);
        }

        setListings(filteredData);
        setFilteredListings(filteredData);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();

    // Add event listener to refresh data when page returns to focus
    window.addEventListener('focus', fetchData);
    
    // Cleanup function
    return () => {
      window.removeEventListener('focus', fetchData);
    };
  }, [user]);
  
  const handleViewProperty = (listing) => {
    setSelectedProperty(listing);
    navigate(`/${listing._id}`);
  };

  const handleLikeToggle = async (e, listingId) => {
    e.stopPropagation(); // Prevent propagation to parent (card click)
    
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

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedAmenities([]);
    setFilteredListings(listings);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const displayedListings = filteredListings.length > 0 ? filteredListings : listings;
  const noResults = filteredListings.length === 0 && (searchTerm || minPrice || maxPrice || selectedAmenities.length > 0);

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} min-h-screen`}>
      <Topbar toggleSidebar={toggleSidebar} isOpen={isOpen} />
      <Sidebar isOpen={isOpen} />

      {user ? (
        <>
          <div className="pt-8 min-h-screen">
            <div className="mx-auto flex align-center flex-col rounded-xl mt-24 lg:mt-16 w-[calc(100%-200px)] max-w-[1800px]">
              {/* Search and Filters */}
              <div className="w-full mb-6">
                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-4">
                  <h1 className={`text-2xl font-bold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Available Properties</h1>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className={`relative flex-grow max-w-md ${darkMode ? "text-white" : "text-gray-800"}`}>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full rounded-lg py-2 pl-10 pr-4 text-sm border placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-gray-200"
                            : "bg-gray-50 border-gray-300 text-gray-900"
                        }`}
                        placeholder="Search by name, description, location..."
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className={`${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                      </div>
                    </div>
                    
                    <div ref={filterRef} className="relative">
                      <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`py-2 px-4 rounded-lg flex items-center gap-2 transition-colors ${
                          darkMode
                            ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        } ${(minPrice || maxPrice || selectedAmenities.length > 0) ? (darkMode ? "ring-2 ring-blue-500" : "ring-2 ring-blue-500") : ""}`}
                      >
                        <FaFilter />
                        Filter
                        {isFilterOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                      </button>
                      
                      {isFilterOpen && (
                        <div className={`mt-2 absolute top-full right-0 w-72 p-4 shadow-lg rounded-lg border z-50 ${
                          darkMode
                            ? "bg-gray-800 text-gray-200 border-gray-700"
                            : "bg-white text-gray-800 border-gray-200"
                        }`}>
                          <div className="flex flex-col gap-4">
                            <h3 className="font-semibold">Price Range</h3>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                placeholder="Min Price"
                                className={`w-1/2 rounded-md py-2 px-3 text-sm border ${
                                  darkMode
                                    ? "bg-gray-700 text-gray-200 border-gray-600"
                                    : "bg-gray-50 text-gray-900 border-gray-300"
                                }`}
                              />
                              <input
                                type="number"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                placeholder="Max Price"
                                className={`w-1/2 rounded-md py-2 px-3 text-sm border ${
                                  darkMode
                                    ? "bg-gray-700 text-gray-200 border-gray-600"
                                    : "bg-gray-50 text-gray-900 border-gray-300"
                                }`}
                              />
                            </div>
                            
                            <h3 className="font-semibold mt-2">Amenities</h3>
                            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                              {amenitiesList.map((amenity) => (
                                <label key={amenity} className={`flex items-center gap-2 text-sm ${
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                }`}>
                                  <input
                                    type="checkbox"
                                    value={amenity}
                                    checked={selectedAmenities.includes(amenity)}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setSelectedAmenities((prev) =>
                                        prev.includes(value)
                                          ? prev.filter((item) => item !== value)
                                          : [...prev, value]
                                      );
                                    }}
                                    className={`rounded text-blue-500 focus:ring-blue-500 ${
                                      darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                                    }`}
                                  />
                                  {amenity}
                                </label>
                              ))}
                            </div>
                            
                            <button
                              onClick={resetFilters}
                              className={`mt-2 w-full rounded-md py-2 text-sm ${
                                darkMode
                                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                              }`}
                            >
                              Reset Filters
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleBrowseListing}
                  className="inline-block bg-blue-500 hover:bg-blue-600 rounded-full py-2 px-4 text-gray-200 hover:text-gray-300"
                >
                  See more
                </button>
              </div>

              {/* No results message */}
              {noResults && (
                <div className={`w-full text-center py-10 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  <p className="text-lg font-medium">No properties match your search criteria</p>
                  <button 
                    onClick={resetFilters}
                    className={`mt-2 underline ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                  >
                    Clear all filters
                  </button>
                </div>
              )}

              {/* Listings Grid */}
              {!noResults && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayedListings.map((listing) => (
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
                        <button
                          onClick={(e) => handleLikeToggle(e, listing._id)}
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
                            {listing.vacantUnits} unit{listing.vacantUnits !== 1 && 's'} available
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="pt-8">
            {/* Hero Section */}
            <div className={`mx-auto mt-16 flex align-center flex-col p-8 rounded-xl w-[calc(100%-200px)] max-w-[1800px] ${
              darkMode
                ? "bg-gradient-to-r from-blue-900 to-gray-800"
                : "bg-gradient-to-r from-blue-500 to-blue-300"
            }`}>
              <h1 className="font-extrabold text-5xl lg:text-6xl mb-4 sm:text-7xl text-white">
                WELCOME TO <br /> iRENTA
              </h1>
              <p className="text-lg mb-6 text-gray-100">
                Find your perfect rental property with ease. Browse, compare, and book.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login" className="w-full sm:w-auto">
                  <button className="w-full px-6 py-3 rounded-lg font-medium transition-colors bg-white text-blue-800 hover:bg-gray-100">
                    Log in
                  </button>
                </Link>
                <Link to="/register" className="w-full sm:w-auto">
                  <button className="w-full px-6 py-3 rounded-lg font-medium bg-gray-800/30 text-white hover:bg-gray-800/50 transition-colors">
                    Register
                  </button>
                </Link>
              </div>
            </div>

            {/* Featured Properties */}
            <div className="mx-auto flex flex-col rounded-xl mt-16 w-[calc(100%-200px)] max-w-[1800px]">
              <div className="flex flex-row w-full items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                  Featured Properties
                </h2>
                <button
                  onClick={handleBrowseListing}
                  className={`inline-block font-medium transition-colors ${
                    darkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-700"
                  }`}
                >
                  See all properties →
                </button>
              </div>
              
              <div className="relative">
                {showLeftArrow && (
                  <button
                    onClick={scrollLeft}
                    aria-label="Scroll left"
                    className={`absolute -left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full shadow-md z-10 ${
                      darkMode
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <FaChevronLeft />
                  </button>
                )}
                <div
                  ref={scrollContainerRef}
                  className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-6 pb-4"
                >
                  {listings.map((listing) => (
                    <div
                      key={listing._id}
                      className={`flex-shrink-0 snap-start h-96 w-72 rounded-xl shadow-md border overflow-hidden transition-all ${
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
                          onClick={() => handleViewProperty(listing)}
                          className="w-full h-full object-cover transition-transform cursor-pointer hover:scale-105"
                          loading="lazy"
                          decoding="async"
                        />
                        <button
                          onClick={(e) => handleLikeToggle(e, listing._id)}
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
                      <div
                        className={`p-4 h-2/5 flex flex-col ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                        onClick={() => handleViewProperty(listing)}
                      >
                        <h3 className="text-lg font-semibold truncate">
                          {listing.title}
                        </h3>
                        <p className={`text-sm line-clamp-2 mt-1 flex-grow ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {listing.description}
                        </p>
                        <div className="flex items-center mt-2 text-xs">
                          <span className={`inline-block px-2 py-1 rounded-md ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                            {listing.vacantUnits} unit{listing.vacantUnits !== 1 && 's'} available
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {showRightArrow && (
                  <button
                    onClick={scrollRight}
                    aria-label="Scroll right"
                    className={`absolute -right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full shadow-md z-10 ${
                      darkMode
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <FaChevronRight />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* About Section */}
          <div className="my-32 bg-gradient-to-r from-blue-900 to-gray-800 text-white">
            <div className="max-w-[1800px] w-[calc(100%-200px)] mx-auto py-16 px-6 md:px-8 flex flex-col md:flex-row items-center gap-12">
              <div className="h-32 w-32 p-4 bg-white rounded-xl flex items-center justify-center shadow-lg md:mr-8">
                <img
                  src="./assets/images/irenta.png"
                  className="h-full"
                  alt="iRenta Logo"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-4xl font-bold mb-4">About iRenta</h3>
                <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                  <p className="text-gray-200 mb-4">
                    iRenta is a modern property rental platform that connects property owners with 
                    potential tenants. Our goal is to simplify the rental process through technology 
                    and exceptional user experience.
                  </p>
                  <button
                    className="inline-block text-blue-300 font-medium hover:text-blue-200 transition"
                    onClick={handleAboutUs}
                  >
                    Learn more about our services →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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

      <Footer />
    </div>
  );
};

export default LandingPage;