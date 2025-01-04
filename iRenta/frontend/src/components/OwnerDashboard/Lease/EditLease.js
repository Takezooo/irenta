import React, { useState, useEffect } from "react";
import { fetchLeaseById, updateLease } from "../../../global/api/Leases.js";
import { fetchTermsTemplates } from "../../../global/api/Terms.js";

const EditLease = ({ leaseId, onLeaseUpdated }) => {
  const [formData, setFormData] = useState(null);
  const [termsTemplates, setTermsTemplates] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const getLease = async () => {
      try {
        const fetchedLease = await fetchLeaseById(leaseId);
        if (fetchedLease.status !== "Draft") {
          setError("Only leases with status 'Draft' can be edited.");
        } else {
          setFormData(fetchedLease);
        }
      } catch (err) {
        console.error("Failed to fetch lease:", err);
        setError("Failed to fetch lease data.");
      }
    };

    getLease();
  }, [leaseId]);

  useEffect(() => {
    const getTermsTemplates = async () => {
      try {
        const templates = await fetchTermsTemplates();
        setTermsTemplates(templates);
      } catch (err) {
        console.error("Failed to fetch terms templates:", err);
      }
    };

    getTermsTemplates();
  }, []);

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
    try {
      if (formData.status === "Pending") {
        const updatedLease = await updateLease(leaseId, formData);
        alert("Lease updated successfully!");
        console.log("Updated lease:", updatedLease);
        onLeaseUpdated();
      } else {
        alert("Only leases with status 'Pending' can be edited.");
      }
    } catch (error) {
      console.error("Error updating lease:", error);
      alert("Failed to update the lease. Please try again.");
    }
  };

  if (error) {
    return (
      <div className={`${darkMode ? "text-red-400" : "text-red-500"}`}>
        {error}
      </div>
    );
  }

  if (!formData) {
    return (
      <div className={`${darkMode ? "text-white" : "text-black"}`}>
        Loading...
      </div>
    );
  }

  return (
    <div className="flex-grow">
      <div
        className={`${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        } shadow-md rounded-lg p-8 max-w-full mx-auto`}
      >
        <h1
          className={`text-3xl font-bold text-center mb-6 ${
            darkMode ? "text-blue-400" : "text-blue-600"
          }`}
        >
          Edit Lease
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                value={formData.property.name || ""}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white text-black border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                value={formData.tenant || ""}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white text-black border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                value={formData.property.address.houseNumber || ""}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white text-black border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                value={formData.property.address.street || ""}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white text-black border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                value={formData.property.address.city || ""}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white text-black border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                value={formData.property.address.zip || ""}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white text-black border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>
          </div>

          {/* Contract Details Section */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                value={formData.contractDetails.startDate || ""}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white text-black border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                value={formData.contractDetails.endDate || ""}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white text-black border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rent Amount
              </label>
              <input
                type="number"
                name="contractDetails.rentAmount"
                value={formData.contractDetails.rentAmount || ""}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
              />
            </div>
          </div>

          {/* Terms Templates Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Terms and Conditions Template
            </label>
            <select
              name="contractDetails.termsAndConditions"
              value={formData.contractDetails.termsAndConditions || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
            >
              <option value="">Select a template</option>
              {termsTemplates.map((template) => (
                <option key={template._id} value={template.content}>
                  {template.title}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className={`w-full mt-4 px-4 py-2 rounded shadow ${
              darkMode
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Update Lease
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditLease;
