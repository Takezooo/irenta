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
  const [signatureBase64, setSignatureBase64] = useState("");
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
    // converts the data into a readable image
    if (leaseDetails?.uploadedOwnerSignature === "No Uploaded Signature") {
      return;
    } else {
      const byteArray = new Uint8Array(
        leaseDetails?.uploadedOwnerSignature?.data.data
      );
      const base64String = btoa(
        byteArray.reduce((data, byte) => data + String.fromCharCode(byte), "")
      );
      setSignatureBase64(
        `data:${leaseDetails?.uploadedOwnerSignature?.contentType};base64,${base64String}`
      );
    }
  }, [leaseDetails]);

  // if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleDownloadPdf = () => {
    if (leaseId) {
      downloadPdf(leaseId);
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
      maxSizeMB: 0.5, // Compress to 1MB
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

        alert("File compressed and saved successfully!");
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
      formData.append("status", "Signed");
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
  
      console.log("Payload to be sent to registerTenant:", tenantData);
  
      // Register user as waitlisted and update tenantBadge
      await registerToWaitlist(tenantData);

      // Send notification to owner
      await sendNotification(leaseDetails.landlord, {
        type: "SignedContract",
        leaseId: leaseId,
        message: `Lease Agreement has been signed by ${userProfile?.info?.firstName} ${userProfile?.info?.lastName}`,
      });

      alert("Lease updated and sent back to the owner.");

      setSignatureFile(null); // Clear temporary file
    } catch (error) {
      console.error("Error submitting lease:", error);
      alert("Failed to submit lease. Please try again.");
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

          {/* Placeholder for Owner's Signature */}
          <div className="mt-6">
            <h2
              className={`text-xl font-semibold ${
                darkMode ? "text-gray-300" : "text-gray-800"
              }`}
            >
              Owner's Signature
            </h2>
            <div className="flex justify-center mt-4">
              {leaseDetails?.uploadedOwnerSignature ? (
                <img
                  src={signatureBase64}
                  alt="Owner's Signature"
                  className="w-48 h-32 object-contain border border-gray-300"
                />
              ) : (
                <div
                  className={`w-48 h-32 flex items-center justify-center border ${
                    darkMode
                      ? "border-gray-600 bg-gray-700 text-gray-300"
                      : "border-gray-300 bg-gray-200 text-gray-600"
                  }`}
                >
                  No Signature Provided
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col w-full justify-center items-center gap-2">
            <div className="text-center space-y-4">
              <label className="block">
                <input
                  type="checkbox"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                />
                <span className="ml-2">
                  I Agree to the Terms and Conditions
                </span>
              </label>

              <div>
                <input
                  type="file"
                  accept="image/png"
                  onChange={handleAttachSignature}
                />
                <button
                  className={
                    "my-5 w-fit px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500"
                  }
                  onClick={handleOpenSignaturePad}
                >
                  Digital Signature
                </button>
              </div>

              <div className="flex justify-center gap-5 mt-4">
                <button
                  className={
                    "my-5 w-fit px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-500"
                  }
                  onClick={handleSubmit}
                >
                  Submit
                </button>

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
              </div>
            </div>
            {/* Digital Signature Pop-Up */}
            {showSignaturePad && (
              <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 ">
                <div className="bg-white p-4 rounded shadow-lg">
                  <SignaturePad ref={signaturePadRef} />
                  <div className="flex justify-center gap-3 mt-4">
                    <button
                      className={
                        "my-5 w-fit px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500"
                      }
                      onClick={handleCancelSignature}
                    >
                      Cancel
                    </button>
                    <button
                      className={
                        "my-5 w-fit px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-500"
                      }
                      onClick={handleDoneSignature}
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLease;
