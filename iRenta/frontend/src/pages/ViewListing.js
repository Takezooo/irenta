import React, { useState, useEffect, useContext } from "react";
import Topbar from "../components/global/Topbar";
import { AiOutlineClose, AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useNavigate } from "react-router-dom"; // Import React Router hook
import RequestOcularVisit from "../components/Listing/RequestOcularVisit";
import { Footer } from "../components/global/Footer";
import { AuthContext } from "../global/contexts/AuthContext";
import { ThemeContext } from "../contexts/ThemeContext"; // Import ThemeContext
import { useProperty } from "../global/contexts/PropertyContext";
import { ChatDropdownContext } from "../global/contexts/ChatDropdownContext";
import { GetToken } from "../global/utils/Token";
import { getOrCreateChat } from "../global/api/Chats";
import { scheduleOcularVisit, checkVisitRequest } from "../global/api/Ocular";
import { fetchUserData, fetchOwnerData, toggleLike } from "../global/api/Users";
import { createReservation } from "../global/api/Reservations";

export const ViewListing = () => {
  const [showOcularPopup, setShowOcularPopup] = useState(false);
  const [location, setLocation] = useState("Bacoor");
  const [ownerData, setOwnerData] = useState([]);
  const [hasRequestedVisit, setHasRequestedVisit] = useState(false);
  const { selectedProperty } = useProperty();
  const { setChatRoomOpen, setSelectedChatId, setSelectedUserId } =
    useContext(ChatDropdownContext);
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext); // Use ThemeContext
  const navigate = useNavigate();
  const authToken = GetToken();
  const [likedListings, setLikedListings] = useState([]);

  // Fetch user's liked listings on page load
  useEffect(() => {
    if (user) {
      const fetchUserLikes = async () => {
        try {
          const updatedUser = await fetchUserData(user?.id, authToken); // Fetch user's liked listings from backend
          setLikedListings(updatedUser.likedListings || []);
        } catch (error) {
          console.error("Error fetching liked listings:", error);
        }
      };
      fetchUserLikes();
    } else {
      setLikedListings([]);
    }
  }, [user, authToken]);

  useEffect(() => {
    const fetchPropOwnerData = async () => {
      if (!selectedProperty?.userId) {
        return;
      }
      try {
        const owner = await fetchOwnerData(selectedProperty?.userId);
        setOwnerData(owner);
      } catch (error) {
        console.error("Error fetching property owner data:", error);
      }
    };
    fetchPropOwnerData();
  }, [selectedProperty]);

  // Check if the seeker has requested a visit for this listing
  useEffect(() => {
    const checkSeekerVisitRequest = async () => {
      if (selectedProperty?._id && user) {
        try {
          const result = await checkVisitRequest(selectedProperty._id, user.id);
          setHasRequestedVisit(result.hasRequestedVisit);
        } catch (error) {
          console.error("Error checking visit request status:", error);
        }
      }
    };
    checkSeekerVisitRequest();
  }, [selectedProperty, user]);

  const handleLikeToggle = async (listings) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await toggleLike(listings); // Call API to toggle like
      const updatedUser = await fetchUserData(user?.id, authToken); // Fetch updated liked listings
      if (updatedUser?.likedListings) {
        setLikedListings(updatedUser.likedListings); // Update local state
      } else {
        console.warn("Liked listings not found in updated user data");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleClose = () => {
    navigate(-1 || "/"); // Go back to the previous page if no history
  };

  const handleChatClick = async (ownerId, listingId) => {
    try {
      const chat = await getOrCreateChat(ownerId, listingId);

      if (chat) {
        setSelectedChatId(chat._id); // Set the selected chat in ChatDropdown
        const otherParticipant = chat.participants.find(
          (p) => p._id !== user?.id
        );
        setSelectedUserId(otherParticipant?._id || null);
        setChatRoomOpen(true); // Open the chat room
      }
    } catch (error) {
      console.error("Error handling chat click:", error);
    }
  };

  const handleRequestVisit = async (selectedDate, selectedTime) => {
    const propertyId = selectedProperty?._id;

    if (!propertyId || !selectedDate || !selectedTime) {
      alert("Please select a date and time for the visit.");
      return;
    }

    try {
      await scheduleOcularVisit(propertyId, selectedDate, selectedTime);
      setHasRequestedVisit(true); // This triggers a re-render
      alert("Request visit scheduled!");
    } catch (err) {
      console.error(
        "Failed to request visit:",
        err.response?.data?.message || err.message
      );
    }
  };

  const handleReserveListing = async () => {
    navigate('/request-reservation');
  };

  useEffect(() => {
    setHasRequestedVisit(hasRequestedVisit); // Rebind state directly to force evaluation
  }, [hasRequestedVisit]);

  const handleOpenPopup = () => {
    if (!user) {
      navigate("/login");
    }
    setShowOcularPopup(true); // Open the popup
  };

  const closePopup = () => {
    setShowOcularPopup(false);
  };

  return (
    <div
      className={`min-h-screen font-sans ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <Topbar />

      <div
        className={`px-4 mt-16 sm:px-6 lg:px-12 xl:px-36 py-8 ${
          darkMode ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className={`fixed right-10 rounded-full p-2 transition ${
            darkMode
              ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
              : "bg-gray-200 text-gray-400 hover:bg-gray-400 hover:text-gray-600"
          }`}
        >
          <AiOutlineClose className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center gap-6">
          {/* Image Gallery */}
          <div className="w-full lg:w-3/4">
            <div className="relative flex flex-col lg:flex-row h-auto lg:h-96 gap-4">
              {/* Main Image */}
              <div
                className={`w-full lg:w-1/2 h-64 lg:h-full rounded-lg shadow-md flex items-center justify-center ${
                  darkMode ? "bg-gray-800" : "bg-gray-200"
                }`}
              >
                <span
                  className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  Main Image
                </span>
              </div>
              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 lg:grid-cols-2 gap-4 w-full lg:w-1/2">
                {Array(4)
                  .fill(null)
                  .map((_, index) => (
                    <div
                      key={index}
                      className={`h-24 lg:h-full rounded-md ${
                        darkMode ? "bg-gray-700" : "bg-gray-300"
                      }`}
                    ></div>
                  ))}
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="flex flex-col lg:flex-row gap-6 w-full lg:w-3/4">
            {/* Details Section */}
            <div
              className={`flex flex-col lg:flex-row gap-6 w-full ${
                darkMode ? "bg-gray-900" : "bg-gray-100"
              }`}
            >
              <div
                className={`w-full rounded-lg shadow-md p-4 ${
                  darkMode
                    ? "bg-gray-800 text-gray-200"
                    : "bg-white text-gray-800"
                }`}
              >
                {/* Details Section */}
                <div className="w-full flex flex-col">
                  <div
                    className={`border-b pb-4 mb-4 ${
                      darkMode ? "border-gray-700" : "border-gray-300"
                    }`}
                  >
                    <h2
                      className={`text-xl sm:text-2xl font-bold ${
                        darkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      {selectedProperty?.title}
                    </h2>
                    <p
                      className={`mt-2 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {selectedProperty?.address?.city}
                    </p>
                  </div>

                  <div
                    className={`border-b pb-4 mb-2 ${
                      darkMode ? "border-gray-700" : "border-gray-300"
                    }`}
                  >
                    <h3 className="text-lg sm:text-2xl font-semibold mb-4">
                      ₱4,000 / head / month
                    </h3>
                    <div className="w-full flex justify-between flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                      <div className="space-x-2">
                        <button
                          onClick={handleOpenPopup}
                          disabled={hasRequestedVisit} // Disable based on visit request status
                          className={`${
                            !hasRequestedVisit
                              ? "bg-blue-500 text-white hover:bg-blue-600"
                              : `${
                                  darkMode
                                    ? "bg-gray-700 text-gray-500"
                                    : "bg-gray-300 text-gray-600"
                                } cursor-not-allowed`
                          } px-4 py-2 rounded-full`}
                        >
                          Request Visit
                        </button>
                        <button
                          disabled={!hasRequestedVisit} // Disable based on visit request status
                          onClick={handleReserveListing}
                          className={`${
                            hasRequestedVisit
                              ? "bg-blue-500 text-white hover:bg-blue-600"
                              : `${
                                  darkMode
                                    ? "bg-gray-700 text-gray-500"
                                    : "bg-gray-300 text-gray-600"
                                } cursor-not-allowed`
                          } px-4 py-2 rounded-full`}
                        >
                          Reserve Listing
                        </button>
                      </div>
                      <button
                        onClick={() => handleLikeToggle(selectedProperty?._id)}
                        className="flex items-center gap-1"
                      >
                        {likedListings.includes(selectedProperty?._id) ? (
                          <>
                            <AiFillHeart size={20} className="text-red-500" />
                            <p>Liked</p>
                          </>
                        ) : (
                          <>
                            <AiOutlineHeart size={20} />
                            <p>Like</p>
                          </>
                        )}
                      </button>
                    </div>
                    <p
                      className={`text-sm mt-2 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Note: 10% of the principal amount is required to book.
                    </p>
                  </div>

                  {/* Amenities and Payment Terms */}
                  <div
                    className={`mt-2 grid grid-cols-1 sm:grid-cols-2 gap-6 border rounded-lg p-4 ${
                      darkMode ? "border-gray-700" : "border-gray-300"
                    }`}
                  >
                    <div>
                      <h4
                        className={`font-semibold mb-2 ${
                          darkMode ? "text-gray-300" : "text-gray-800"
                        }`}
                      >
                        Amenities & Inclusions
                      </h4>
                      <ul
                        className={`space-y-1 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        <li>Fully Furnished</li>
                        <li>6 Bed and Bedframe</li>
                        <li>Aircon</li>
                        <li>WiFi / Internet</li>
                        <li>Electricity Bill</li>
                        <li>Water Bill</li>
                      </ul>
                    </div>
                    <div>
                      <h4
                        className={`font-semibold mb-2 ${
                          darkMode ? "text-gray-300" : "text-gray-800"
                        }`}
                      >
                        Payment Terms
                      </h4>
                      <ul
                        className={`space-y-1 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        <li>Advance Payment: 1 month</li>
                        <li>Lease Term: 6 months</li>
                        <li>Pay Period: Monthly</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nearby Establishments */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6">
              <div
                className={`rounded-lg shadow-md p-4 ${
                  darkMode
                    ? "bg-gray-800 text-gray-300"
                    : "bg-white text-gray-800"
                }`}
              >
                <h2 className="text-lg font-semibold mb-4">
                  Nearby Establishments
                </h2>
                <ul
                  className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  <li>Jollibee</li>
                  <li>Simbahan</li>
                  <li>SM</li>
                  {/* Add more items here */}
                </ul>
              </div>

              {/* Property Owner */}
              <div
                className={`rounded-lg shadow-md border p-6 ${
                  darkMode
                    ? "bg-gray-800 text-gray-300 border-gray-700"
                    : "bg-white text-gray-800 border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`h-24 w-24 rounded-full flex items-center justify-center overflow-hidden mb-4 ${
                      darkMode ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  >
                    <img
                      src={
                        ownerData?.info?.profile?.link ||
                        "https://via.placeholder.com/150"
                      }
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-bold">
                    {ownerData?.info?.firstName}{" "}
                    {ownerData?.info?.lastName || "Owner"}
                  </h3>
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    } mt-1`}
                  >
                    Property Owner
                  </p>
                </div>
                <button
                  className={`mt-6 w-full font-medium py-2 rounded-md shadow-md ${
                    darkMode
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                  onClick={() =>
                    handleChatClick(
                      selectedProperty.userId,
                      selectedProperty._id
                    )
                  }
                >
                  Send a message
                </button>
              </div>
            </div>
          </div>

          {/* Pinned Location */}
          <div
            className={`w-full lg:w-3/4 rounded-lg shadow-md p-4 ${
              darkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-800"
            }`}
          >
            <h2 className="text-lg font-semibold mb-4">Pinned Location</h2>
            <div className="w-full h-64 sm:h-80 lg:h-96 rounded overflow-hidden">
              <iframe
                className="w-full h-full border-none"
                src={`https://maps.google.com/maps?q=${location}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                allowFullScreen
                title="Pinned Location Map"
              ></iframe>
            </div>
          </div>

          {/* Reviews Section */}
          <div
            className={`w-full lg:w-3/4 rounded-lg shadow-md p-4 ${
              darkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-800"
            }`}
          >
            <h2 className="text-lg font-semibold mb-4">Reviews</h2>
            <div className="text-blue-500 text-xl font-bold">
              8.9/10 Excellent
            </div>
            <blockquote
              className={`italic mt-2 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              “Love this website! User-friendly interface and detailed listings
              made my dorm search stress-free.”
            </blockquote>
          </div>
        </div>
      </div>

      {showOcularPopup && (
        <RequestOcularVisit
          propertyDetails={selectedProperty}
          onClose={closePopup}
          onRequestVisit={handleRequestVisit}
        />
      )}

      <Footer />
    </div>
  );
};

export default ViewListing;
