import React, { useState, useEffect, useContext } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useProperty } from "../../global/contexts/PropertyContext.js";
import { GetToken } from "../../global/utils/Token.js";
import {
  fetchReservedDates,
  scheduleOcularVisit,
} from "../../global/api/Ocular.js";
import { ThemeContext } from "../../contexts/ThemeContext";
import { toast } from "react-toastify";

const RequestOcularVisit = ({ onClose, onRequestVisit }) => {
  const { darkMode } = useContext(ThemeContext); // Access dark mode state
  const { selectedProperty } = useProperty();
  const [reservedDates, setReservedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch reserved dates from the backend
  useEffect(() => {
    const loadReservedDates = async () => {
      if (!selectedProperty || !selectedProperty._id) {
        console.error("Property ID is missing or invalid.");
        return;
      }

      try {
        const dates = await fetchReservedDates(selectedProperty._id);
        setReservedDates(dates); // Save reserved dates
      } catch (err) {
        console.error(
          "Failed to fetch reserved dates:",
          err.response?.data?.message || err.message
        );
      }
    };

    loadReservedDates();
  }, [selectedProperty]);

  const isTimeWithinAvailability = (time) => {
    const [startHour, startMinute] =
      selectedProperty.visitAvailability.startTime.split(":");
    const [endHour, endMinute] =
      selectedProperty.visitAvailability.endTime.split(":");
    const [selectedHour, selectedMinute] = time.split(":");

    const start = new Date();
    const end = new Date();
    const selected = new Date();

    start.setHours(startHour, startMinute);
    end.setHours(endHour, endMinute);
    selected.setHours(selectedHour, selectedMinute);

    return selected >= start && selected <= end;
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    setSelectedTime(time);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both date and time for your visit");
      return;
    }
    
    // Disable button immediately
    setSubmitting(true);
    
    try {
      // Call the parent component's function to submit the request
      await onRequestVisit(selectedDate, selectedTime);
      
      // Show success toast instead of alert
      toast.success("Visit request scheduled successfully!");
      
      // Close the popup
      onClose();
    } catch (error) {
      // Show error toast
      toast.error(error.message || "Failed to schedule visit. Please try again.");
      
      // Re-enable the button on error
      setSubmitting(false);
    }
  };

  const isDateDisabled = ({ date }) => {
    return reservedDates.some(
      (reserved) =>
        new Date(reserved.date).toDateString() === date.toDateString()
    );
  };

  if (!selectedProperty) {
    return <div>Loading property details...</div>;
  }

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full ${
        darkMode ? "bg-gray-900 bg-opacity-80" : "bg-gray-800 bg-opacity-50"
      } flex justify-center items-center z-50`}
    >
      <div
        className={`${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        } rounded-lg shadow-lg p-6 w-96`}
      >
        <h2 className="text-xl font-bold mb-4">Schedule Ocular Visit</h2>
        <form onSubmit={handleSubmit}>
          <Calendar
            onChange={setSelectedDate}
            tileDisabled={isDateDisabled}
            value={selectedDate}
            className={
              darkMode
                ? "text-black react-calendar react-calendar-dark"
                : "react-calendar"
            }
          />
          <div className="mt-4">
            <label
              htmlFor="time"
              className={`block font-medium ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Select Time (Available:{" "}
              {selectedProperty.visitAvailability.startTime} -{" "}
              {selectedProperty.visitAvailability.endTime})
            </label>
            <input
              type="time"
              id="time"
              value={selectedTime}
              onChange={handleTimeChange}
              className={`w-full mt-2 p-2 border rounded ${
                darkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-black border-gray-300"
              }`}
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded hover:bg-opacity-80 ${
                darkMode
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`${
                submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white font-bold py-2 px-4 rounded-full transition-colors`}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestOcularVisit;
