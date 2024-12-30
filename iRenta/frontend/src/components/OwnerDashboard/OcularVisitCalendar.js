import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { fetchReservedDatesByOwner } from "../../global/api/Ocular.js";
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
            title: `Visit - ${visit.propertyId?.title || "Unknown Property"}`,
            start: new Date(visitDate),
            end: new Date(visitDate.getTime() + 60 * 60 * 1000), // 1-hour event
            propertyId: visit.propertyId._id,
            propertyName: visit.propertyId.title,
            seekerName: `${visit.userId.info.firstName} ${visit.userId.info.lastName}`,
            contactInfo: visit.userId.info.phoneNumber,
            remarks: visit.userId.credentials.email, // Add email or any additional info
          };
        });

        setEvents(mappedEvents);
        console.log("Mapped Events:", mappedEvents);
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
    alert(`
      Property Name: ${event.propertyName}
      Seeker Name: ${event.seekerName}
      Contact Info: ${event.contactInfo}
      Remarks: ${event.remarks}
      Time: ${event.start.toLocaleTimeString()} - ${event.end.toLocaleTimeString()}
    `);
  };

  return (
    <div className="pt-20 pb-4">
      <div className="p-4 w-full h-full bg-gray-100 rounded-md shadow overflow-hidden">
        <div>
          <h1 className="text-2xl font-bold mb-4">Ocular Visit Planner</h1>
        </div>

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
      </div>
    </div>
  );
};

export default OcularVisitCalendar;
