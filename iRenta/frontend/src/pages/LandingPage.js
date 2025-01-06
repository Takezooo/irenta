import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

import Topbar from "../components/global/Topbar.js";
import Sidebar from "../components/global/Sidebar.js";
import { Footer } from "../components/global/Footer.js";

import { AuthContext } from "../global/contexts/AuthContext.js";
import { ThemeContext } from "../contexts/ThemeContext.js";
import { useProperty } from "../global/contexts/PropertyContext";
import { toggleLike } from "../global/api/Users.js";
import { fetchListings } from "../global/api/Listings.js";

const LandingPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext); // Access dark mode context
  const { setSelectedProperty } = useProperty();
  const [likedListings, setLikedListings] = useState([]);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchListings();
      setListings(data); // assuming fetchListings returns an array
    };
    fetchData();
  }, []);

  const handleBrowseListing = () => navigate("/browse-listing");
  const handleAboutUs = () => navigate("/about-us");

  const handleViewProperty = (listing) => {
    setSelectedProperty(listing);
    navigate(`/${listing._id}`);
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
          <div className="pt-8">
            <div className="mx-auto flex align-center flex-col rounded-xl mt-24 lg:mt-16 w-[90%]">
              <div className="flex flex-row w-full items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Properties</h2>
                <button
                  onClick={handleBrowseListing}
                  className={`underline ${
                    darkMode ? "text-gray-300 hover:text-gray-200" : "text-black"
                  }`}
                >
                  See more
                </button>
              </div>

              <div className="flex flex-col flex-grow overflow-y-auto">
                <div
                  ref={scrollContainerRef}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4"
                >
                  {listings.map((listing) => (
                    <div
                      key={listing._id}
                      className={`flex-shrink-0 rounded-lg shadow-md border overflow-hidden ${
                        darkMode
                          ? "bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-gray-700"
                          : "bg-white border-gray-300 hover:shadow-lg"
                      }`}
                      onClick={() => handleViewProperty(listing)}
                    >
                      <div className="relative flex-shrink-0 h-48 md:h-56">
                        <img
                          src={listing.images?.[0]?.link || "/placeholder-image.jpg"}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleLikeToggle(listing._id)}
                          className={`absolute top-2 right-2 rounded-full p-2 shadow-md ${
                            darkMode
                              ? "bg-gray-700 text-gray-300"
                              : "bg-white text-gray-600"
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
                  ))}
                </div>
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
              <p className="text-m mb-[20px]">Please choose an option to continue.</p>
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
                          src={listing.images?.[0]?.link || "/placeholder-image.jpg"}
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
                        <h3 className="text-lg font-semibold truncate">{listing.title}</h3>
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
        </>
      )}

      <div className="my-36 bg-gradient-to-r from-blue-950 to-gray-900 text-white flex items-center justify-evenly py-14 px-24 relative">
        <div className="h-28 w-28 p-2 bg-gray-100 rounded-lg flex items-center justify-center shadow-md mr-6">
          <img
            src="../assets/images/iRenta.png"
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
            onClick={handleAboutUs}>
              See more
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;
