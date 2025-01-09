import React, { useState, useEffect, useContext } from "react";
import SignaturePad from "react-signature-canvas";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../global/contexts/AuthContext";
import { ThemeContext } from "../../contexts/ThemeContext";
import { fetchLeaseById, updateLease, downloadPdf } from "../../global/api/Leases";

const ViewLease = () => {
  const location = useLocation();
  const { leaseId } = location.state || {}; // Get leaseId from state
  const [leaseDetails, setLeaseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [signatureFile, setSignatureFile] = useState(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const signaturePadRef = React.useRef();
  const { darkMode } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const userType = user.userType || "";
  console.log(leaseId);

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

  // if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleDownloadPdf = () => {
    if (leaseId) {
      downloadPdf(leaseId);
    } else {
      console.error("Lease ID is not available.");
    }
  };

  const handleAttachSignature = (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.includes("png")) {
      alert("Only PNG files with a transparent background are allowed.");
      return;
    }
    setSignatureFile(file);
  };

  const handleOpenSignaturePad = () => {
    setShowSignaturePad(true);
  };

  const handleCancelSignature = () => {
    setShowSignaturePad(false);
  };

  const handleDoneSignature = () => {
    if (signaturePadRef.current) {
      const signatureUrl = signaturePadRef.current.toDataURL("image/png");
      fetch(signatureUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "digital-signature.png", {
            type: "image/png",
          });
          setSignatureFile(file);
          setShowSignaturePad(false);
        });
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
      formData.append("isAgreed", true);
      formData.append("signature", signatureFile);

      await updateLease(leaseId, formData);
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

          {/* Actions */}
          <div className="flex flex-col w-full justify-center items-center gap-2">
            {userType === "Seeker" && (
              <>
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
                    {userType !== "Owner" && (
                      <button
                        className={
                          "my-5 w-fit px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-500"
                        }
                        onClick={handleSubmit}
                      >
                        Submit
                      </button>
                    )}

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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLease;
