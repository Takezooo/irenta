import React, { useState, useEffect } from "react";
import { fetchContractById, updateContract } from "../../../api/Contracts.js"; // Create a function to fetch a specific contract

const EditContract = ({ contractId, onContractUpdated }) => {
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const getContract = async () => {
      try {
        const fetchedContract = await fetchContractById(contractId);
        if (fetchedContract.status !== "Pending") {
          setError("Only contracts with status 'Passive' can be edited.");
        } else {
          setFormData(fetchedContract);
        }
      } catch (err) {
        console.error("Failed to fetch contract:", err);
        setError("Failed to fetch contract data.");
      }
    };

    getContract();
  }, [contractId]);

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
    try {
      if (formData.status === "Pending") {
        const updatedContract = await updateContract(contractId, formData);
        alert("Contract updated successfully!");
        console.log("Updated contract:", updatedContract);
        onContractUpdated(); // Refresh the contract list
      } else {
        alert("Only inactive contracts can be edited.");
      }
    } catch (error) {
      console.error("Error updating contract:", error);
      alert("Failed to update the contract. Please try again.");
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!formData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-grow">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-full mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 text-center mb-6">
          Edit Contract
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Landlord
              </label>
              <input
                type="text"
                name="landlordName"
                value={formData.landlordName}
                readOnly
                onClick={(e) => e.preventDefault()}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
              />
            </div>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Terms and Conditions
            </label>
            <textarea
              name="contractDetails.termsAndConditions"
              value={formData.contractDetails.termsAndConditions}
              onChange={handleChange}
              rows="4"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
            />
          </div>
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
          <button
            type="submit"
            className="w-full mt-4 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600"
          >
            Update Contract
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditContract;