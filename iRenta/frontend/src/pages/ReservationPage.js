import React, { useState, useEffect, useContext } from "react";
import imageCompression from "browser-image-compression";
import { ThemeContext } from "../contexts/ThemeContext";
import Topbar from "../components/global/Topbar";
import { useProperty } from "../global/contexts/PropertyContext";
import { fetchTermsById } from "../global/api/Terms";
import { createReservation, uploadValidId } from "../global/api/Reservations";

const ReservationPage = () => {
  const { darkMode } = useContext(ThemeContext);
  const [moveInDate, setMoveInDate] = useState("");
  const [terms, setTerms] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const { selectedProperty } = useProperty();
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  console.log(selectedProperty);

  useEffect(() => {
    const getTerms = async () => {
      try {
        const termsData = await fetchTermsById(
          selectedProperty?.termsAndConditionsId
        );
        setTerms(termsData);
      } catch (error) {
        console.error("Error loading terms:", error);
      }
    };

    if (checkIfTermsExist()) {
      getTerms();
      console.log(terms);
    }
  }, [selectedProperty.termsAndConditionsId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const options = {
      maxSizeMB: 0.5, // Compress to 1MB
      maxWidthOrHeight: 1024, // Resize dimensions
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setUploadedFile(compressedFile); // Save the compressed file for upload
      alert("File compressed successfully!");
    } catch (error) {
      console.error("Error compressing file:", error);
      alert("Failed to compress the file.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (checkIfTermsExist()) {
      if (!agreed && selectedProperty?.termsAndConditionsId) {
        alert("You must agree to the terms before submitting.");
        return;
      }
    }

    if (!moveInDate) {
      alert("Move-in date is required.");
      return;
    }

    setIsLoading(true);

    try {
      let formData = new FormData();

      // Add the file to the FormData object if a file is provided
      if (uploadedFile) {
        formData.append("validIdFile", uploadedFile);
      }

      // Add other reservation fields to FormData
      formData.append("listingId", selectedProperty._id);
      formData.append("ownerId", selectedProperty.userId);
      formData.append("moveInDate", moveInDate);
      formData.append("shortMessage", message);

      await createReservation(formData);

      alert("Reservation request submitted successfully!");
      setIsLoading(false);
      setMoveInDate("");
      setUploadedFile(null);
      setMessage("");
      setAgreed(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error submitting reservation:", error);
      alert("An error occurred while submitting your reservation.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfTermsExist = () => {
    if (
      selectedProperty.termsAndConditionsId === undefined &&
      selectedProperty.customTermsAndConditions === undefined
    ) {
      return false;
    } else {
      return true;
    }
  };

  return (
    <div>
      <Topbar />
      <div
        className={`min-h-screen p-8 mt-16 ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
        }`}
      >
        <h1
          className={`text-3xl font-bold mb-6 ${
            darkMode ? "text-blue-400" : "text-blue-600"
          }`}
        >
          Submit Reservation Request
        </h1>

        <form
          onSubmit={handleSubmit}
          className={`space-y-6 max-w-3xl mx-auto ${
            darkMode ? "bg-gray-800" : "bg-white"
          } shadow-md rounded-lg p-6`}
        >
          {/* Desired Move-In Date */}
          <div>
            <label
              className={`block text-sm font-medium ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Desired Move-In Date
            </label>
            <input
              type="date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              className={`mt-1 block w-full border rounded-md px-4 py-2 ${
                darkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-gray-50 text-black border-gray-300"
              }`}
              required
            />
          </div>

          {/* Agreement Review */}
          {checkIfTermsExist() && (
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Terms & Conditions
              </label>
              <div
                className={`mt-1 block w-full border rounded-md px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 text-gray-300 border-gray-600"
                    : "bg-gray-50 text-gray-700 border-gray-300"
                }`}
              >
                <div className="max-h-48 overflow-y-auto">
                  <h3 className="font-semibold mb-2">{terms.title}</h3>
                  <div className="whitespace-pre-wrap text-sm">
                    {terms.content?.length > 300 ? (
                      <>
                        {terms.content.substring(0, 300)}...
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className={`ml-2 text-sm ${
                            darkMode ? "text-blue-400" : "text-blue-600"
                          } hover:underline`}
                        >
                          Read More
                        </button>
                      </>
                    ) : (
                      terms.content
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Submit Additional Documents */}
          <div>
            <label
              className={`block text-sm font-medium ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Upload Valid ID
              <span className="text-xs">
                (make sure that the signature is visible)
              </span>
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png" // Restrict file types
              onChange={handleFileUpload}
              className={`mt-1 block w-full border rounded-md px-4 py-2 ${
                darkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-gray-50 text-black border-gray-300"
              }`}
            />
          </div>

          {/* Message Field */}
          <div>
            <label
              className={`block text-sm font-medium ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Message to the Landlord
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`mt-1 block w-full border rounded-md px-4 py-2 ${
                darkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-gray-50 text-black border-gray-300"
              }`}
              rows={4}
            ></textarea>
          </div>

          {/* Agree Checkbox */}

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className={`mr-2 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300 text-black"
              }`}
            />
            <label
              className={`text-sm ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              I agree to the terms and conditions
            </label>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 rounded-md font-medium ${
                darkMode
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }  ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Submitting..." : "Submit Reservation Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  {
    showTermsModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div
          className={`relative w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 rounded-lg shadow-lg ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <button
            type="button"
            className={`absolute top-4 right-4 text-2xl ${
              darkMode ? "text-gray-300" : "text-gray-600"
            } hover:opacity-75`}
            onClick={() => setShowTermsModal(false)}
          >
            ×
          </button>

          <h3
            className={`text-xl font-bold mb-4 ${
              darkMode ? "text-gray-200" : "text-gray-800"
            }`}
          >
            {terms.title}
          </h3>

          <div
            className={`whitespace-pre-wrap text-sm ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {terms.content}
          </div>
        </div>
      </div>
    );
  }

  <style>
    {`
    .overflow-y-auto::-webkit-scrollbar {
      width: 6px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-track {
      background: ${darkMode ? "#374151" : "#f3f4f6"};
      border-radius: 3px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-thumb {
      background: ${darkMode ? "#4B5563" : "#CBD5E0"};
      border-radius: 3px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
      background: ${darkMode ? "#6B7280" : "#A0AEC0"};
    }
  `}
  </style>;
};

export default ReservationPage;
