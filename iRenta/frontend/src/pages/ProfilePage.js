import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUserData } from "../global/api/Users.js"; // Adjust path if needed
import { fetchSpecificUserListings } from "../global/api/Listings.js";
import { GetToken } from "../global/utils/Token";
import Topbar from "../components/global/Topbar.js";
import { ThemeContext } from "../contexts/ThemeContext";
// import React from "react";
import { Footer } from "../components/global/Footer.js";
import { useProperty } from "../global/contexts/PropertyContext";

const ProfilePage = () => {
  const { darkMode } = useContext(ThemeContext);
  const { id } = useParams(); // Get user ID from URL
  const [userProfile, setUserProfile] = useState(null);
  const [listings, setListings] = useState([]); // Store user listings
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedListings, setExpandedListings] = useState({});
  const { setSelectedProperty } = useProperty();
  
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = GetToken();

    // Fetch user profile
    fetchUserData(id, authToken)
      .then((data) => {
        if (data) {
          setUserProfile(data);
        }
      })
      .finally(() => setLoading(false));

    // Fetch listings by the user
    fetchSpecificUserListings(id).then((data) => {
      if (data) {
        setListings(data);
      }
    });
  }, [id]);

  const toggleSeeMore = (id) => {
    setExpandedListings((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleViewProperty = (listing) => {
    setSelectedProperty(listing);
    navigate(`/${listing._id}`);
  };

  console.log(id);
  if (loading) return <p>Loading...</p>;
  if (!userProfile) return <p>User not found.</p>;

  return (
    // <div>
    //   <Topbar />
    //   <h1>{profile.credentials.username}'s Profile</h1>
    //   <p>Email: {profile.email}</p>
    //   <h2>Listings by {profile.name}</h2>
    //   {listings.length > 0 ? (
    //     <ul>
    //       {listings.map((listing) => (
    //         <li key={listing.id}>{listing.title}</li>
    //       ))}
    //     </ul>
    //   ) : (
    //     <p>No listings found.</p>
    //   )}
    // </div>
    <div>
      <Topbar />
      <div
        className={`min-h-screen pt-28 lg:pt-16 ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
        }`}
      >
        <div className="w-full lg:w-3/4 mx-auto p-6 space-y-6">
          {userProfile ? (
            <>
              {/* Top Section */}
              <div
                className={`flex flex-col md:flex-row items-center md:items-center p-6 rounded-lg shadow ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border border-gray-200"
                }`}
              >
                {/* Profile Photo */}
                <div className="flex-shrink-0 flex justify-center items-center">
                  <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden border bg-gray-200 flex items-center justify-center">
                    <img
                      src={
                        userProfile?.info?.profile.link ||
                        "https://via.placeholder.com/150"
                      }
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                {/* User Info */}
                <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left flex flex-col items-center md:items-start">
                  <h1 className="text-2xl font-bold">
                    {userProfile?.info?.firstName} {userProfile?.info?.lastName}
                  </h1>
                  <p className="text-gray-500">
                    @{userProfile?.credentials?.username}
                  </p>
                  <p className="text-gray-500">{userProfile?.info?.userType}</p>
                  {/* <button
                    onClick={() => navigate("/edit-profile")}
                    className="w-full mt-4 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
                  >
                    Edit Profile
                  </button> */}
                </div>
              </div>

              {/* Bottom Section */}
              <div
                className={`p-6 rounded-lg shadow ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border border-gray-200"
                }`}
              >
                <h2 className="text-xl font-bold mb-6">Your Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* First Row */}
                  <div>
                    <p className="font-medium">First Name:</p>
                    <p className="bg-gray-200 dark:bg-gray-700 p-2 rounded-md">
                      {userProfile?.info?.firstName}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Last Name:</p>
                    <p className="bg-gray-200 dark:bg-gray-700 p-2 rounded-md">
                      {userProfile?.info?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Email:</p>
                    <p className="bg-gray-200 dark:bg-gray-700 p-2 rounded-md">
                      {userProfile?.credentials?.email}
                    </p>
                  </div>

                  {/* Second Row */}
                  <div>
                    <p className="font-medium">Phone:</p>
                    <p className="bg-gray-200 dark:bg-gray-700 p-2 rounded-md">
                      {userProfile?.info?.phoneNumber}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Birthdate:</p>
                    <p className="bg-gray-200 dark:bg-gray-700 p-2 rounded-md">
                      {userProfile?.info?.birthDate}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Gender:</p>
                    <p className="bg-gray-200 dark:bg-gray-700 p-2 rounded-md">
                      {userProfile?.info?.gender}
                    </p>
                  </div>

                  {/* Third Row */}
                  <div className="col-span-1 md:col-span-2 lg:col-span-3">
                    <p className="font-medium">Address:</p>
                    <p className="bg-gray-200 dark:bg-gray-700 p-2 rounded-md">
                      {userProfile?.info?.address?.houseNumber},{" "}
                      {userProfile?.info?.address?.street},{" "}
                      {userProfile?.info?.address?.city},{" "}
                      {userProfile?.info?.address?.zip}
                    </p>
                  </div>

                  {/* Fourth Row */}
                  <div className="col-span-1 md:col-span-2 lg:col-span-3">
                    <p className="font-medium">Bio:</p>
                    <p className="bg-gray-200 dark:bg-gray-700 p-4 rounded-md h-24 overflow-auto">
                      {userProfile?.bio || "No bio provided"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <></>
          )}
          <div className="w-full h-full flex-1 overflow-hidden">
            <div className="mb-4 flex justify-center items-center">
              <div
                className={`rounded-lg shadow-md p-4 border w-full xl:w-full ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-300"
                }`}
              >
                <h1
                  className={`font-bold text-xl ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  Current Listings
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
                  onClick={() => handleViewProperty(listing)}
                  className={`mb-8 flex justify-center items-center ${
                    darkMode ? "bg-gray-900" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`rounded-lg shadow-md p-6 border w-full xl:w-full ${
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
                                listing.images?.[0]?.link ||
                                "/placeholder-image.jpg"
                              }
                              alt={listing.title}
                              className="h-full w-full object-cover rounded-lg"
                            />
                            {/* <span className="text-gray-500">Main Image</span> */}
                          </div>
                          <div className="flex justify-evenly space-x-2 overflow-x-auto scrollbar-hide">
                            {listing.images?.slice(0, 4).map((image, index) => (
                              <div
                                key={index}
                                className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-300 rounded-md"
                              >
                                <img
                                  src={image.link || "/placeholder-image.jpg"}
                                  alt={`${listing.title || "Listing Image"} - ${
                                    index + 1
                                  }`}
                                  className="h-full w-full object-cover rounded-md"
                                />
                              </div>
                            ))}

                            {/* Add empty divs if images are less than 4 */}
                            {Array.from({
                              length: 4 - (listing.images?.length || 0),
                            }).map((_, index) => (
                              <div
                                key={`placeholder-${index}`}
                                className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-300 rounded-md"
                              ></div>
                            ))}
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default ProfilePage;
