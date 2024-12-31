import React from "react";
import { AiOutlineClose, AiFillCheckCircle } from "react-icons/ai";

const ReservePopout = ({ property, onClose }) => {
  // Dummy property data if no property is provided
  const dummyProperty = {
    title: "Modern Beachside Villa",
    images: [{ link: "/beachside-villa.jpg" }], // Replace with an actual image URL or placeholder
    price: "$250",
  };

  // Use the passed property or fall back to the dummy data
  const displayProperty = property || dummyProperty;

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
          {/* Confirmation Icon */}
          <AiFillCheckCircle size={48} className="text-green-500 mx-auto mb-4" />

          {/* Confirmation Message */}
          <h2 className="text-2xl font-semibold text-gray-800">
            Reservation Confirmed!
          </h2>
          <p className="text-gray-600 mt-2">
            You have successfully reserved{" "}
            <span className="font-medium text-gray-800">
              {displayProperty.title}
            </span>.
          </p>
          <p className="text-gray-600 mt-1">Enjoy your stay!</p>

          {/* Property Details */}
          <div className="mt-4 border-t pt-4">
            <img
              src={displayProperty.images?.[0]?.link || "/placeholder-image.jpg"}
              alt={displayProperty.title}
              className="w-32 h-32 mx-auto rounded-md object-cover"
            />
            <p className="text-gray-700 mt-2 font-medium">
              {displayProperty.title}
            </p>
            <p className="text-gray-500">{displayProperty.price} / night</p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ReservePopout;