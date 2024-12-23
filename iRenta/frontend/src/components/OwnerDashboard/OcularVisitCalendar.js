import React from "react"; 
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
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
  const ocularRequests = [
    {
      propertyName: "Modern Apartment",
      seekerName: "John Doe",
      requestedDate: "2024-12-05",
      requestedTime: "10:00 AM",
      contactInfo: "johndoe@example.com",
      remarks: "Looking forward to visiting the property.",
    },
    {
      propertyName: "Cozy Condo",
      seekerName: "Jane Smith",
      requestedDate: "2024-12-10",
      requestedTime: "2:00 PM",
      contactInfo: "janesmith@example.com",
      remarks: "Would like to check the nearby amenities.",
    },
    {
      propertyName: "Spacious Villa",
      seekerName: "Alice Brown",
      requestedDate: "2024-12-20",
      requestedTime: "1:00 PM",
      contactInfo: "alicebrown@example.com",
      remarks: "Interested in renting this property.",
    },
  ];

  // Transform ocular requests into calendar events
  const events = ocularRequests.map((request) => {
    const [year, month, day] = request.requestedDate.split("-").map(Number);
    const [hours, minutes] = request.requestedTime
      .split(":")
      .map((time) => parseInt(time));
    const isPM = request.requestedTime.includes("PM") && hours !== 12;

    return {
      title: `${request.seekerName} - ${request.propertyName}`,
      start: new Date(
        year,
        month - 1,
        day,
        isPM ? hours + 12 : hours,
        minutes
      ),
      end: new Date(
        year,
        month - 1,
        day,
        isPM ? hours + 13 : hours + 1,
        minutes
      ), // Assuming 1-hour events
      propertyName: request.propertyName,
      seekerName: request.seekerName,
      contactInfo: request.contactInfo,
      remarks: request.remarks,
    };
  });

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
