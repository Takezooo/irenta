import React, { useState, useEffect, useContext } from "react";
import { fetchLeaseById, downloadPdf } from "../../../global/api/Leases.js"; // Import API functions
import { ThemeContext } from "../../../contexts/ThemeContext.js";

const ViewLease = ({ leaseId }) => {
  const [leaseDetails, setLeaseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { darkMode } = useContext(ThemeContext); // Access dark mode state

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
    return (
      <div
        className={`flex justify-center items-center h-screen ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-200 text-black"
        }`}
      >
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`text-center p-6 ${
          darkMode ? "bg-gray-900 text-red-400" : "bg-gray-100 text-red-600"
        }`}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      className={`flex-grow p-6 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div
        className={`shadow-md rounded-lg p-8 max-w-full mx-auto ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h1
          className={`text-3xl font-bold text-center mb-6 ${
            darkMode ? "text-blue-400" : "text-blue-600"
          }`}
        >
          View Lease
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
            {[
              { label: "Property Name", value: leaseDetails?.property?.name },
              {
                label: "House Number",
                value: leaseDetails?.property?.address?.houseNumber,
              },
              {
                label: "Street",
                value: leaseDetails?.property?.address?.street,
              },
              { label: "City", value: leaseDetails?.property?.address?.city },
              { label: "ZIP", value: leaseDetails?.property?.address?.zip },
            ].map(({ label, value }, index) => (
              <div key={index}>
                <label
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {label}
                </label>
                <p
                  className={`mt-1 block w-full border rounded-md px-4 py-2 ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-gray-50 text-black border-gray-300"
                  }`}
                >
                  {value || "N/A"}
                </p>
              </div>
            ))}
          </div>

          {/* Lease Details */}
          <h2
            className={`text-xl font-semibold mt-6 ${
              darkMode ? "text-gray-300" : "text-gray-800"
            }`}
          >
            Lease Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Tenant", value: leaseDetails?.tenant?.name },
              { label: "Landlord", value: leaseDetails?.landlordName },
              {
                label: "Start Date",
                value: new Date(
                  leaseDetails?.contractDetails?.startDate
                ).toLocaleDateString(),
              },
              {
                label: "End Date",
                value: new Date(
                  leaseDetails?.contractDetails?.endDate
                ).toLocaleDateString(),
              },
              {
                label: "Rent Amount",
                value: `$${leaseDetails?.contractDetails?.rentAmount}`,
              },
              {
                label: "Payment Frequency",
                value: leaseDetails?.contractDetails?.paymentFrequency,
              },
            ].map(({ label, value }, index) => (
              <div key={index}>
                <label
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {label}
                </label>
                <p
                  className={`mt-1 block w-full border rounded-md px-4 py-2 ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-gray-50 text-black border-gray-300"
                  }`}
                >
                  {value || "N/A"}
                </p>
              </div>
            ))}
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
              {leaseDetails?.contractDetails?.customTermsAndConditions ||
                leaseDetails?.contractDetails?.termsAndConditionsId?.content ||
                "N/A"}
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
              {leaseDetails?.contractDetails?.rulesAndRegulations || "N/A"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col w-full justify-center items-center gap-2">
            <button
              className={`my-5 w-fit px-4 py-2 rounded-md ${
                darkMode
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
              onClick={handleDownloadPdf}
            >
              Download as PDF
            </button>
            <p
              className={`${
                darkMode ? "text-gray-400" : "text-gray-700"
              } text-center`}
            >
              Do you agree to the Terms and Conditions of this Lease?
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

export default ViewLease;
