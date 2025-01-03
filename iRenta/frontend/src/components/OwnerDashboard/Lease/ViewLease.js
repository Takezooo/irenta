import React, { useState, useEffect } from "react";
import { fetchLeaseById, downloadPdf } from "../../../global/api/Leases.js"; // Import API functions

const ViewLease = ({ leaseId }) => {
  const [leaseDetails, setLeaseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getLease = async () => {
      try {
        setLoading(true);
        const fetchedLease = await fetchLeaseById(leaseId);
        setLeaseDetails(fetchedLease);
      } catch (err) {
        console.error("Failed to fetch lease:", err);
        setError("Failed to fetch lease details.");
      } finally {
        setLoading(false);
      }
    };

    getLease();
  }, [leaseId]);

  const handleDownloadPdf = () => {
    if (leaseId) {
      downloadPdf(leaseId);
    } else {
      console.error("Lease ID is not available.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="flex-grow">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-full mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 text-center mb-6">
          View Lease
        </h1>

        {/* Property Details */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Property Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Property Name</label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                {leaseDetails?.property?.name || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">House Number</label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                {leaseDetails?.property?.address?.houseNumber || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Street</label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                {leaseDetails?.property?.address?.street || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                {leaseDetails?.property?.address?.city || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ZIP</label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                {leaseDetails?.property?.address?.zip || "N/A"}
              </p>
            </div>
          </div>

          {/* Lease Details */}
          <h2 className="text-xl font-semibold text-gray-800 mt-6">Lease Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tenant</label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                {leaseDetails?.tenant?.name || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Landlord</label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                {leaseDetails?.landlordName || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                {new Date(leaseDetails?.contractDetails?.startDate).toLocaleDateString() || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                {new Date(leaseDetails?.contractDetails?.endDate).toLocaleDateString() || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rent Amount</label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                ${leaseDetails?.contractDetails?.rentAmount || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Frequency</label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                {leaseDetails?.contractDetails?.paymentFrequency || "N/A"}
              </p>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Terms and Conditions</label>
            <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
              {leaseDetails?.contractDetails?.customTermsAndConditions ||
                leaseDetails?.contractDetails?.termsAndConditionsId?.content ||
                "N/A"}
            </p>
          </div>

          {/* Rules and Regulations */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Rules and Regulations</label>
            <p className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
              {leaseDetails?.contractDetails?.rulesAndRegulations || "N/A"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col w-full justify-center items-center gap-2">
            <button
              className="my-5 w-fit px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={handleDownloadPdf}
            >
              Download as PDF
            </button>
            <p>Do you Agree to the Terms and Conditions of this Lease?</p>
            <button className="w-fit px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
              I Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLease;
