import React, { useState, useEffect, useContext } from "react";
import { createLease } from "../../../global/api/Leases.js";
import { fetchUserData } from "../../../global/api/Users.js";
import { fetchTermsTemplates } from "../../../global/api/Terms.js";
import { AuthContext } from "../../../global/contexts/AuthContext.js";
import { GetToken } from "../../../global/utils/Token.js";

const CreateLease = () => {
  const { user } = useContext(AuthContext);
  const storedToken = GetToken();

  const [userProfile, setUserProfile] = useState({
    info: {
      firstName: "",
      lastName: "",
      profile: { link: "" },
    },
  });

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
    tenant: "", // Selected tenant (ObjectId from database)
    landlord: user.id, // Current logged-in landlord
    landlordName: "",
    contractDetails: {
      startDate: "",
      endDate: "",
      rentAmount: "",
      paymentFrequency: "Monthly",
      depositAmount: "",
      termsAndConditionsId: "",
      customTermsAndConditions: "",
      rulesAndRegulations: "",
    },
  });

  const [preloadedTerms, setPreloadedTerms] = useState([]); // Preloaded terms from backend

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

    const fetchPreloadedTerms = async () => {
      try {
        const terms = await fetchTermsTemplates(); // Fetch predefined terms from backend
        setPreloadedTerms(terms);
      } catch (err) {
        console.error("Failed to fetch terms and conditions:", err);
      }
    };

    fetchUser();
    fetchPreloadedTerms();
  }, [user, storedToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const keys = name.split(".");
      setFormData((prev) => {
        let updatedData = { ...prev };
        let nestedData = updatedData;

        keys.forEach((key, index) => {
          if (index === keys.length - 1) {
            nestedData[key] = value;
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

    if (!formData.contractDetails.startDate || !formData.contractDetails.endDate || !formData.contractDetails.rentAmount) {
      alert("Please fill out all required fields.");
      return;
    }

    const payload = {
      ...formData,
      landlordName: `${userProfile.info.firstName} ${userProfile.info.lastName}`,
    };

    console.log("Submitting Payload:", payload);

    try {
      const lease = await createLease(payload);
      alert("Lease created successfully!");
      console.log(lease);
    } catch (err) {
      console.error("Error creating lease:", err.response?.data || err.message);
      alert(`Failed to create lease: ${err.response?.data?.message || "Unknown error"}`);
    }
  };

  return (
<div className="flex-grow">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-full mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 text-center mb-6">
          Create Lease
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Property Name
              </label>
              <input
                type="text"
                name="property.name"
                value={formData.property.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                House Number
              </label>
              <input
                type="text"
                name="property.address.houseNumber"
                value={formData.property.address.houseNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Street
              </label>
              <input
                type="text"
                name="property.address.street"
                value={formData.property.address.street}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                name="property.address.city"
                value={formData.property.address.city}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ZIP
              </label>
              <input
                type="text"
                name="property.address.zip"
                value={formData.property.address.zip}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
              />
            </div>
          </div>

          {/* Tenant Details */}
          <div className="grid grid-cols-1">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tenant
              </label>
              <input
                type="text"
                name="tenant"
                value={formData.tenant}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
              />
            </div>
          </div>

          {/* Lease Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                name="contractDetails.startDate"
                value={formData.contractDetails.startDate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                name="contractDetails.endDate"
                value={formData.contractDetails.endDate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rent Amount
              </label>
              <input
                type="number"
                name="contractDetails.rentAmount"
                value={formData.contractDetails.rentAmount}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Deposit Amount
              </label>
              <input
                type="number"
                name="contractDetails.depositAmount"
                value={formData.contractDetails.depositAmount}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
              />
            </div>
          </div>

          {/* Preloaded Terms & Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Terms and Conditions
            </label>
            <select
              name="contractDetails.termsAndConditionsId"
              value={formData.contractDetails.termsAndConditionsId}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
            >
              <option value="">Select Preloaded Terms</option>
              {preloadedTerms.map((term) => (
                <option key={term._id} value={term._id}>
                  {term.title}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Rules & Regulations */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Rules and Regulations
            </label>
            <textarea
              name="contractDetails.rulesAndRegulations"
              value={formData.contractDetails.rulesAndRegulations}
              onChange={handleChange}
              rows="4"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600"
          >
            Submit Lease
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateLease;
