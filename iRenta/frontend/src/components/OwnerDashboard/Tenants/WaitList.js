import { useContext } from "react";
import { moveToRenterList } from "../../../global/api/Reservations";
import { ThemeContext } from "../../../contexts/ThemeContext";

export const Waitlist = ({ reservations = [] }) => {
  const { darkMode } = useContext(ThemeContext); // Access dark mode context

  if (!reservations.length) {
    return (
      <p
        className={`${
          darkMode ? "text-gray-400" : "text-gray-500"
        }`}
      >
        No reservations in the waitlist.
      </p>
    );
  }

  return (
    <div>
      <h2
        className={`text-xl font-bold mb-4 ${
          darkMode ? "text-white" : "text-black"
        }`}
      >
        Waitlist
      </h2>
      {reservations.map((reservation) => (
        <div
          key={reservation?._id}
          className={`mb-4 p-4 border rounded shadow-md ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
          }`}
        >
          <p
            className={`${
              darkMode ? "text-gray-300" : "text-gray-800"
            }`}
          >
            {reservation?.seekerId?.info?.firstName || "Unknown Seeker"}
          </p>
          <button
            onClick={() => moveToRenterList(reservation.seekerId)}
            className={`px-4 py-2 rounded text-white ${
              darkMode
                ? "bg-green-600 hover:bg-green-500"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            Move to Renter
          </button>
        </div>
      ))}
    </div>
  );
};
