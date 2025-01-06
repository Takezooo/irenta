import React, { useContext, useState, useEffect } from "react";

import { AuthContext } from "../global/contexts/AuthContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { fetchUserData } from "../global/api/Users";
import { GetToken } from "../global/utils/Token";
import { useNavigate } from "react-router-dom";

import Topbar from "../components/global/Topbar";

const ViewProfile = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate(); // Hook for navigation
  const [userProfile, setUserProfile] = useState({
    info: {
      firstName: "",
      lastName: "",
      profile: { link: "" },
      birthDate: "",
      gender: "",
      phoneNumber: "",
      userType: "",
      address: {
        houseNumber: "",
        street: "",
        city: "",
        zip: "",
      },
    },
    credentials: {
      username: "",
      email: "",
    },
  });

  const storedToken = GetToken();

  useEffect(() => {
    const fetchUser = async () => {
      if (user?.id) {
        try {
          const user_data = await fetchUserData(user.id, storedToken);
          setUserProfile(user_data);
        } catch (err) {
          console.error("Failed to fetch user data:", err);
        }
      }
    };

    fetchUser();
  }, [user, storedToken]);

  return (
    <div>
      <Topbar />
      <div
        className={`min-h-screen pt-28 lg:pt-16 ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
        }`}
      >
        <div className="w-full lg:w-3/4 mx-auto p-6 space-y-6">
          {user ? (
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
                  <button
                    onClick={() => navigate("/edit-profile")}
                    className="w-full mt-4 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
                  >
                    Edit Profile
                  </button>
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
                      {user?.bio || "No bio provided"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
