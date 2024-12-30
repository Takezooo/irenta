import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import {
  fetchReservedDatesByOwner,
  updateOcularRequest,
} from "../../global/api/Ocular.js";
import { sendNotification } from "../../global/api/Notifications.js";
import { GetToken } from "../../global/utils/Token.js";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Localization for date-fns
const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export const OcularVisitCalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // Selected event for the modal
  const [showModal, setShowModal] = useState(false); // Control modal visibility
  const authToken = GetToken();

  // Load reserved dates from the backend
  useEffect(() => {
    const loadReservedDates = async () => {
      try {
        const data = await fetchReservedDatesByOwner(authToken);

        // Map the fetched data to the format required by the Calendar component
        const mappedEvents = data.map((visit) => {
          const visitDate = new Date(visit.date);
          const [hours, minutes] = visit.time.split(":");
          visitDate.setHours(hours, minutes);

          return {
            id: visit._id,
            title: `Visit - ${visit.propertyId?.title || "Unknown Property"}`,
            start: new Date(visitDate),
            end: new Date(visitDate.getTime() + 60 * 60 * 1000), // 1-hour event
            propertyId: visit.propertyId._id,
            propertyName: visit.propertyId.title,
            seekerId: visit.userId._id,
            seekerName: `${visit.userId.info.firstName} ${visit.userId.info.lastName}`,
            contactInfo: visit.userId.info.phoneNumber,
            email: visit.userId.credentials.email,
            remarks: visit.remarks,
          };
        });

        setEvents(mappedEvents);
      } catch (err) {
        console.error(
          "Failed to fetch reserved dates:",
          err.response?.data?.message || err.message
        );
      }
    };

    loadReservedDates();
  }, [authToken]);

  // Handle selecting an event
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  // Close the popup
  const closePopup = () => {
    setSelectedEvent(null);
    setShowModal(false);
  };

  // Handle approve or decline
  const handleAction = async (action) => {
    if (!selectedEvent) return;

    const confirmed = window.confirm(
      `Are you sure you want to ${action.toLowerCase()} this visit request?`
    );

    if (confirmed) {
      try {
        // Update remarks in the database
        await updateOcularRequest(selectedEvent.id, action);

        // Send notification to seeker
        await sendNotification(selectedEvent.seekerId, {
          type: "VisitResponse",
          message: `Your visit request for ${
            selectedEvent.propertyName
          } was ${action.toLowerCase()}.`,
          propertyId: selectedEvent.propertyId,
        });

        // Update local state
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === selectedEvent.id
              ? { ...event, remarks: action }
              : event
          )
        );

        alert(`Request ${action.toLowerCase()} successfully.`);
        closePopup();
      } catch (err) {
        console.error("Failed to update request:", err);
        alert("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="pt-20 pb-4">
      <div className="p-4 w-full h-full bg-gray-100 rounded-md shadow overflow-hidden">
        <h1 className="text-2xl font-bold mb-4">Ocular Visit Planner</h1>

        <div className="mt-8">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            onSelectEvent={handleSelectEvent}
          />
        </div>

        {/* Modal for Event Details */}
        {showModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4">
                Visit Details - {selectedEvent.propertyName}
              </h2>
              <p>
                <strong>Seeker Name:</strong> {selectedEvent.seekerName}
              </p>
              <p>
                <strong>Contact Info:</strong> {selectedEvent.contactInfo}
              </p>
              <p>
                <strong>Email:</strong> {selectedEvent.email}
              </p>
              <p>
                <strong>Remarks:</strong> {selectedEvent.remarks}
              </p>
              <p>
                <strong>Time:</strong>{" "}
                {selectedEvent.start.toLocaleTimeString()} -{" "}
                {selectedEvent.end.toLocaleTimeString()}
              </p>
              <div className="flex gap-4 mt-4">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  onClick={() => handleAction("Approved")}
                >
                  Approve
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={() => handleAction("Declined")}
                >
                  Decline
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  onClick={closePopup}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OcularVisitCalendar;
