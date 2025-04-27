import React, { useState, useEffect, useContext } from "react";
import SignaturePad from "react-signature-canvas";
import { useLocation } from "react-router-dom";
import { ThemeContext } from "../../contexts/ThemeContext";
import { AuthContext } from "../../global/contexts/AuthContext";
import { GetToken } from "../../global/utils/Token";
import { fetchUserData } from "../../global/api/Users";
import { registerToWaitlist } from "../../global/api/Tenants";
import { sendNotification } from "../../global/api/Notifications";
import {
  fetchLeaseById,
  updateLease,
  downloadPdf,
} from "../../global/api/Leases";
import imageCompression from "browser-image-compression";

const ViewLease = () => {
  const location = useLocation();
  const { leaseId } = location.state || {}; // Get leaseId from state
  const [leaseDetails, setLeaseDetails] = useState(null);
  const [ownerSignatureBase64, setOwnerSignatureBase64] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [signatureFile, setSignatureFile] = useState(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const signaturePadRef = React.useRef();
  const { darkMode } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState({
    info: {
      firstName: "",
      lastName: "",
    },
  });

  const storedToken = GetToken();

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
  }, [user, storedToken]);

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
    // Convert owner signature to readable image
    if (leaseDetails?.uploadedOwnerSignature?.data?.data) {
      try {
        const byteArray = new Uint8Array(
          leaseDetails.uploadedOwnerSignature.data.data
        );
        const base64String = btoa(
          byteArray.reduce((data, byte) => data + String.fromCharCode(byte), "")
        );
        setOwnerSignatureBase64(
          `data:${leaseDetails.uploadedOwnerSignature.contentType};base64,${base64String}`
        );
      } catch (error) {
        console.error("Error processing owner signature:", error);
      }
    }
  }, [leaseDetails]);

  if (error) return <div>Error: {error}</div>;

  const handleDownloadPdf = () => {
    if (leaseId) {
      try {
        downloadPdf(leaseId);
      } catch (error) {
        console.error("Error downloading PDF:", error);
      }
    } else {
      console.error("Lease ID is not available.");
    }
  };

  const handleAttachSignature = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.includes("png")) {
      alert("Only PNG files with a transparent background are allowed.");
      return;
    }
    const options = {
      maxSizeMB: 0.5, // Compress to 0.5MB
      maxWidthOrHeight: 1024, // Resize dimensions
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setSignatureFile(compressedFile);
      alert("File compressed successfully!");
    } catch (error) {
      console.error("Error compressing file:", error);
      alert("Failed to compress the file.");
    }
  };

  const handleOpenSignaturePad = () => {
    setShowSignaturePad(true);
  };

  const handleCancelSignature = () => {
    setShowSignaturePad(false);
  };

  const handleDoneSignature = async () => {
    if (signaturePadRef.current) {
      const signatureUrl = signaturePadRef.current.toDataURL("image/png");

      try {
        // Fetch the signature as a blob
        const res = await fetch(signatureUrl);
        const blob = await res.blob();

        // Create a file object from the blob
        const file = new File([blob], "digital-signature.png", {
          type: "image/png",
        });

        // Compression options
        const options = {
          maxSizeMB: 0.5, // Target size in MB
          maxWidthOrHeight: 1024, // Maximum dimensions
          useWebWorker: true, // Use web worker for better performance
        };

        // Compress the file
        const compressedFile = await imageCompression(file, options);

        // Save the compressed file to state
        setSignatureFile(compressedFile);

        // Hide the signature pad
        setShowSignaturePad(false);

        alert("Signature saved successfully!");
      } catch (error) {
        console.error("Error handling the signature:", error);
        alert("Failed to process the signature. Please try again.");
      }
    }
  };

  const handleSubmit = async () => {
    if (!isAgreed) {
      alert("Please agree to the terms and conditions.");
      return;
    }
    if (!signatureFile) {
      alert("Please attach a signature or draw a digital signature.");
      return;
    }

    try {
      // Update lease with agreement and signature
      const formData = new FormData();
      formData.append("status", "Active");
      formData.append("isSignedBySeeker", true);
      formData.append("isAgreed", true);
      formData.append("uploadedSignature", signatureFile);

      await updateLease(leaseId, formData);

      const tenantData = {
        seekerId: user.id,
        propertyId: leaseDetails.property.propertyId,
        leaseId,
        landlordId: leaseDetails.landlord, // Use landlord ID from lease details
      };
    
      // Register user as waitlisted and update tenantBadge
      await registerToWaitlist(tenantData);

      // Send notification to owner
      await sendNotification(leaseDetails.landlord, {
        type: "SignedContract",
        leaseId: leaseId,
        message: `Lease Agreement has been signed by ${userProfile?.info?.firstName} ${userProfile?.info?.lastName}`,
      });

      alert("Lease signed successfully! The owner has been notified.");

      setSignatureFile(null); // Clear temporary file
    } catch (error) {
      console.error("Error submitting lease:", error);
      alert("Failed to submit lease. Please try again.");
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
        className={`mt-1 block w-full border rounded-md px-4 py-2 h-10 flex items-center ${
          darkMode
            ? "bg-gray-700 text-white border-gray-600"
            : "bg-gray-50 text-black border-gray-300"
        }`}
      >
        {value || "\u00A0"}
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
    <div className={`flex-grow p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <div className={`shadow-md rounded-lg p-8 max-w-full mx-auto ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <div className="mb-4">
          <button
            type="button"
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            onClick={() => window.history.back()}
          >
            ← Back
          </button>
        </div>
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
                value={leaseDetails?.contractDetails?.depositAmount ? `₱${leaseDetails.contractDetails.depositAmount}` : ""}
              />
              <InfoItem
                label="Grace Period"
                value={leaseDetails?.contractDetails?.gracePeriod ? `${leaseDetails.contractDetails.gracePeriod} days` : ""}
              />
              <InfoItem
                label="Notice Period"
                value={leaseDetails?.contractDetails?.noticePeriod ? `${leaseDetails.contractDetails.noticePeriod} days` : ""}
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
                value={leaseDetails?.contractDetails?.rentBreakdown?.baseRent ? `₱${leaseDetails.contractDetails.rentBreakdown.baseRent}` : ""}
              />
              <InfoItem
                label="Utilities Cost"
                value={leaseDetails?.contractDetails?.rentBreakdown?.utilities ? `₱${leaseDetails.contractDetails.rentBreakdown.utilities}` : ""}
              />
              <InfoItem
                label="Amenities Cost"
                value={leaseDetails?.contractDetails?.rentBreakdown?.amenities ? `₱${leaseDetails.contractDetails.rentBreakdown.amenities}` : ""}
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

          {/* Signature Section */}
          <div className="mt-8">
            <SectionTitle title="Your Signature" />
            <div className="mt-4 bg-white p-4 rounded-lg border border-gray-300">
              <div className="text-center space-y-4">
                <label className="flex items-center justify-center gap-2">
                  <input
                    type="checkbox"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    I Agree to the Terms and Conditions
                  </span>
                </label>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                  <div className="flex flex-col items-center">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Upload Signature Image (PNG only)
                    </label>
                    <input
                      type="file"
                      accept="image/png"
                      onChange={handleAttachSignature}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <span className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      OR
                    </span>
                    <button
                      className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500"
                      onClick={handleOpenSignaturePad}
                    >
                      Draw Digital Signature
                    </button>
                  </div>
                </div>

                {signatureFile && (
                  <div className="mt-4 text-center">
                    <p className="text-green-500 mb-2">Signature added successfully!</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                  <button
                    className="px-6 py-2 rounded-md bg-green-600 text-white hover:bg-green-500"
                    onClick={handleSubmit}
                  >
                    Sign and Submit
                  </button>

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

          {/* Digital Signature Pop-Up */}
          {showSignaturePad && (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Draw Your Signature</h3>
                <div className="border border-gray-300 bg-white">
                  <SignaturePad 
                    ref={signaturePadRef}
                    canvasProps={{
                      className: "w-full h-64"
                    }}
                  />
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <button
                    className="px-4 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600"
                    onClick={handleCancelSignature}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-500"
                    onClick={handleDoneSignature}
                  >
                    Save Signature
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewLease;
