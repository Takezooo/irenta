import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import Topbar from "../components/global/Topbar";
import { useProperty } from "../global/contexts/PropertyContext";
import { fetchTermsById } from "../global/api/Terms";

const ReservationPage = () => {
  const { darkMode } = useContext(ThemeContext);
  const [moveInDate, setMoveInDate] = useState("");
  const [terms, setTerms] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const { selectedProperty } = useProperty();

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

  const handleFileUpload = (e) => {
    setUploadedFiles([...e.target.files]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreed) {
      alert("You must agree to the terms before submitting.");
      console.log(selectedProperty);
      return;
    }

    // Submit logic here
    alert("Reservation request submitted successfully!");
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
          {selectedProperty?.isDocumentRequest === true && (
            <div>
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Upload Additional Documents (e.g., IDs, Proof of Income)
              </label>
              <input
                type="file"
                multiple
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
              className={`px-6 py-2 rounded-md font-medium ${
                darkMode
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Submit Reservation Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationPage;
