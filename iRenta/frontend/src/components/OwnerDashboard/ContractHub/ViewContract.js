import React, { useState, useEffect, useContext } from "react";
import { fetchContractById } from "../../../global/api/Contracts.js";
import { ThemeContext } from "../../../contexts/ThemeContext";

const ViewContract = ({ contractId }) => {
  const { darkMode } = useContext(ThemeContext); // Access dark mode context
  const [contractDetails, setContractDetails] = useState(null);

  useEffect(() => {
    const getContract = async () => {
      try {
        const fetchedContract = await fetchContractById(contractId);
        setContractDetails(fetchedContract);
      } catch (err) {
        console.error("Failed to fetch contract:", err);
      }
    };

    getContract();
  }, [contractId]);

  if (!contractDetails) {
    return (
      <div
        className={`${
          darkMode ? "text-white" : "text-black"
        } flex justify-center items-center`}
      >
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
          View Contract
        </h1>

        {/* Property Details */}
        <div className="space-y-6">
          <h2
            className={`text-xl font-semibold ${
              darkMode ? "text-gray-300" : "text-gray-800"
            }`}
          >
            Property Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Property Name
              </label>
              <p
                className={`mt-1 block w-full border rounded-md px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-50 text-black border-gray-300"
                }`}
              >
                {contractDetails?.property?.name}
              </p>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                House Number
              </label>
              <p
                className={`mt-1 block w-full border rounded-md px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-50 text-black border-gray-300"
                }`}
              >
                {contractDetails?.property?.address?.houseNumber}
              </p>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Street
              </label>
              <p
                className={`mt-1 block w-full border rounded-md px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-50 text-black border-gray-300"
                }`}
              >
                {contractDetails?.property?.address?.street}
              </p>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                City
              </label>
              <p
                className={`mt-1 block w-full border rounded-md px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-50 text-black border-gray-300"
                }`}
              >
                {contractDetails?.property?.address?.city}
              </p>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                ZIP
              </label>
              <p
                className={`mt-1 block w-full border rounded-md px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-50 text-black border-gray-300"
                }`}
              >
                {contractDetails?.property?.address?.zip}
              </p>
            </div>
          </div>

          {/* Contract Details */}
          <h2
            className={`text-xl font-semibold ${
              darkMode ? "text-gray-300" : "text-gray-800"
            } mt-6`}
          >
            Contract Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Tenant
              </label>
              <p
                className={`mt-1 block w-full border rounded-md px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-50 text-black border-gray-300"
                }`}
              >
                {contractDetails?.tenant?.name || "N/A"}
              </p>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Landlord
              </label>
              <p
                className={`mt-1 block w-full border rounded-md px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-50 text-black border-gray-300"
                }`}
              >
                {contractDetails?.landlordName}
              </p>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Start Date
              </label>
              <p
                className={`mt-1 block w-full border rounded-md px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-50 text-black border-gray-300"
                }`}
              >
                {contractDetails?.contractDetails?.startDate}
              </p>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                End Date
              </label>
              <p
                className={`mt-1 block w-full border rounded-md px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-50 text-black border-gray-300"
                }`}
              >
                {contractDetails?.contractDetails?.endDate}
              </p>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Rent Amount
              </label>
              <p
                className={`mt-1 block w-full border rounded-md px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-50 text-black border-gray-300"
                }`}
              >
                {contractDetails?.contractDetails?.rentAmount}
              </p>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Payment Frequency
              </label>
              <p
                className={`mt-1 block w-full border rounded-md px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-50 text-black border-gray-300"
                }`}
              >
                {contractDetails?.contractDetails?.paymentFrequency}
              </p>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div>
            <label
              className={`block text-sm font-medium ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Terms and Conditions
            </label>
            <p
              className={`mt-1 block w-full border rounded-md px-4 py-2 ${
                darkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-gray-50 text-black border-gray-300"
              }`}
            >
              {contractDetails?.contractDetails?.termsAndConditions}
            </p>
          </div>

          {/* Rules and Regulations */}
          <div>
            <label
              className={`block text-sm font-medium ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Rules and Regulations
            </label>
            <p
              className={`mt-1 block w-full border rounded-md px-4 py-2 ${
                darkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-gray-50 text-black border-gray-300"
              }`}
            >
              {contractDetails?.contractDetails?.rulesAndRegulations}
            </p>
          </div>

          <div className="flex flex-col w-full justify-center items-center gap-2">
            <button
              className={`my-5 w-fit px-4 py-2 rounded-md ${
                darkMode
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Download as PDF
            </button>
            <p
              className={`${
                darkMode ? "text-gray-300" : "text-gray-700"
              } text-center`}
            >
              Do you agree to the Terms and Conditions of this Contract?
            </p>
            <button
              className={`w-fit px-4 py-2 rounded-md ${
                darkMode
                  ? "bg-green-600 text-white hover:bg-green-500"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              I Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewContract;
