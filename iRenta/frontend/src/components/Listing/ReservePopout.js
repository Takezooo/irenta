import React from "react";
import {
  AiOutlineClose,
  AiFillCheckCircle,
  AiFillCloseCircle,
} from "react-icons/ai";
import { updateReservationStatus } from "../../global/api/Reservations";

const ReservePopout = ({ property, onClose, isOwner, requestDetails }) => {
  // Dummy property data if no property is provided
  const dummyProperty = {
    title: "Modern Beachside Villa",
    images: [{ link: "/beachside-villa.jpg" }],
    price: "$250",
  };

  // Use the passed property or fall back to the dummy data
  const displayProperty = property || dummyProperty;

  // Fallback request details if none provided
  const dummyRequestDetails = {
    requesterName: "John Doe",
    dateTime: "2025-01-02 10:30 AM",
  };

  const displayRequestDetails = requestDetails || dummyRequestDetails;

  // Handle decline action
  const handleDecline = async () => {
    try {
      // Update the reservation status
      await updateReservationStatus(displayRequestDetails.id, "Declined");
      alert("Reservation declined and the Seeker has been notified!");
      onClose(); // Close the popout after the operation
    } catch (error) {
      console.error("Error declining reservation:", error);
      alert("Failed to decline reservation. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <AiOutlineClose size={24} />
        </button>

        {/* Popout Content */}
        <div className="text-center">
          {/* Conditional Rendering for Icon */}
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

          {/* Header Message */}
          <h2 className="text-2xl font-semibold text-gray-800">
            {isOwner
              ? "Reservation Request!"
              : displayRequestDetails.status === "Approved"
              ? "Reservation Confirmed!"
              : `Reservation Status: ${displayRequestDetails.status}`}
          </h2>
          {displayRequestDetails.status === "Approved" && (
            <p className="text-gray-700 mt-2 font-medium">
              Please Check Your Notification to View your Contract.
            </p>
          )}

          {/* Requester Details */}
          {isOwner && (
            <p className="text-gray-600 mt-2">
              <span className="font-medium text-gray-800">
                {displayRequestDetails.requesterName}
              </span>{" "}
              requested a reservation for{" "}
              <span className="font-medium text-gray-800">
                {displayProperty.title}
              </span>
              .
            </p>
          )}

          {/* Date and Time */}
          {isOwner && (
            <p className="text-gray-500 mt-1">
              Request Date: {displayRequestDetails.dateTime}
            </p>
          )}

          {/* Property Details */}
          <div className="mt-4 border-t pt-4">
            <img
              src={
                displayProperty.images?.[0]?.link || "/placeholder-image.jpg"
              }
              alt={displayProperty.title}
              className="w-32 h-32 mx-auto rounded-md object-cover"
            />
            <p className="text-gray-700 mt-2 font-medium">
              {displayProperty.title}
            </p>
            <p className="text-gray-500">{displayProperty.price} / night</p>
          </div>
        </div>

        {/* Owner Buttons */}
        {isOwner && (
          <div className="mt-6 flex justify-around">
            <button
              onClick={() => alert("Approved and contract sent!")}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
            >
              Approve and Send Contract
            </button>
            <button
              onClick={handleDecline}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded"
            >
              Decline
            </button>
          </div>
        )}

        {/* Close Button */}
        {!isOwner && (
          <button
            onClick={onClose}
            className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default ReservePopout;
