import React, { useState, useEffect, useContext } from "react";
import {
  AiOutlineClose,
  AiFillCheckCircle,
  AiFillCloseCircle,
} from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import {
  updateReservationStatus,
  fetchReservationById,
} from "../../global/api/Reservations";
import { ThemeContext } from "../../contexts/ThemeContext"; // Import ThemeContext for dark mode

const ReservePopout = ({
  property,
  onClose,
  isOwner,
  requestDetails,
  setActiveContent,
}) => {
  const { darkMode } = useContext(ThemeContext); // Access dark mode state
  const [isLoading, setIsLoading] = useState(false);
  const [validIdBase64, setValidIdBase64] = useState("");
  // const [reservation, setReservation] = useState(null);
  const navigate = useNavigate();

  const dummyProperty = {
    title: "Modern Beachside Villa",
    images: [{ link: "/beachside-villa.jpg" }],
    price: "$250",
  };

  const displayProperty = property || dummyProperty;

  const dummyRequestDetails = {
    requesterName: "John Doe",
    dateTime: "2025-01-02 10:30 AM",
  };

  const displayRequestDetails = requestDetails || dummyRequestDetails;
  console.log(displayRequestDetails);

  useEffect(() => {
    // converts the data into a readable image
    const byteArray = new Uint8Array(
      displayRequestDetails.uploadedValidId.data.data
    );
    const base64String = btoa(
      byteArray.reduce((data, byte) => data + String.fromCharCode(byte), "")
    );
    setValidIdBase64(
      `data:${displayRequestDetails.uploadedValidId.contentType};base64,${base64String}`
    );
  }, [displayRequestDetails.uploadedValidId]);

  const handleDecline = async () => {
    try {
      await updateReservationStatus(displayRequestDetails.id, "Declined");
      alert("Reservation declined and the Seeker has been notified!");
      onClose();
    } catch (error) {
      console.error("Error declining reservation:", error);
      alert("Failed to decline reservation. Please try again.");
    }
  };

  const handleApprove = async () => {
    if (!displayRequestDetails.id) {
      alert("Reservation ID is missing. Cannot approve the request.");
      return;
    }

    setIsLoading(true);
    try {
      await updateReservationStatus(displayRequestDetails.id, "Approved");
      navigate("/owner-dashboard", {
        state: {
          contentActive: "content6",
          anotherState: displayRequestDetails.seekerId,
        },
      });
    } catch (error) {
      console.error("Error approving reservation:", error);
      alert("Failed to approve reservation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 ${
        darkMode ? "bg-gray-900 bg-opacity-80" : "bg-black bg-opacity-50"
      } flex items-center justify-center z-50`}
    >
      <div
        className={`rounded-lg shadow-lg max-w-md w-full p-6 relative ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${
            darkMode
              ? "text-gray-300 hover:text-gray-100"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <AiOutlineClose size={24} />
        </button>

        {/* Popout Content */}
        <div className="text-center">
          {!isOwner && displayRequestDetails.status === "Approved" ? (
            <AiFillCheckCircle
              size={48}
              className="text-green-500 mx-auto mb-4"
            />
          ) : (
            <AiFillCloseCircle
              size={48}
              className="text-red-500 mx-auto mb-4"
            />
          )}

          <h2
            className={`text-2xl font-semibold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {isOwner
              ? "Reservation Request!"
              : displayRequestDetails.status === "Approved"
              ? "Reservation Confirmed!"
              : `Reservation Status: ${displayRequestDetails.status}`}
          </h2>
          {displayRequestDetails.status === "Approved" && (
            <p
              className={`mt-2 font-medium ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Please Check Your Notification to View your Contract.
            </p>
          )}

          {isOwner && (
            <p
              className={`mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              <span
                className={`font-medium ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {displayRequestDetails.requesterName}
              </span>{" "}
              requested a reservation for{" "}
              <span
                className={`font-medium ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {displayProperty.title}
              </span>
              .
            </p>
          )}

          {isOwner && (
            <p
              className={`mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              Request Date: {displayRequestDetails.dateTime}
            </p>
          )}

          <div className="mt-4 border-t pt-4">
            <img
              src={
                displayProperty.images?.[0]?.link || "/placeholder-image.jpg"
              }
              alt={displayProperty.title}
              className="w-32 h-32 mx-auto mb-2 rounded-md object-cover"
            />
            <p
              className={`font-medium text-lg ${
                darkMode ? "text-white" : "text-gray-700"
              }`}
            >
              {displayProperty.title}
            </p>
            <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {displayProperty.price} / night
            </p>
          </div>
          {isOwner && (
            <div className="flex mt-4 border-t pt-4 justify-evenly items-center">
              <div>
                <img
                  src={validIdBase64 || "/placeholder-image.jpg"}
                  alt="Valid ID"
                  className="w-48 h-32 rounded-md object-cover"
                />
              </div>
              <div className="text-left">
                <button
                  onClick={handleApprove}
                  className={`font-medium py-2 px-4 rounded ${
                    darkMode
                      ? "bg-blue-600 hover:bg-blue-500 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  Download
                </button>
              </div>
            </div>
          )}
        </div>

        {isOwner && (
          <div className="mt-6 border-t pt-4 flex justify-around">
            <button
              onClick={handleApprove}
              className={`font-medium py-2 px-4 rounded ${
                darkMode
                  ? "bg-green-600 hover:bg-green-500 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              Approve and Send Contract
            </button>
            <button
              onClick={handleDecline}
              className={`font-medium py-2 px-4 rounded ${
                darkMode
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              Decline
            </button>
          </div>
        )}

        {!isOwner && (
          <button
            onClick={onClose}
            className={`mt-6 font-medium py-2 px-4 rounded ${
              darkMode
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default ReservePopout;
