import React, { useState, useEffect } from "react";
import { fetchContractById } from "../../../api/Contracts.js"; // Create a function to fetch a specific contract

const ViewContract = ({ contractId }) => {
  const [contractDetails, setContractDetails] = useState([]);

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
    return <div>Loading...</div>;
  }


  return (
    <div className="flex-grow">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-full mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 text-center mb-6">
          View Contract
        </h1>

        {/* Property Details */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Property Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Property Name
              </label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                {contractDetails?.property?.name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                House Number
              </label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                {contractDetails?.property?.address?.houseNumber}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Street
              </label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                {contractDetails?.property?.address?.street}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                {contractDetails?.property?.address?.city}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ZIP
              </label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                {contractDetails?.property?.address?.zip}
              </p>
            </div>
          </div>

          {/* Contract Details */}
          <h2 className="text-xl font-semibold text-gray-800 mt-6">
            Contract Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tenant
              </label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                {contractDetails?.tenant?.name || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Landlord
              </label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                {contractDetails?.landlordName}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                {contractDetails?.contractDetails?.startDate}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                {contractDetails?.contractDetails?.endDate}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rent Amount
              </label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                {contractDetails?.contractDetails?.rentAmount}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Payment Frequency
              </label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                {contractDetails?.contractDetails?.paymentFrequency}
              </p>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Terms and Conditions
            </label>
            <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
              {contractDetails?.contractDetails?.termsAndConditions}
            </p>
          </div>

          {/* Rules and Regulations */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Rules and Regulations
            </label>
            <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
              {contractDetails?.contractDetails?.rulesAndRegulations}
            </p>
          </div>

          <div className="flex flex-col w-full justify-center items-center gap-2">
            <button className="my-5 w-fit px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Download as PDF
            </button>
            Do you Agree in the Terms and Conditions of this Contract?
            <button className="w-fit px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
              I Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewContract;
