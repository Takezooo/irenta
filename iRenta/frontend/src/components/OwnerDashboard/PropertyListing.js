import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GetToken } from "../../global/utils/Token.js"; // Import utilities
import { fetchOwnerListings, deleteList } from "../../api/Listings.js";
import { fetchUserData } from "../../api/Users.js";
import { AuthContext } from "../../global/contexts/AuthContext.js";

export const PropertyListing = () => {
  const [listings, setListings] = useState([]); // State to store listings
  const [error, setError] = useState(null); // State for error handling
  const [showModal, setShowModal] = useState(false); // State for showing the modal
  const [deleteId, setDeleteId] = useState(null); // ID of the listing to delete
  const [expandedListings, setExpandedListings] = useState({}); // State to track expanded listings
  const [userProfile, setUserProfile] = useState({
    info: {
      firstName: "",
      lastName: "",
      profile: { link: "" },
    },
  });

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
      } catch (err) {
        console.error("Failed to fetch listings:", err);
        setError("Failed to fetch listings");
      }
    };

    fetchListings();
    fetchUser();
  }, [user, storedToken]); // Only re-run when `user` or `storedToken` changes

  const handleDelete = async (id) => {
    try {
      // Call the delete endpoint
      deleteList(id);

      // Update the UI by removing the deleted listing
      setListings(listings.filter((listing) => listing._id !== id));
      setShowModal(false); // Close the modal
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
    <div className="pt-20 pb-4 mx-2 flex flex-col xl:flex-row-reverse">
      {/* Right Side: Profile */}
      <div className="justify-end w-full xl:w-1/4 pb-4 xl:px-4">
        {/* Show only on smaller screens (less than sm) */}
          <button className="w-full bg-blue-500 text-white font-medium py-4 rounded-md shadow-md hover:bg-blue-600 sm:hidden"
            onClick={() => {
              navigate("/create-list");
            }}
          >
            + Create new listing
          </button>
        <div className="hidden sm:block bg-white rounded-lg shadow-md border p-6">
          {/* Hide on smaller screens (less than sm) */}
          <div className="flex flex-col items-center">
            {/* Profile Picture */}
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
              {/* <span className="text-gray-500">Profile Pic</span> */}
              <img
                src={userProfile.info.profile.link}
                alt="Girl in a jacket"
                className="h-full w-full object-cover"
              />
            </div>
            {/* User Info */}
            <h3 className="text-lg font-bold text-gray-800">
              {userProfile.info.firstName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {listings.length} active listings
            </p>
          </div>
          {/* Create New Listing Button (Visible only on larger screens) */}
          <button className="mt-6 w-full bg-blue-500 text-white font-medium py-2 rounded-md shadow-md hover:bg-blue-600 sm:block hidden"
                      onClick={() => {
                        navigate("/create-list");
                      }}>
            + Create new listing
          </button>
        </div>
      </div>

      <div className="w-full h-full flex-1 overflow-hidden">
        <div className="mb-4 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-md p-4 border w-full xl:w-3/4">
            <h1 className="font-bold text-xl text-blue-600">Your listings</h1>
          </div>
        </div>
        {error && <div className="text-red-500">{error}</div>}{" "}
        {/* Display error if any */}
        <div className="flex flex-col">
          {listings.map((listing) => (
            <div
              key={listing._id}
              className="mb-8 flex justify-center items-center"
            >
              <div className="bg-white rounded-lg shadow-md p-6 border w-full xl:w-3/4">
                <div className="flex flex-col xl:flex-row gap-6">
                  <div className="col-span-2">
                    <div className="relative mx-auto">
                      <div className="h-60 sm:h-74 bg-gray-200 rounded-lg shadow-md mb-4 flex items-center justify-center">
                        <span className="text-gray-500">Main Image</span>
                      </div>
                      <div className="flex justify-evenly space-x-2 overflow-x-auto scrollbar-hide">
                        <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-300 rounded-md"></div>
                        <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-300 rounded-md"></div>
                        <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-300 rounded-md"></div>
                        <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-300 rounded-md"></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 flex flex-col justify-between">
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                      <h2 className="text-lg text-blue-600 font-semibold">
                        {listing.title}
                      </h2>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">
                        ₱4,000 /head /month
                      </h3>
                      <p className="text-gray-600 mt-1">Ermita, Manila</p>
                    </div>
                    <div className="mt-6 border border-gray-300 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">
                        {listing.description}
                      </h4>
                      {expandedListings[listing._id] ||
                      window.innerWidth > 1280 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">
                              Amenities
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
                      ) : null}
                      {window.innerWidth < 1280 && (
                        <button
                          className="mt-4 text-blue-500 underline"
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
                    className="bg-red-500 text-white px-4 py-2 rounded-md shadow hover:bg-red-600"
                    onClick={() => openModal(listing._id)} // Open the confirmation modal
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => {
                      navigate("/edit-list");
                    }}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md shadow hover:bg-gray-300">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {showModal && (
          <>
            {/* Remove listing confirmation */}
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40">
              <div className="fixed top-0 left-0 w-full h-20 bg-transparent z-50"></div>
            </div>

            <div className="fixed inset-0 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-lg font-semibold mb-4">Remove listing</h2>
                <p>Are you sure you want to remove this listing?</p>
                <div className="flex justify-end gap-4 mt-4">
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-md shadow hover:bg-red-600"
                    onClick={() => handleDelete(deleteId)}
                  >
                    Yes, Remove
                  </button>
                  <button
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md shadow hover:bg-gray-300"
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
