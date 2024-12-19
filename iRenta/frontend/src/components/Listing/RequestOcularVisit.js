import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { GetToken } from "../../global/utils/Token";
const RequestOcularVisit = ({ propertyId, onClose }) => {
  const [reservedDates, setReservedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchReservedDates = async () => {
      const token = GetToken(); // Ensure token is retrieved
      try {
        const response = await axios.get(`/api/ocular/reserved-dates/${propertyId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReservedDates(response.data.map((date) => new Date(date)));
      } catch (err) {
        console.error("Failed to fetch reserved dates:", err);
      }
    };

    if (propertyId) fetchReservedDates();
  }, [propertyId]);

  const handleSubmit = async () => {
    const token = GetToken();
    try {
      await axios.post(
        "/api/ocular/schedule",
        { propertyId, date: selectedDate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Ocular visit scheduled successfully!");
      setReservedDates([...reservedDates, selectedDate]);
      onClose(); // Close the modal
    } catch (err) {
      alert(err.response?.data?.message || "Failed to schedule ocular visit");
    }
  };

  const tileDisabled = ({ date }) =>
    reservedDates.some((reservedDate) => reservedDate.toDateString() === date.toDateString());

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Schedule Ocular Visit</h2>
        <Calendar
          onChange={setSelectedDate}
          tileDisabled={tileDisabled}
          value={selectedDate}
        />
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
