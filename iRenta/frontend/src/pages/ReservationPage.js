import React, { useState, useEffect, useContext } from "react";
import imageCompression from "browser-image-compression";
import { ThemeContext } from "../contexts/ThemeContext";
import Topbar from "../components/global/Topbar";
import { useProperty } from "../global/contexts/PropertyContext";
import { fetchTermsById } from "../global/api/Terms";
import { createReservation, uploadValidId } from "../global/api/Reservations";
import { useNavigate } from "react-router-dom";
import { FaUpload, FaCalendarAlt, FaArrowLeft, FaCheck, FaExclamationCircle } from "react-icons/fa";
import { Footer } from "../components/global/Footer";

const ReservationPage = () => {
  const { darkMode } = useContext(ThemeContext);
  const [moveInDate, setMoveInDate] = useState("");
  const [terms, setTerms] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const { selectedProperty } = useProperty();
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Redirect if no property is selected
    if (!selectedProperty || !selectedProperty._id) {
      navigate('/browse-listing');
      return;
    }
    
    const getTerms = async () => {
      try {
        // Check if terms ID exists
        if (selectedProperty?.termsAndConditionsId) {
          console.log("Fetching terms with ID:", selectedProperty.termsAndConditionsId);
          const termsData = await fetchTermsById(selectedProperty.termsAndConditionsId);
          console.log("Terms data received:", termsData);
          setTerms(termsData);
        } else if (selectedProperty?.customTermsAndConditions) {
          // Handle custom terms if available
          console.log("Using custom terms");
          setTerms({
            title: "Custom Terms & Conditions",
            content: selectedProperty.customTermsAndConditions
          });
        } else {
          console.log("No terms available for this property");
        }
      } catch (error) {
        console.error("Error loading terms:", error);
        // Set default terms to avoid UI issues
        setTerms({
          title: "Terms & Conditions",
          content: "The property owner has not provided specific terms and conditions. Standard rental terms apply."
        });
      }
    };

    getTerms();
  }, [selectedProperty, navigate]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Clear error when file is selected
    setErrors({...errors, file: null});

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);

    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setUploadedFile(compressedFile);
    } catch (error) {
      console.error("Error compressing file:", error);
      setErrors({...errors, file: "Failed to process the file. Please try another one."});
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!moveInDate) {
      newErrors.moveInDate = "Move-in date is required";
    }
    
    if (!uploadedFile) {
      newErrors.file = "Valid ID is required";
    }
    
    if (!message.trim()) {
      newErrors.message = "Message is required";
    }
    
    if (terms?.title || terms?.content) {
      if (!agreed) {
        newErrors.agreed = "You must agree to the terms";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Add an explicit check for file before validation
    if (!uploadedFile) {
      setErrors({...errors, file: "Valid ID is required"});
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let formData = new FormData();
      formData.append("validIdFile", uploadedFile);
      formData.append("listingId", selectedProperty._id);
      formData.append("ownerId", selectedProperty.userId);
      formData.append("moveInDate", moveInDate);
      formData.append("shortMessage", message);
      formData.append("agreedToTerms", agreed);

      await createReservation(formData);

      // Successful submission
      setIsLoading(false);
      navigate('/my-reservations', { state: { success: true }});
    } catch (error) {
      console.error("Error submitting reservation:", error);
      setErrors({...errors, submit: "Failed to submit reservation. Please try again."});
      setIsLoading(false);
    }
  };

  const checkIfTermsExist = () => {
    return !!(terms?.title || terms?.content);
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <Topbar />
      
      <main className="flex-grow w-[calc(100%-200px)] max-w-[1800px] mx-auto pt-24 pb-16 px-4">
        <button 
          onClick={goBack}
          className={`flex items-center gap-2 mb-6 py-2 px-4 rounded-lg transition-colors ${
            darkMode 
              ? "text-gray-300 hover:text-white hover:bg-gray-800" 
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <FaArrowLeft /> <span>Back</span>
        </button>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column - Property Summary */}
          <div className="w-full md:w-1/3">
            <div className={`rounded-xl overflow-hidden shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <div className="h-48 overflow-hidden">
                <img 
                  src={selectedProperty?.images?.[0]?.link || "/placeholder-image.jpg"} 
                  alt={selectedProperty?.title || "Property"}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-5 space-y-4">
                <h2 className={`text-xl font-bold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                  {selectedProperty?.title || "Selected Property"}
                </h2>
                
                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  <p className="line-clamp-3 mb-2">{selectedProperty?.description}</p>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span>Price:</span>
                    <span className="font-bold">${selectedProperty?.price || "N/A"} / night</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span>Available units:</span>
                    <span className="font-bold">{selectedProperty?.vacantUnits || selectedProperty?.vacant || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Reservation Form */}
          <div className="w-full md:w-2/3">
            <div className={`p-6 rounded-xl shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <h1 className={`text-2xl font-bold mb-6 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                Reserve This Property
              </h1>

              {errors.submit && (
                <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 ${darkMode ? "bg-red-900/30 text-red-200" : "bg-red-100 text-red-700"}`}>
                  <FaExclamationCircle /> {errors.submit}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Desired Move-In Date */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Desired Move-In Date <span className="text-red-500">*</span>
                  </label>
                  <div className={`relative ${errors.moveInDate ? "mb-1" : ""}`}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaCalendarAlt className={darkMode ? "text-gray-500" : "text-gray-400"} />
                    </div>
                    <input
                      type="date"
                      value={moveInDate}
                      onChange={(e) => {
                        setMoveInDate(e.target.value);
                        if (errors.moveInDate) {
                          setErrors({...errors, moveInDate: null});
                        }
                      }}
                      min={today}
                      className={`pl-10 block w-full border rounded-lg px-4 py-3 transition-colors ${
                        darkMode
                          ? "bg-gray-700 text-white border-gray-600 focus:border-blue-500"
                          : "bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-500"
                      } ${errors.moveInDate ? (darkMode ? "border-red-500" : "border-red-500") : ""}`}
                      required
                    />
                  </div>
                  {errors.moveInDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.moveInDate}</p>
                  )}
                </div>

                {/* Upload Valid ID */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Upload Valid ID <span className="text-red-500">*</span>
                    <span className="ml-1 text-xs font-normal">
                      (make sure signature is visible)
                    </span>
                  </label>
                  
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
                    darkMode 
                      ? "border-gray-600 bg-gray-700/30" 
                      : "border-gray-300 bg-gray-50"
                  } ${errors.file ? (darkMode ? "border-red-500" : "border-red-500") : ""}`}>
                    {filePreview ? (
                      <div className="space-y-3">
                        <div className="relative w-full h-40 mx-auto">
                          <img 
                            src={filePreview} 
                            alt="ID Preview" 
                            className="h-full max-h-40 mx-auto object-contain rounded"
                          />
                        </div>
                        <div className="flex justify-center">
                          <div className="relative">
                            <input
                              id="file-upload-change"
                              type="file"
                              name="validIdFile"
                              accept=".jpg,.jpeg,.png"
                              onChange={handleFileUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              aria-label="Upload a valid ID"
                            />
                            <label 
                              htmlFor="file-upload-change"
                              className={`cursor-pointer block px-4 py-2 rounded-lg text-sm font-medium ${
                                darkMode
                                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              Change File
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 py-6">
                        <FaUpload className="mx-auto text-4xl opacity-30" />
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Drag and drop your ID here, or
                        </p>
                        <div className="relative">
                          <input
                            id="file-upload"
                            type="file"
                            name="validIdFile"
                            accept=".jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            aria-label="Upload a valid ID"
                          />
                          <label 
                            htmlFor="file-upload"
                            className={`cursor-pointer inline-block px-4 py-2 rounded-lg text-sm font-medium ${
                              darkMode
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            Browse Files
                          </label>
                        </div>
                        <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                          Supported formats: JPG, JPEG, PNG
                        </p>
                      </div>
                    )}
                  </div>
                  {errors.file && (
                    <p className="mt-1 text-sm text-red-500">{errors.file}</p>
                  )}
                </div>

                {/* Message Field */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Message to the Landlord <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (errors.message) {
                        setErrors({...errors, message: null});
                      }
                    }}
                    placeholder="Introduce yourself and explain why you're interested in this property..."
                    className={`mt-1 block w-full border rounded-lg px-4 py-3 transition-colors ${
                      darkMode
                        ? "bg-gray-700 text-white border-gray-600 focus:border-blue-500 placeholder:text-gray-500"
                        : "bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-500 placeholder:text-gray-400"
                    } ${errors.message ? (darkMode ? "border-red-500" : "border-red-500") : ""}`}
                    rows={4}
                    required
                  ></textarea>
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                  )}
                </div>

                {/* Terms & Conditions */}
                {(terms?.title || terms?.content) && (
                  <div>
                    <div className={`mb-2 flex justify-between items-center ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      <span className="text-sm font-medium">Terms & Conditions</span>
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className={`text-sm ${darkMode ? "text-blue-400" : "text-blue-600"} hover:underline`}
                      >
                        Read Full Terms
                      </button>
                    </div>
                    <div className={`mt-1 block w-full border rounded-lg px-4 py-3 mb-2 ${
                      darkMode
                        ? "bg-gray-700/50 text-gray-300 border-gray-600"
                        : "bg-gray-50 text-gray-700 border-gray-300"
                    }`}>
                      <div className="max-h-32 overflow-y-auto pr-2">
                        <h3 className="font-semibold mb-2">{terms?.title || "Terms & Conditions"}</h3>
                        <div className="whitespace-pre-wrap text-sm opacity-80">
                          {terms?.content 
                            ? (terms.content.length > 150 ? `${terms.content.substring(0, 150)}...` : terms.content)
                            : "Loading terms..."}
                        </div>
                      </div>
                    </div>
                    
                    {/* Agree Checkbox */}
                    <div className={`flex items-start gap-2 ${errors.agreed ? "mb-1" : ""}`}>
                      <div className="flex items-center h-5 mt-0.5">
                        <input
                          id="terms-checkbox"
                          type="checkbox"
                          checked={agreed}
                          onChange={(e) => {
                            setAgreed(e.target.checked);
                            if (errors.agreed) {
                              setErrors({...errors, agreed: null});
                            }
                          }}
                          className={`h-4 w-4 rounded border focus:ring-2 focus:ring-offset-2 ${
                            darkMode
                              ? "bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600 focus:ring-offset-gray-800"
                              : "bg-white border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-white"
                          } ${errors.agreed ? "border-red-500" : ""}`}
                          required
                        />
                      </div>
                      <label
                        htmlFor="terms-checkbox"
                        className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        I confirm that I have read and agree to the terms and conditions <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.agreed && (
                      <p className="mt-1 text-sm text-red-500">{errors.agreed}</p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      darkMode
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaCheck /> Submit Reservation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className={`relative w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 rounded-xl shadow-xl ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
            <button
              type="button"
              className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full ${
                darkMode 
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setShowTermsModal(false)}
            >
              ×
            </button>

            <h3 className={`text-xl font-bold mb-4 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
              {terms?.title || "Terms & Conditions"}
            </h3>

            <div className={`whitespace-pre-wrap text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              {terms?.content || "No terms available for this property. Please contact the property owner for more information."}
            </div>
            
            <div className="mt-6 pt-4 border-t flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setAgreed(true);
                  setShowTermsModal(false);
                  if (errors.agreed) {
                    setErrors({...errors, agreed: null});
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  darkMode
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom scrollbar styles */}
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
      </style>
      
      <Footer />
    </div>
  );
};

export default ReservationPage;
