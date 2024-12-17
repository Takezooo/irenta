import React, { useState, useContext } from "react";
import Topbar from "../components/global/Topbar";
import { AiOutlineClose } from "react-icons/ai";
import { useNavigate, useLocation } from "react-router-dom"; // Import React Router hook
import RequestOcularVisit from "../components/Listing/RequestOcularVisit";
import { Footer } from "../components/global/Footer";
import { AuthContext } from "../global/contexts/AuthContext";
import { getOrCreateChat } from "../api/Chats";

export const ViewListing = () => {
 // const [location, setLocation] = useState("Bacoor"); //temporary
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const handleClose = () => {
    navigate(-1 || "/"); // Go back to the previous page if no history
  };

  const navigate = useNavigate(); // React Router navigation hook

  const { listings } = location.state || {}; 

  const handleRequestVisit = () => {
    navigate("/request-ocular"); // Route to the Request Visit Page
  };

  const handleChatClick = async (ownerId, listingId) => {
    console.log("Owner ID (recipientId):", ownerId); // Debug
    console.log("Listing ID:", listingId);          // Debug
  
    try {
      const chat = await getOrCreateChat(ownerId, listingId);
      console.log("Chat created or fetched:", chat);
      navigate(`/chat/${chat._id}`, { state: { userId: user.id } });
    } catch (err) {
      console.error("Failed to create or navigate to chat", err);
    }
  };

  return (
    <div>
      <Topbar />

      <div className="px-4 mt-16 sm:px-6 lg:px-12 xl:px-36 py-8 bg-gray-100 min-h-screen font-sans overflow-x-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="fixed right-10 bg-gray-200 rounded-full p-2 text-gray-400 hover:bg-gray-400 hover:text-gray-600 transition"
        >
          <AiOutlineClose className="w-6 h-6" />
        </button>

        {/* Image Gallery and Title Section */}
        <div className="flex flex-col items-center gap-8">
          <div className="bg-white rounded-lg shadow-md p-6 border w-full lg:w-3/4">
            <div className="flex flex-col xl:flex-row gap-6">
              {/* Image Gallery */}
              <div className="w-full xl:w-1/2">
                <div className="relative">
                  <div className="h-60 sm:h-80 bg-gray-200 rounded-lg shadow-md mb-4 flex items-center justify-center">
                    <span className="text-gray-500">Main Image</span>
                  </div>
                  {/* Thumbnail Images */}
                  <div className="flex justify-between space-x-2 overflow-x-auto">
                    <div className="h-16 w-20 sm:h-20 sm:w-24 bg-gray-300 rounded-md"></div>
                    <div className="h-16 w-20 sm:h-20 sm:w-24 bg-gray-300 rounded-md"></div>
                    <div className="h-16 w-20 sm:h-20 sm:w-24 bg-gray-300 rounded-md"></div>
                    <div className="h-16 w-20 sm:h-20 sm:w-24 bg-gray-300 rounded-md"></div>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="w-full xl:w-1/2 flex flex-col">
                <div className="border-b pb-4 mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-blue-600">
                    {listings?.title}
                  </h2>
                  <p className="text-gray-600 mt-2">{listings?.address?.city}</p>
                </div>

                <div className="border-b pb-4 mb-2">
                  <h3 className="text-lg sm:text-2xl font-semibold mb-4">
                    ₱4,000 / head / month
                  </h3>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <button
                      onClick={handleRequestVisit}
                      className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                    >
                      Request Visit
                    </button>
                    <button className="border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-100">
                      Add to Wishlist
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    Note: 10% of the principal amount is required to book.
                  </p>
                </div>

                {/* Amenities and Payment Terms */}
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-6 border border-gray-300 rounded-lg p-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Amenities & Inclusions
                    </h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>Fully Furnished</li>
                      <li>6 Bed and Bedframe</li>
                      <li>Aircon</li>
                      <li>WiFi / Internet</li>
                      <li>Electricity Bill</li>
                      <li>Water Bill</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Payment Terms
                    </h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>Advance Payment: 1 month</li>
                      <li>Lease Term: 6 months</li>
                      <li>Pay Period: Monthly</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 bg-gray-100 w-full lg:w-3/4">
            {/* Pinned Location Section */}
            <div className="w-full lg:w-2/3 bg-white rounded-lg shadow-md p-4">
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

            {/* Details Section */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6">
              {/* Nearby Establishments Section */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-4">
                  Nearby Establishments
                </h2>
                <ul className="text-gray-600">
                  <li>Jollibee</li>
                  <li>Simbahan</li>
                  <li>SM</li>
                  {/* Add more items here */}
                </ul>
              </div>

              {/* Property Owner Messaging Section */}
              <div className="sm:block bg-white rounded-lg shadow-md border p-6 h-full">
                {/* Hide on smaller screens (less than sm) */}
                <div className="flex flex-col items-center">
                  {/* Profile Picture */}
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
                    {/* <span className="text-gray-500">Profile Pic</span> */}
                    <img
                      src=""
                      alt="Girl in a jacket"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {/* User Info */}
                  <h3 className="text-lg font-bold text-gray-800">
                    Property Owner Name
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Property Owner
                  </p>
                </div>
                {/* Create New Listing Button (Visible only on larger screens) */}
                <button className="mt-6 w-full bg-blue-500 text-white font-medium py-2 rounded-md shadow-md hover:bg-blue-600 sm:block"
                    onClick={() => handleChatClick(listings.userId, listings._id)}>
                  Send a message
                </button>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className= "w-full lg:w-3/4 bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Reviews</h2>
            <div className="text-blue-500 text-xl font-bold">
              8.9/10 Excellent
            </div>
            <blockquote className="text-gray-600 italic mt-2">
              “Love this website! User-friendly interface and detailed
              listings made my dorm search stress-free.”
            </blockquote>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ViewListing;
