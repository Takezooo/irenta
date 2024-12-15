import React, { useState } from "react";
import { IoCloseCircleOutline } from "react-icons/io5"; // Import React Icons
import { useNavigate } from "react-router-dom"; // React Router hook for navigation

const RequestOcularVisit = () => {
  const navigate = useNavigate(); // For navigation to previous page
  const [formData, setFormData] = useState({
    visitorName: "",
    visitDate: "",
    visitTime: "",
    propertyName: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(""); // Clear error message when user interacts
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const { visitDate, visitTime } = formData;
    const currentDateTime = new Date();
    const selectedDateTime = new Date(`${visitDate}T${visitTime}`);

    if (selectedDateTime < currentDateTime) {
      setError("Date and time of visit cannot be in the past.");
      return;
    }

    setError("");
    console.log("Request Submitted:", formData);
    setIsSubmitted(true);
  };

  // Handle Back/Close Action
  const handleClose = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md relative">
        {/* Close/Back Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition"
        >
          <IoCloseCircleOutline size={28} />
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Request for Visit
        </h1>

        {isSubmitted ? (
          <div className="text-center">
            <h2 className="text-green-600 font-semibold text-lg">
              Request Submitted Successfully!
            </h2>
            <p className="text-gray-700 mt-2">
              We will confirm your visit soon. Thank you for your interest!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Visitor Name */}
            <div>
              <label
                htmlFor="visitorName"
                className="block text-sm font-medium text-gray-700"
              >
                Visitor Name
              </label>
              <input
                type="text"
                id="visitorName"
                name="visitorName"
                placeholder="Enter your full name"
                value={formData.visitorName}
                onChange={handleChange}
                required
                className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date of Visit */}
            <div>
              <label
                htmlFor="visitDate"
                className="block text-sm font-medium text-gray-700"
              >
                Date of Visit
              </label>
              <input
                type="date"
                id="visitDate"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleChange}
                required
                className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Time of Visit */}
            <div>
              <label
                htmlFor="visitTime"
                className="block text-sm font-medium text-gray-700"
              >
                Time of Visit
              </label>
              <input
                type="time"
                id="visitTime"
                name="visitTime"
                value={formData.visitTime}
                onChange={handleChange}
                required
                className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Property Name or Address */}
            <div>
              <label
                htmlFor="propertyName"
                className="block text-sm font-medium text-gray-700"
              >
                Property Name or Address
              </label>
              <input
                type="text"
                id="propertyName"
                name="propertyName"
                placeholder="Enter the property name or address"
                value={formData.propertyName}
                onChange={handleChange}
                required
                className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm font-semibold mt-2">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Submit Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RequestOcularVisit;