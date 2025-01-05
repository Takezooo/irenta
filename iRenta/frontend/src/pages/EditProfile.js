import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../global/contexts/AuthContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { fetchUserData } from "../global/api/Users";
import { GetToken } from "../global/utils/Token";
import Topbar from "../components/global/Topbar";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const { user } = useContext(AuthContext);
  const userId = user?.id;
  const { darkMode } = useContext(ThemeContext);
  const API_BASE_URL = "http://localhost:5000/api/users";
  const authToken = GetToken();
  const navigate = useNavigate(); // Hook for navigation

  const [userProfile, setUserProfile] = useState({
    info: {
      firstName: "",
      lastName: "",
      profile: { link: "" },
      birthDate: "",
      gender: "",
      phoneNumber: "",
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

  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setProfilePictureFile(e.target.files[0]);
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile((prev) => {
      const updatedProfile = { ...prev };
      if (name.includes("address.")) {
        updatedProfile.info.address = {
          ...updatedProfile.info.address,
          [name.split(".")[1]]: value,
        };
      } else if (name.includes("info.")) {
        updatedProfile.info = {
          ...updatedProfile.info,
          [name.split(".")[1]]: value,
        };
      } else if (name.includes("credentials.")) {
        updatedProfile.credentials = {
          ...updatedProfile.credentials,
          [name.split(".")[1]]: value,
        };
      }
      return updatedProfile;
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Prepare the updated user data
    const updatedUser = {
        credentials: {
            username: userProfile.credentials.username,
            email: userProfile.credentials.email,
        },
        info: {
            firstName: userProfile.info.firstName,
            middleName: userProfile.info.middleName,
            lastName: userProfile.info.lastName,
            birthDate: userProfile.info.birthDate,
            gender: userProfile.info.gender,
            phoneNumber: userProfile.info.phoneNumber,
            address: userProfile.info.address,
            userType: userProfile.info.userType,
            profile: userProfile.info.profile,
        },
    };

    try {
        const formData = new FormData();
        formData.append("user", JSON.stringify(updatedUser));
        if (profilePictureFile) {
            formData.append("file", profilePictureFile);
        }

        const response = await axios.patch(
            `${API_BASE_URL}/${userId}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        // Update state with the new user data
        setUserProfile(response.data);

        toast.success("Profile updated successfully.");
    } catch (error) {
        console.error("Failed to update user data:", error);
        toast.error("Failed to update profile. Please try again.");
    } finally {
        setLoading(false);
    }
  };


  return (
    <div>
      <Topbar />
      <div
        className={`min-h-screen pt-28 lg:pt-16 ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
        }`}
      >
        <div className="w-full lg:w-3/4 mx-auto p-6 space-y-6">
          <button
            onClick={() => navigate("/view-profile")}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
          >
            Back to View Profile
          </button>
          <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
          <form
            onSubmit={handleFormSubmit}
            className={`p-6 rounded-lg shadow ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border border-gray-200"
            }`}
          >
            {/* Profile Picture Section */}
            <div className="mb-6 flex flex-col items-center">
              <div className="relative h-32 w-32 rounded-full overflow-hidden border">
                <img
                  src={
                    userProfile.info.profile.link ||
                    "https://via.placeholder.com/150"
                  }
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-4"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* First Row */}
              <div>
                <label className="font-medium">First Name:</label>
                <input
                  type="text"
                  name="info.firstName"
                  value={userProfile.info.firstName}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 rounded-md border dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="font-medium">Last Name:</label>
                <input
                  type="text"
                  name="info.lastName"
                  value={userProfile.info.lastName}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 rounded-md border dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="font-medium">Email:</label>
                <input
                  type="email"
                  name="credentials.email"
                  value={userProfile.credentials.email}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 rounded-md border dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Second Row */}
              <div>
                <label className="font-medium">Phone:</label>
                <input
                  type="text"
                  name="info.phoneNumber"
                  value={userProfile.info.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 rounded-md border dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="font-medium">Birthdate:</label>
                <input
                  type="date"
                  name="info.birthDate"
                  value={userProfile.info.birthDate}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 rounded-md border dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="font-medium">Gender:</label>
                <select
                  name="info.gender"
                  value={userProfile.info.gender}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 rounded-md border dark:bg-gray-700 dark:text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Third Row */}
              <div>
                <label className="font-medium">House Number:</label>
                <input
                  type="text"
                  name="address.houseNumber"
                  value={userProfile.info.address.houseNumber}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 rounded-md border dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="font-medium">Street:</label>
                <input
                  type="text"
                  name="address.street"
                  value={userProfile.info.address.street}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 rounded-md border dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="font-medium">City:</label>
                <input
                  type="text"
                  name="address.city"
                  value={userProfile.info.address.city}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 rounded-md border dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="font-medium">ZIP Code:</label>
                <input
                  type="text"
                  name="address.zip"
                  value={userProfile.info.address.zip}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 rounded-md border dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Bio */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <label className="font-medium">Bio:</label>
                <textarea
                  name="info.bio"
                  value={userProfile.info.bio || ""}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 rounded-md border dark:bg-gray-700 dark:text-white h-24"
                ></textarea>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                className={`w-full px-4 py-2 text-white rounded-md ${
                  loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-500"
                } transition`}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
