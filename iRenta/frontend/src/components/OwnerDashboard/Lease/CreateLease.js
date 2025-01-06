import React, { useState, useEffect, useContext } from "react";
import { createLease } from "../../../global/api/Leases.js";
import { fetchUserData } from "../../../global/api/Users.js";
import { fetchTermsTemplates } from "../../../global/api/Terms.js";
import { AuthContext } from "../../../global/contexts/AuthContext.js";
import { ThemeContext } from "../../../contexts/ThemeContext.js"; // Import ThemeContext for dark mode
import { GetToken } from "../../../global/utils/Token.js";

const CreateLease = ({seekerId}) => {
  const passedSeekerId = seekerId || "";
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext); // Access dark mode state
  const storedToken = GetToken();
  const [usePlaceholderTenant, setUsePlaceholderTenant] = useState(false);
  const [preloadedTerms, setPreloadedTerms] = useState([]);
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
    tenant: passedSeekerId._id || "",
    tenantPlaceholder: {
      name: "",
      email: "",
      phoneNumber: "",
    },
    landlord: user.id,
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
        const terms = await fetchTermsTemplates();
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

  const validateDates = () => {
    const { startDate, endDate } = formData.contractDetails;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    if (start < today) {
      alert("The start date cannot be in the past.");
      return false;
    }

    const durationInDays = (end - start) / (1000 * 60 * 60 * 24);
    if (durationInDays < 30) {
      alert("The lease duration must be at least 1 month.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (action, event) => {
    event.preventDefault();

    if (
      action === "saveAndSend" &&
      (!formData.contractDetails.startDate ||
        !formData.contractDetails.endDate ||
        !formData.contractDetails.rentAmount)
    ) {
      alert("Please fill out all required fields.");
      return;
    }

    if (!validateDates()) {
      return;
    }

    const selectedTerms = preloadedTerms.find(
      (term) => term._id === formData.contractDetails.termsAndConditionsId
    );

    const payload = {
      ...formData,
      landlordName: `${userProfile?.info?.firstName} ${userProfile?.info?.lastName}`,
      tenant: formData.tenant || null,
      contractDetails: {
        ...formData.contractDetails,
        customTermsAndConditions: selectedTerms ? selectedTerms.content : "",
      },
      action, // Send the action type to the backend
    };

    console.log("Submitting Payload:", payload);

    try {
      const lease = await createLease(payload);
      alert(
        action === "saveAndSend"
          ? "Lease marked ready to send!"
          : "Lease saved as draft!"
      );
      console.log(lease);
      handleClearForm();
    } catch (err) {
      console.error("Error creating lease:", err.response?.data || err.message);
      alert(
        `Failed to create lease: ${
          err.response?.data?.message || "Unknown error"
        }`
      );
    }
  };

  const handleClearForm = () => {
    // Reset formData to initial values
    setFormData({
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
      tenantPlaceholder: {
        name: "",
        email: "",
        phoneNumber: "",
      },
      landlord: user.id,
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
          Create Lease
        </h1>
        <form
          onSubmit={(e) => handleSubmit("saveAndSend", e)}
          className="space-y-6"
        >
          {/* Property Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </div>

          {/* Tenant Details */}
          <div>
            <label
              className={`block text-sm font-medium ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Tenant Details
            </label>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="usePlaceholderTenant"
                checked={usePlaceholderTenant}
                onChange={() => setUsePlaceholderTenant((prev) => !prev)}
                className={`mt-1 mr-2 block border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
              <label htmlFor="usePlaceholderTenant" className="text-sm">
                Use Placeholder Tenant Details
              </label>
            </div>
            {usePlaceholderTenant ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label   className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                    Placeholder Name
                  </label>
                  <input
                    type="text"
                    name="tenantPlaceholder.name"
                    value={formData.tenantPlaceholder.name}
                    onChange={handleChange}
                      className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
                </div>
                <div>
                  <label   className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                    Placeholder Email
                  </label>
                  <input
                    type="email"
                    name="tenantPlaceholder.email"
                    value={formData.tenantPlaceholder.email}
                    onChange={handleChange}
                      className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
                </div>
                <div>
                  <label   className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                    Placeholder Phone
                  </label>
                  <input
                    type="text"
                    name="tenantPlaceholder.phoneNumber"
                    value={formData.tenantPlaceholder.phoneNumber}
                    onChange={handleChange}
                      className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  name="tenant"
                  value={formData.tenant}
                  onChange={handleChange}
                  placeholder={passedSeekerId._id}
                  className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                      : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
                  }`}
                />
              </div>
            )}
          </div>

          {/* Lease Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label   className={`block text-sm font-medium ${
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
            <div>
              <label   className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Rent Amount
              </label>
              <input
                type="number"
                name="contractDetails.rentAmount"
                value={formData.contractDetails.rentAmount}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>
            <div>
              <label   className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Deposit Amount
              </label>
              <input
                type="number"
                name="contractDetails.depositAmount"
                value={formData.contractDetails.depositAmount}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>
            <div>
              <label   className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Payment Frequency
              </label>
              <select
                name="contractDetails.paymentFrequency"
                value={formData.contractDetails.paymentFrequency}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
                }`}
              >
                <option value="">Select Frequency Terms</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* Preloaded Terms & Conditions */}
          <div>
            <label
              className={`block text-sm font-medium ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Terms and Conditions
            </label>
            <select
              name="contractDetails.termsAndConditionsId"
              value={formData.contractDetails.termsAndConditionsId}
              onChange={handleChange}
              className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                  : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
              }`}
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

          {/* Submit Button */}
          <button
            type="button"
            onClick={(e) => handleSubmit("saveAsDraft", e)}
            className="w-full mt-4 px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded hover:bg-gray-600"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            onClick={(e) => handleSubmit("saveAndSend", e)}
            className={`w-full mt-4 px-4 py-2 rounded text-sm font-medium ${
              darkMode
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Save and Mark Ready to Send
          </button>
        </form>
      </div>
    </div>
  );
};
export default CreateLease;
