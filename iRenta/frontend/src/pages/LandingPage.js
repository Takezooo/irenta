import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

import Topbar from "../components/global/Topbar.js";
import Sidebar from "../components/global/Sidebar.js";
import { Footer } from "../components/global/Footer.js";
import LoadingScreen from "../components/global/Loading.js";

import { AuthContext } from "../global/contexts/AuthContext.js";
import { ThemeContext } from "../contexts/ThemeContext.js";
import { useProperty } from "../global/contexts/PropertyContext";
import { toggleLike } from "../global/api/Users.js";
import { fetchListings } from "../global/api/Listings.js";

const LandingPage = () => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Search term
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext); // Dark mode context
  const { setSelectedProperty } = useProperty();
  const [likedListings, setLikedListings] = useState([]);
  const navigate = useNavigate();
  const amenitiesList = [
    "Fully Furnished",
    "6 Bed and Bedframe",
    "Aircon",
    "WiFi / Internet",
    "Electricity Bill",
    "Water Bill",
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleBrowseListing = () => navigate("/browse-listing");
  const handleAboutUs = () => navigate("/about-us");

  const filterListings = () => {
    let results = [...listings];

    // Filter by search query
    if (searchTerm) {
      results = results.filter((listing) =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase())
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
        container.scrollWidth - container.clientWidth === container.scrollLeft;

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
  }, [user]);

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
  }, [searchTerm, minPrice, maxPrice, selectedAmenities]);

  useEffect(() => {
      const fetchData = async () => {
      try {
        console.log("Fetching listings...");
        const data = await fetchListings();
        console.log("Listings fetched:", data);
  
        let filteredData;
        if (!user) {
          filteredData = data?.filter((listing) => listing.vacant > 0) || [];
        } else {
          filteredData = data?.filter((listing) => listing.vacant > 0 && listing.userId.toString() !== user.id) || [];
        }

        console.log("filteredData fetched:", filteredData);
        setListings(filteredData);
        setFilteredListings(filteredData);
        // setLikedListings(user?.likedListings || []);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        console.log("Setting isLoading to false");
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [user]);
  

  const handleViewProperty = (listing) => {
    setSelectedProperty(listing);
    navigate(`/${listing._id}`);
  };

  const handleLikeToggle = async (listingId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const updatedLikes = await toggleLike(listingId);
      setLikedListings(updatedLikes);
      setListings((prevListings) =>
        prevListings.map((listing) =>
          listing._id === listingId
            ? { ...listing, liked: !listing.liked }
            : listing
        )
      );
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      } min-h-screen`}
    >
      <Topbar toggleSidebar={toggleSidebar} isOpen={isOpen} />
      <Sidebar isOpen={isOpen} />

      {user ? (
        <>
          <div className="pt-8 min-h-screen">
            <div className="mx-auto flex align-center flex-col rounded-xl mt-24 lg:mt-16 w-[90%]">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-2 justify-end mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full sm:w-fit rounded-md py-2 px-4 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      darkMode
                        ? "bg-gray-600 text-gray-300 border-gray-500 placeholder-gray-400"
                        : "bg-gray-100 text-gray-900 border-gray-300"
                    }`}
                    placeholder="Search property name..."
                  />
                  <div className="relative w-full lg:w-auto">
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className={`w-full rounded-lg px-4 py-2 flex items-center gap-2 shadow-md justify-between ${
                        darkMode
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      Filter
                      {isOpen ? (<FaChevronUp />) : (<FaChevronDown />)}
                    </button>
                    {isOpen && (
                    <div className={`mt-2 absolute top-full right-0 w-full lg:w-80 p-4 shadow-lg rounded-lg border z-50 ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 border-gray-600"
                        : "bg-white text-gray-900 border-gray-300"
                    }`}>
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            placeholder="Min Price"
                            className={`w-1/2 rounded-md py-2 px-4 text-sm border ${
                              darkMode
                                ? "bg-gray-600 text-gray-300 border-gray-500"
                                : "bg-gray-100 text-gray-900 border-gray-300"
                            }`}
                          />
                          <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            placeholder="Max Price"
                            className={`w-1/2 rounded-md py-2 px-4 text-sm border ${
                              darkMode
                                ? "bg-gray-600 text-gray-300 border-gray-500"
                                : "bg-gray-100 text-gray-900 border-gray-300"
                            }`}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          {amenitiesList.map((amenity) => (
                            <label key={amenity} className={`flex items-center gap-2 text-sm ${
                              darkMode ? "text-gray-300" : "text-gray-900"
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
                                className="rounded text-blue-500 focus:ring-blue-500"
                              />
                              {amenity}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
                {/* <button
                  onClick={handleBrowseListing}
                  className="inline-block bg-blue-500 hover:bg-blue-600 rounded-full py-2 px-4 text-gray-200 hover:text-gray-300"
                >
                  See more
                </button> */}
              </div>

              {/* Listings */}
              <div className="relative">
                {/* {showLeftArrow && (
                  <button
                    onClick={scrollLeft}
                    className={`absolute left-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full shadow-md ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    <FaChevronLeft />
                  </button>
                )} */}
                <div
                  // ref={scrollContainerRef}
                  className="flex flex-wrap space-x-4"
                >
                  {listings.map((listing) => (
                    <div
                      key={listing._id}
                      className={`flex-shrink-0 h-96 w-full sm:w-72 rounded-lg shadow-md border overflow-hidden ${
                        darkMode
                          ? "bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-gray-700"
                          : "bg-white border-gray-300 hover:shadow-lg"
                      }`}
                    >
                      {/* Image Section */}
                      <div className="relative flex-shrink-0 h-2/3">
                        <img
                          src={
                            listing.images?.[0]?.link ||
                            "/placeholder-image.jpg"
                          }
                          alt={listing.title}
                          onClick={() => handleViewProperty(listing)}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleLikeToggle(listing._id)}
                          className={`absolute top-2 right-2 rounded-full p-2 shadow-md ${
                            darkMode
                              ? "bg-gray-700 text-gray-300"
                              : "bg-white text-gray-600"
                          } hover:text-red-500`}
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
                        className={`p-4 flex-grow h-1/3 flex flex-col justify-between ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                        onClick={() => handleViewProperty(listing)}
                      >
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
                          className={`justify-end font-bold mt-2 ${
                            darkMode ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          {listing.price} / night
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* {showRightArrow && (
                  <button
                    onClick={scrollRight}
                    className={`absolute right-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full shadow-md ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    <FaChevronRight />
                  </button>
                )} */}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="pt-8">
            <div
              className={`mx-auto mt-16 flex align-center flex-col p-5 rounded-xl w-[90%] ${
                darkMode
                  ? "bg-gradient-to-r from-blue-900 to-gray-800"
                  : "bg-gradient-to-r from-blue-500 to-gray-200"
              }`}
            >
              <h1 className="font-extrabold text-5xl lg:text-6xl mb-2 sm:text-7xl">
                WELCOME TO <br /> iRENTA
              </h1>
              <p className="text-m mb-[20px]">
                Please choose an option to continue.
              </p>
              <div className="flex flex-col lg:flex-row gap-4">
                <Link to="/login">
                  <button
                    className={`w-[100%] px-[24px] py-[10px] rounded-md ${
                      darkMode
                        ? "bg-blue-700 text-white hover:bg-blue-600"
                        : "bg-blue-800 text-white hover:bg-blue-600"
                    }`}
                  >
                    Log in
                  </button>
                </Link>
                <Link to="/register">
                  <button
                    className={`w-[100%] px-[24px] py-[10px] rounded-md ${
                      darkMode
                        ? "bg-gray-500 bg-opacity-30 text-white hover:bg-gray-400"
                        : "bg-gray-300 text-black hover:bg-gray-400"
                    }`}
                  >
                    Register
                  </button>
                </Link>
              </div>
            </div>
            <div
              className={`mx-auto flex align-center flex-col rounded-xl mt-16 w-[90%] 
              `}
            >
              <div className="flex flex-row w-full items-center justify-between">
                <h2
                  className={`text-xl font-bold mb-4 ${
                    darkMode ? "text-gray-300" : "text-black"
                  }`}
                >
                  Properties
                </h2>
                <button
                  onClick={handleBrowseListing}
                  className={`mt-4 inline-block underline ${
                    darkMode
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-black hover:text-gray-700"
                  }`}
                >
                  See more
                </button>
              </div>
              <div className="relative">
                {showLeftArrow && (
                  <button
                    onClick={scrollLeft}
                    className={`absolute left-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full shadow-md ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    <FaChevronLeft />
                  </button>
                )}
                <div
                  ref={scrollContainerRef}
                  className="flex overflow-x-hidden space-x-4"
                >
                  {listings.map((listing) => (
                    <div
                      key={listing._id}
                      className={`flex-shrink-0 h-96 w-72 rounded-lg shadow-md border overflow-hidden ${
                        darkMode
                          ? "bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-gray-700"
                          : "bg-white border-gray-300 hover:shadow-lg"
                      }`}
                    >
                      {/* Image Section */}
                      <div className="relative flex-shrink-0 h-2/3">
                        <img
                          src={
                            listing.images?.[0]?.link ||
                            "/placeholder-image.jpg"
                          }
                          alt={listing.title}
                          onClick={() => handleViewProperty(listing)}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleLikeToggle(listing._id)}
                          className={`absolute top-2 right-2 rounded-full p-2 shadow-md ${
                            darkMode
                              ? "bg-gray-700 text-gray-300"
                              : "bg-white text-gray-600"
                          } hover:text-red-500`}
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
                        className={`p-4 flex-grow h-1/3 flex flex-col justify-between ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                        onClick={() => handleViewProperty(listing)}
                      >
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
                          className={`justify-end font-bold mt-2 ${
                            darkMode ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          {listing.price} / night
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {showRightArrow && (
                  <button
                    onClick={scrollRight}
                    className={`absolute right-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full shadow-md ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    <FaChevronRight />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="my-36 bg-gradient-to-r from-blue-950 to-gray-900 text-white flex items-center justify-evenly py-14 px-24 relative">
            <div className="h-28 w-28 p-2 bg-gray-100 rounded-lg flex items-center justify-center shadow-md mr-6">
              <img
                src="./assets/images/irenta.png"
                className="h-full"
                alt="iRenta Logo"
              />
            </div>
            <div className="w-[40%]">
              <div>
                <h3 className="text-3xl font-bold">iRenta</h3>
              </div>
              <div className="bg-gray-300 p-6 mt-2 rounded-xl text-black text-wrap">
                <p className="mt-2 text-sm">
                  This is a placeholder description for the additional div. It
                  includes a brief overview and is styled for aesthetic alignment.
                </p>
                <button
                  className="mt-4 inline-block text-black underline"
                  onClick={handleAboutUs}
                >
                  See more
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
};

export default LandingPage;