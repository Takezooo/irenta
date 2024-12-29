import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useProperty } from "../../global/contexts/PropertyContext.js";
import { GetToken } from "../../global/utils/Token.js";
import {
  fetchReservedDates,
  scheduleOcularVisit,
} from "../../global/api/Ocular.js";

const RequestOcularVisit = ({ onClose }) => {
  const { selectedProperty } = useProperty();
  const [reservedDates, setReservedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(true);

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

  // Check if selected time is within the available range
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
    if (isTimeWithinAvailability(time)) {
      setSelectedTime(time);
    } else {
      alert("Selected time is outside the available hours.");
    }
  };

  // Submit the ocular visit schedule using the API utility
  const handleSubmit = async () => {
    if (!selectedDate) {
      alert("Please select a date.");
      return;
    }

    if (!selectedTime) {
      alert("Please select a time.");
      return;
    }

    try {
      await scheduleOcularVisit(
        selectedProperty._id,
        selectedDate,
        selectedTime
      );
      alert("Ocular visit scheduled successfully!");
      onClose();
    } catch (err) {
      alert(
        `Failed to schedule ocular visit: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  // Disable tiles in the calendar for already reserved dates
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
    <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Schedule Ocular Visit</h2>
        <Calendar
          onChange={setSelectedDate}
          tileDisabled={isDateDisabled}
          value={selectedDate}
        />
        <div className="mt-4">
          <label htmlFor="time" className="block font-medium text-gray-700">
            Select Time (Available:{" "}
            {selectedProperty.visitAvailability.startTime} -{" "}
            {selectedProperty.visitAvailability.endTime})
          </label>
          <input
            type="time"
            id="time"
            value={selectedTime}
            onChange={handleTimeChange}
            className="w-full mt-2 p-2 border rounded"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestOcularVisit;
