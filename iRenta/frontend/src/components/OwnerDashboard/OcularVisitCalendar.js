import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { fetchReservedDatesByOwner  } from "../../global/api/Ocular.js";
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
        setEvents(
          data.map((visit) => ({
            title: `Visit - ${visit.propertyId}`, // You can enhance this with property details
            start: new Date(`${visit.date}T${visit.time}`),
            end: new Date(`${visit.date}T${visit.time}`),
            propertyId: visit.propertyId, // Include property details for event selection
            seekerName: visit.seekerName,
            contactInfo: visit.contactInfo,
            remarks: visit.remarks,
          }))
        );
        console.log(events);
      } catch (err) {
        console.error("Failed to fetch reserved dates:", err.response?.data?.message || err.message);
      }
    };

    loadReservedDates();
  }, [authToken]);

  const handleSelectEvent = (event) => {
    alert(`
      Property Name: ${event.propertyName}
      Seeker Name: ${event.seekerName}
      Contact Info: ${event.contactInfo}
      Remarks: ${event.remarks}
      Time: ${event.start.toLocaleTimeString()} - ${event.end.toLocaleTimeString()}
    `);
  };

  useEffect(() => {
    events.forEach((event, index) => {
      console.log(`Event ${index}:`, {
        title: event.title,
        start: event.start,
        end: event.end,
      });
    });
  }, [events]);
  
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