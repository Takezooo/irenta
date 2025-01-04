import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GetToken } from "../../global/utils/Token.js";
import { fetchOwnerListings, deleteList } from "../../global/api/Listings.js";
import { fetchUserData } from "../../global/api/Users.js";
import { AuthContext } from "../../global/contexts/AuthContext.js";
import { ThemeContext } from "../../contexts/ThemeContext.js";

export const PropertyListing = () => {
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedListings, setExpandedListings] = useState({});
  const [userProfile, setUserProfile] = useState({
    info: {
      firstName: "",
      lastName: "",
      profile: { link: "" },
    },
  });

  const { darkMode } = useContext(ThemeContext); // Access dark mode context
  const navigate = useNavigate();
  const storedToken = GetToken();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchUser = async () => {
      if (user?.id) {
        try {
          const user_data = await fetchUserData(user.id, storedToken);
          setUserProfile(user_data);
        } catch (err) {
          console.error("Failed to fetch user data:", err);
          setError("Failed to fetch user data");
        }
      }
    };

    const fetchListings = async () => {
      try {
        const data = await fetchOwnerListings();
        setListings(data);
        console.log(data);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
        setError("Failed to fetch listings");
      }
    };

    fetchListings();
    fetchUser();
  }, [user, storedToken]);

  const handleDelete = async (id) => {
    try {
      deleteList(id);
      setListings(listings.filter((listing) => listing._id !== id));
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting listing");
    }
  };

  const openModal = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setDeleteId(null);
  };

  const toggleSeeMore = (id) => {
    setExpandedListings((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div
      className={`pt-20 pb-4 mx-2 flex flex-col xl:flex-row-reverse ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-200 text-black"
      }`}
    >
      {/* Right Side: Profile */}
      <div className="justify-end w-full xl:w-1/4 pb-4 xl:px-4">
        <button
          className={`w-full font-medium py-4 rounded-md shadow-md ${
            darkMode
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-blue-500 text-white hover:bg-blue-600"
          } sm:hidden`}
          onClick={() => {
            navigate("/create-list");
          }}
        >
          + Create new listing
        </button>
        <div
          className={`hidden sm:block rounded-lg shadow-md border p-6 ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
          }`}
        >
          <div className="flex flex-col items-center">
            <div
              className={`h-24 w-24 rounded-full flex items-center justify-center overflow-hidden mb-4 ${
                darkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <img
                src={userProfile.info.profile.link}
                alt="Profile Pic"
                className="h-full w-full object-cover"
              />
            </div>
            <h3
              className={`text-lg font-bold ${
                darkMode ? "text-gray-300" : "text-gray-800"
              }`}
            >
              {userProfile.info.firstName}
            </h3>
            <p
              className={`text-sm mt-1 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {listings.length} active listings
            </p>
          </div>
          <button
            className={`mt-6 w-full font-medium py-2 rounded-md shadow-md ${
              darkMode
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-500 text-white hover:bg-blue-600"
            } sm:block hidden`}
            onClick={() => {
              navigate("/create-list");
            }}
          >
            + Create new listing
          </button>
        </div>
      </div>

      {/* Left Side: Listings */}
      <div className="w-full h-full flex-1 overflow-hidden">
        <div className="mb-4 flex justify-center items-center">
          <div
            className={`rounded-lg shadow-md p-4 border w-full xl:w-3/4 ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
            }`}
          >
            <h1
              className={`font-bold text-xl ${
                darkMode ? "text-blue-400" : "text-blue-600"
              }`}
            >
              Your Listings
            </h1>
          </div>
        </div>
        {error && (
          <div
            className={`${
              darkMode ? "text-red-400" : "text-red-500"
            } text-center`}
          >
            {error}
          </div>
        )}
        <div className="flex flex-col">
          {listings.map((listing) => (
            <div
              key={listing._id}
              className={`mb-8 flex justify-center items-center ${
                darkMode ? "bg-gray-900" : "bg-gray-200"
              }`}
            >
              <div
                className={`rounded-lg shadow-md p-6 border w-full xl:w-3/4 ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-300"
                }`}
              >
                <div className="flex flex-col xl:flex-row gap-6">
                  <div className="col-span-2">
                    <div className="relative mx-auto">
                      <div
                        className={`h-60 sm:h-74 rounded-lg shadow-md mb-4 flex items-center justify-center ${
                          darkMode ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      >
                        <img
                          src={
                            listing.images?.[0]?.link || "/placeholder-image.jpg"
                          }
                          alt={listing.title}
                          className="h-full w-full object-cover rounded-lg"
                        />                        
                        {/* <span className="text-gray-500">Main Image</span> */}
                        </div>
                        <div className="flex justify-evenly space-x-2 overflow-x-auto scrollbar-hide">
                          <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-300 rounded-md">
  
  
                          </div>
                          <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-300 rounded-md"></div>
                          <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-300 rounded-md"></div>
                          <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-300 rounded-md"></div>
                        </div>
                    </div>
                  </div>
                  <div className="col-span-3 flex flex-col justify-between">
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                      <h2
                        className={`text-lg font-semibold ${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      >
                        {listing.title}
                      </h2>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">
                        ₱4,000 /head /month
                      </h3>
                      <p
                        className={`mt-1 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Ermita, Manila
                      </p>
                    </div>
                    <div
                      className={`mt-6 rounded-lg p-4 ${
                        darkMode
                          ? "border-gray-700 bg-gray-700 text-gray-300"
                          : "border-gray-300 bg-white text-gray-600"
                      }`}
                    >
                      <h4 className="font-semibold mb-2">
                        {listing.description}
                      </h4>
                      {expandedListings[listing._id] ||
                      window.innerWidth > 1280 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-2">
                              Amenities
                            </h4>
                            <ul className="space-y-1">
                              <li>Fully Furnished</li>
                              <li>6 Bed and Bedframe</li>
                              <li>Aircon</li>
                              <li>WiFi / Internet</li>
                              <li>Electricity Bill</li>
                              <li>Water Bill</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">
                              Payment Terms
                            </h4>
                            <ul className="space-y-1">
                              <li>Advance Payment: 1 month</li>
                              <li>Lease Term: 6 months</li>
                              <li>Pay Period: Monthly</li>
                            </ul>
                          </div>
                        </div>
                      ) : null}
                      {window.innerWidth < 1280 && (
                        <button
                          className={`mt-4 underline ${
                            darkMode ? "text-blue-400" : "text-blue-600"
                          }`}
                          onClick={() => toggleSeeMore(listing._id)}
                        >
                          {expandedListings[listing._id]
                            ? "See Less"
                            : "See More"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-4">
                  <button
                    className={`px-4 py-2 rounded-md shadow ${
                      darkMode
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                    onClick={() => openModal(listing._id)}
                  >
                    Remove
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md shadow ${
                      darkMode
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    onClick={() => navigate("/edit-list")}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {showModal && (
          <>
            <div
              className={`fixed inset-0 ${
                darkMode ? "bg-gray-900 bg-opacity-70" : "bg-gray-600 bg-opacity-50"
              } z-40`}
            ></div>
            <div className="fixed inset-0 flex justify-center items-center z-50">
              <div
                className={`p-6 rounded-lg shadow-lg ${
                  darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
                }`}
              >
                <h2 className="text-lg font-semibold mb-4">Remove listing</h2>
                <p>Are you sure you want to remove this listing?</p>
                <div className="flex justify-end gap-4 mt-4">
                  <button
                    className={`px-4 py-2 rounded-md shadow ${
                      darkMode
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                    onClick={() => handleDelete(deleteId)}
                  >
                    Yes, Remove
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md shadow ${
                      darkMode
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
