import React, { useState, useEffect, useContext } from "react";

import { createContract } from "../../../global/api/Contracts.js";
import { fetchUserData } from "../../../global/api/Users.js";

import { AuthContext } from "../../../global/contexts/AuthContext.js";
import { ThemeContext } from "../../../contexts/ThemeContext.js"; // Import ThemeContext for dark mode
import { GetToken } from "../../../global/utils/Token.js";

const CreateContract = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext); // Access dark mode state
  const storedToken = GetToken();

  const [userProfile, setUserProfile] = useState({
    info: {
      firstName: "",
      lastName: "",
      profile: { link: "" },
    },
  });

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
  }, [user, storedToken]); // Only re-run when `user` or `storedToken` changes

  const [formData, setFormData] = useState({
    property: {
      name: "",
      address: {
        houseNumber: "",
        street: "",
        city: "",
        zip: "",
      },
    },
    tenant: "",
    landlord: user.id,
    landlordName: "",
    contractDetails: {
      startDate: "",
      endDate: "",
      rentAmount: "",
      paymentFrequency: "Monthly",
      depositAmount: "",
      termsAndConditions: "",
      rulesAndRegulations: "",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const keys = name.split(".");
      setFormData((prev) => {
        let updatedData = { ...prev };
        let nestedData = updatedData;

        keys.forEach((key, index) => {
          if (index === keys.length - 1) {
            nestedData[key] = value; // Set the value at the last key
          } else {
            if (!nestedData[key]) nestedData[key] = {};
            nestedData = nestedData[key];
          }
        });

        return updatedData;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedPayload = {
      property: {
        name: formData.property.name,
        address: { ...formData.property.address },
      },
      tenant: formData.tenant,
      landlord: user.id,
      landlordName: `${userProfile.info.firstName} ${userProfile.info.lastName}`,
      contractDetails: { ...formData.contractDetails },
    };

    console.log("Submitting Cleaned Payload:", cleanedPayload);

    try {
      const contract = await createContract(cleanedPayload);
      alert("Contract created successfully!");
      console.log(contract);
    } catch (err) {
      console.error(
        "Error creating contract:",
        err.response?.data || err.message
      );
      alert(
        `Failed to create contract: ${
          err.response?.data?.message || "Unknown error"
        }`
      );
    }
  };

  return (
    <div
      className={`flex-grow ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div
        className={`shadow-md rounded-lg p-8 max-w-full mx-auto ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        }`}
      >
        <h1
          className={`text-3xl font-bold text-center mb-6 ${
            darkMode ? "text-blue-400" : "text-blue-600"
          }`}
        >
          Create Contract
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Property Name
              </label>
              <input
                type="text"
                name="property.name"
                value={formData.property.name}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                House Number
              </label>
              <input
                type="text"
                name="property.address.houseNumber"
                value={formData.property.address.houseNumber}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Street
              </label>
              <input
                type="text"
                name="property.address.street"
                value={formData.property.address.street}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                City
              </label>
              <input
                type="text"
                name="property.address.city"
                value={formData.property.address.city}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                ZIP
              </label>
              <input
                type="text"
                name="property.address.zip"
                value={formData.property.address.zip}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Tenant
              </label>
              <input
                type="text"
                name="tenant"
                value={formData.tenant}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Start Date
              </label>
              <input
                type="date"
                name="contractDetails.startDate"
                value={formData.contractDetails.startDate}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                End Date
              </label>
              <input
                type="date"
                name="contractDetails.endDate"
                value={formData.contractDetails.endDate}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Terms and Conditions
            </label>
            <textarea
              name="contractDetails.termsAndConditions"
              value={formData.contractDetails.termsAndConditions}
              onChange={handleChange}
              rows="4"
              className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                  : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Rules and Regulations
            </label>
            <textarea
              name="contractDetails.rulesAndRegulations"
              value={formData.contractDetails.rulesAndRegulations}
              onChange={handleChange}
              rows="4"
              className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                  : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
          </div>
          
          <button
            type="submit"
            className={`w-full mt-4 px-4 py-2 rounded text-sm font-medium ${
              darkMode
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Submit Contract
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateContract;
