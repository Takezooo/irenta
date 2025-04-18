import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../../contexts/ThemeContext";
import { fetchLeaseById, downloadPdf } from "../../../global/api/Leases";

const ViewLease = ({ leaseId }) => {
  const [leaseDetails, setLeaseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { darkMode } = useContext(ThemeContext);
  const [signatureBase64, setSignatureBase64] = useState("");
  const [ownerSignatureBase64, setOwnerSignatureBase64] = useState("");

  useEffect(() => {
    const getLeaseDetails = async () => {
      try {
        setLoading(true);
        const lease = await fetchLeaseById(leaseId); // Fetch lease by ID
        setLeaseDetails(lease);
      } catch (err) {
        setError("Failed to fetch lease details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (leaseId) {
      getLeaseDetails();
    }
  }, [leaseId]);

  useEffect(() => {
    // Convert tenant signature to readable image
    if (leaseDetails?.uploadedSignature?.data?.data) {
      try {
        const byteArray = new Uint8Array(leaseDetails.uploadedSignature.data.data);
        const base64String = btoa(
          byteArray.reduce((data, byte) => data + String.fromCharCode(byte), "")
        );
        setSignatureBase64(
          `data:${leaseDetails.uploadedSignature.contentType};base64,${base64String}`
        );
      } catch (err) {
        console.error("Error processing tenant signature:", err);
      }
    }

    // Convert owner signature to readable image
    if (leaseDetails?.uploadedOwnerSignature?.data?.data) {
      try {
        const byteArray = new Uint8Array(leaseDetails.uploadedOwnerSignature.data.data);
        const base64String = btoa(
          byteArray.reduce((data, byte) => data + String.fromCharCode(byte), "")
        );
        setOwnerSignatureBase64(
          `data:${leaseDetails.uploadedOwnerSignature.contentType};base64,${base64String}`
        );
      } catch (err) {
        console.error("Error processing owner signature:", err);
      }
    }
  }, [leaseDetails]);

  const handleDownloadPdf = () => {
    if (leaseId) {
      downloadPdf(leaseId);
    } else {
      console.error("Lease ID is not available.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "";
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

  const InfoItem = ({ label, value }) => (
    <div>
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
        {value || ""}
      </p>
    </div>
  );

  const SectionTitle = ({ title }) => (
    <h2
      className={`text-xl font-semibold mt-6 ${
        darkMode ? "text-gray-300" : "text-gray-800"
      }`}
    >
      {title}
    </h2>
  );

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

        <div className="space-y-6">
          {/* Lease Status */}
          <div className="flex justify-between items-center">
            <SectionTitle title="Lease Status" />
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                leaseDetails?.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : leaseDetails?.status === "Pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : leaseDetails?.status === "Draft"
                  ? "bg-gray-100 text-gray-800"
                  : leaseDetails?.status === "Terminated"
                  ? "bg-red-100 text-red-800"
                  : leaseDetails?.status === "Expired"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {leaseDetails?.status || "N/A"}
            </span>
          </div>

          {/* Property Details */}
          <div>
            <SectionTitle title="Property Information" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InfoItem
                label="Property Name"
                value={leaseDetails?.property?.name}
              />
              <InfoItem
                label="House Number"
                value={leaseDetails?.property?.address?.houseNumber}
              />
              <InfoItem
                label="Street"
                value={leaseDetails?.property?.address?.street}
              />
              <InfoItem
                label="City"
                value={leaseDetails?.property?.address?.city}
              />
              <InfoItem
                label="ZIP"
                value={leaseDetails?.property?.address?.zip}
              />
            </div>
          </div>

          {/* Tenant Details */}
          <div>
            <SectionTitle title="Tenant Information" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {leaseDetails?.tenant ? (
                <>
                  <InfoItem 
                    label="Tenant Name" 
                    value={`${leaseDetails.tenant?.info?.firstName || ""} ${leaseDetails.tenant?.info?.lastName || ""}`} 
                  />
                  <InfoItem 
                    label="Tenant Email" 
                    value={leaseDetails.tenant?.credentials?.email} 
                  />
                  <InfoItem 
                    label="Tenant Phone" 
                    value={leaseDetails.tenant?.info?.phoneNumber} 
                  />
                </>
              ) : (
                <>
                  <InfoItem 
                    label="Placeholder Name" 
                    value={leaseDetails?.tenantPlaceholder?.name} 
                  />
                  <InfoItem 
                    label="Placeholder Email" 
                    value={leaseDetails?.tenantPlaceholder?.email} 
                  />
                  <InfoItem 
                    label="Placeholder Phone" 
                    value={leaseDetails?.tenantPlaceholder?.phoneNumber} 
                  />
                  <InfoItem 
                    label="Emergency Contact Name" 
                    value={leaseDetails?.tenantPlaceholder?.emergencyContact?.name} 
                  />
                  <InfoItem 
                    label="Emergency Contact Phone" 
                    value={leaseDetails?.tenantPlaceholder?.emergencyContact?.phoneNumber} 
                  />
                </>
              )}
            </div>
          </div>

          {/* Lease Details */}
          <div>
            <SectionTitle title="Lease Information" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InfoItem
                label="Landlord Name"
                value={leaseDetails?.landlordName}
              />
              <InfoItem
                label="Lease Type"
                value={leaseDetails?.leaseType}
              />
              <InfoItem
                label="Start Date"
                value={formatDate(leaseDetails?.contractDetails?.startDate)}
              />
              <InfoItem
                label="End Date"
                value={formatDate(leaseDetails?.contractDetails?.endDate)}
              />
              <InfoItem
                label="Move-in Date"
                value={formatDate(leaseDetails?.contractDetails?.moveInDate)}
              />
              <InfoItem
                label="Move-out Date"
                value={formatDate(leaseDetails?.contractDetails?.moveOutDate)}
              />
              <InfoItem
                label="Payment Frequency"
                value={leaseDetails?.contractDetails?.paymentFrequency}
              />
              <InfoItem
                label="Deposit Amount"
                value={leaseDetails?.contractDetails?.depositAmount ? `₱${leaseDetails.contractDetails.depositAmount}` : "N/A"}
              />
              <InfoItem
                label="Grace Period"
                value={leaseDetails?.contractDetails?.gracePeriod ? `${leaseDetails.contractDetails.gracePeriod} days` : "N/A"}
              />
              <InfoItem
                label="Notice Period"
                value={leaseDetails?.contractDetails?.noticePeriod ? `${leaseDetails.contractDetails.noticePeriod} days` : "N/A"}
              />
              <InfoItem
                label="Renewal Terms"
                value={leaseDetails?.contractDetails?.renewalTerms}
              />
            </div>
          </div>

          {/* Financial Details */}
          <div>
            <SectionTitle title="Financial Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem
                label="Base Rent"
                value={leaseDetails?.contractDetails?.rentBreakdown?.baseRent ? `₱${leaseDetails.contractDetails.rentBreakdown.baseRent}` : "N/A"}
              />
              <InfoItem
                label="Utilities Cost"
                value={leaseDetails?.contractDetails?.rentBreakdown?.utilities ? `₱${leaseDetails.contractDetails.rentBreakdown.utilities}` : "N/A"}
              />
              <InfoItem
                label="Amenities Cost"
                value={leaseDetails?.contractDetails?.rentBreakdown?.amenities ? `₱${leaseDetails.contractDetails.rentBreakdown.amenities}` : "N/A"}
              />
            </div>

            {/* Amenities List */}
            {leaseDetails?.amenities && Array.isArray(leaseDetails.amenities) && leaseDetails.amenities.length > 0 && (
              <div className="mt-4">
                <h3 className={`text-lg font-medium ${darkMode ? "text-gray-300" : "text-gray-800"}`}>
                  Amenities
                </h3>
                <div className={`mt-2 p-4 rounded-md ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className="grid grid-cols-12 font-bold mb-2 pb-2 border-b border-gray-600">
                    <div className="col-span-8">Item</div>
                    <div className="col-span-4 text-right">Cost</div>
                  </div>
                  <div className="space-y-2">
                    {leaseDetails.amenities.map((amenity, index) => (
                      <div key={index} className="grid grid-cols-12 py-1 border-b border-gray-600 border-opacity-40 items-center">
                        <div className="col-span-8 font-medium">{amenity.name}</div>
                        <div className="col-span-4 text-right font-semibold">
                          {amenity.amount > 0 ? `₱${parseFloat(amenity.amount).toFixed(2)}` : 'Included'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Utilities List */}
            {leaseDetails?.utilities && Array.isArray(leaseDetails.utilities) && leaseDetails.utilities.length > 0 && (
              <div className="mt-4">
                <h3 className={`text-lg font-medium ${darkMode ? "text-gray-300" : "text-gray-800"}`}>
                  Utilities
                </h3>
                <div className={`mt-2 p-4 rounded-md ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className="grid grid-cols-12 font-bold mb-2 pb-2 border-b border-gray-600">
                    <div className="col-span-8">Item</div>
                    <div className="col-span-4 text-right">Cost</div>
                  </div>
                  <div className="space-y-2">
                    {leaseDetails.utilities.map((utility, index) => (
                      <div key={index} className="grid grid-cols-12 py-1 border-b border-gray-600 border-opacity-40 items-center">
                        <div className="col-span-8 font-medium">{utility.name}</div>
                        <div className="col-span-4 text-right font-semibold">
                          {utility.amount > 0 ? `₱${parseFloat(utility.amount).toFixed(2)}` : 'Included'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Other Fees */}
            {leaseDetails?.contractDetails?.rentBreakdown?.otherFees && 
             leaseDetails.contractDetails.rentBreakdown.otherFees.length > 0 && (
              <div className="mt-4">
                <h3 className={`text-lg font-medium ${darkMode ? "text-gray-300" : "text-gray-800"}`}>
                  Other Fees
                </h3>
                <div className={`mt-2 p-4 rounded-md ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className="grid grid-cols-12 font-bold mb-2 pb-2 border-b border-gray-600">
                    <div className="col-span-8">Item</div>
                    <div className="col-span-4 text-right">Cost</div>
                  </div>
                  <div className="space-y-2">
                    {leaseDetails.contractDetails.rentBreakdown.otherFees.map((fee, index) => (
                      <div key={index} className="grid grid-cols-12 py-1 border-b border-gray-600 border-opacity-40 items-center">
                        <div className="col-span-8 font-medium">{fee.name}</div>
                        <div className="col-span-4 text-right font-semibold">₱{parseFloat(fee.amount).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Total Rent */}
            <div className="mt-4">
              <h3 className={`text-lg font-medium ${darkMode ? "text-gray-300" : "text-gray-800"}`}>
                Total Rent
              </h3>
              <div className={`mt-2 px-4 py-3 rounded-md font-bold text-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"} flex justify-between items-center`}>
                <span>Total Monthly Payment:</span>
                <span>₱{(
                  parseFloat(leaseDetails?.contractDetails?.rentBreakdown?.baseRent || 0) +
                  parseFloat(leaseDetails?.contractDetails?.rentBreakdown?.utilities || 0) +
                  parseFloat(leaseDetails?.contractDetails?.rentBreakdown?.amenities || 0) +
                  (leaseDetails?.contractDetails?.rentBreakdown?.otherFees?.reduce((total, fee) => total + parseFloat(fee.amount || 0), 0) || 0)
                ).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Policies */}
          <div>
            <SectionTitle title="Payment Policies" />
            <div className="mt-2">
              <InfoItem
                label="Late Payment Policy"
                value={leaseDetails?.contractDetails?.latePaymentPolicy}
              />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div>
            <SectionTitle title="Terms and Conditions" />
            <div className={`mt-2 p-4 rounded-md whitespace-pre-wrap ${darkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-black"}`}>
              {leaseDetails?.contractDetails?.customTermsAndConditions || "No terms and conditions specified."}
            </div>
          </div>

          {/* Rules and Regulations */}
          <div>
            <SectionTitle title="Rules and Regulations" />
            <div className={`mt-2 p-4 rounded-md whitespace-pre-wrap ${darkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-black"}`}>
              {leaseDetails?.contractDetails?.rulesAndRegulations || "No rules and regulations specified."}
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tenant's Signature */}
            <div className="mt-6">
              <SectionTitle title="Tenant's Signature" />
              <div className="flex flex-col items-center mt-4">
                <div 
                  className={`w-full max-w-xs h-32 flex items-center justify-center border ${
                    darkMode ? "border-gray-600 bg-gray-700 text-gray-300" : "border-gray-300 bg-gray-200 text-gray-600"
                  }`}
                >
                  {signatureBase64 ? (
                    <img
                      src={signatureBase64}
                      alt="Tenant's Signature"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <p className="text-center">No Signature Provided</p>
                  )}
                </div>
                <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {leaseDetails?.isSignedBySeeker ? "Signed" : "Not Signed"}
                </p>
              </div>
            </div>

            {/* Owner's Signature */}
            <div className="mt-6">
              <SectionTitle title="Owner's Signature" />
              <div className="flex flex-col items-center mt-4">
                <div 
                  className={`w-full max-w-xs h-32 flex items-center justify-center border ${
                    darkMode ? "border-gray-600 bg-gray-700 text-gray-300" : "border-gray-300 bg-gray-200 text-gray-600"
                  }`}
                >
                  {ownerSignatureBase64 ? (
                    <img
                      src={ownerSignatureBase64}
                      alt="Owner's Signature"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <p className="text-center">No Signature Provided</p>
                  )}
                </div>
                <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {leaseDetails?.isSignedByLandlord ? "Signed" : "Not Signed"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col w-full justify-center items-center gap-2 mt-8">
            <button
              className={`px-6 py-2 rounded-md ${
                darkMode
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
              onClick={handleDownloadPdf}
            >
              Download as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLease;
