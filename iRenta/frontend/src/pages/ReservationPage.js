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
      maxSizeMB: 1, // Compress to 1MB
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
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Terms & Conditions
              </label>
              <p
                className={`mt-1 block w-full border rounded-md px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 text-gray-300 border-gray-600"
                    : "bg-gray-50 text-gray-700 border-gray-300"
                }`}
              >
                {terms.content}
              </p>
            </div>
          )}
          {/* Submit Additional Documents */}
          {selectedProperty?.askForValidId === true && (
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
                accept=".jpg,.jpeg,.png,.pdf" // Restrict file types
                onChange={handleFileUpload}
                className={`mt-1 block w-full border rounded-md px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-50 text-black border-gray-300"
                }`}
              />
            </div>
          )}

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
          {checkIfTermsExist() && (
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
          )}

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
};

export default ReservationPage;
