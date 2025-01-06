import React, { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import Topbar from "../components/global/Topbar";

const AboutPage = () => {
  const { darkMode } = useContext(ThemeContext); // Access dark mode context

  return (
    <div>
        <Topbar />
        <div
        className={`min-h-screen mt-16 flex items-center justify-center ${
            darkMode ? "bg-gray-900" : "bg-gray-100"
        }`}
        >
        <div
            className={`w-[90%] max-w-4xl rounded-lg p-6 md:p-12 ${
            darkMode
                ? "bg-gray-700 text-gray-300"
                : "bg-white text-gray-800"
            } shadow-lg`}
            style={{
            backgroundImage: `url('https://your-image-link-here')`, // Replace with your actual image URL
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: "overlay",
            filter: "brightness(0.7)",
            }}
        >
            <div className="bg-opacity-80 p-6 md:p-12">
            <h1
                className={`text-3xl md:text-4xl font-bold mb-6 ${
                darkMode ? "text-white" : "text-gray-800"
                }`}
            >
                About Us
            </h1>
            <p className="mb-6 leading-relaxed">
                At DingDorm we are committed to providing simple, safe, and
                affordable accommodations to students and young professionals.
            </p>

            <div className="space-y-4">
                <div>
                <h2
                    className={`text-xl font-semibold ${
                    darkMode ? "text-white" : "text-gray-800"
                    }`}
                >
                    Students:
                </h2>
                <p className="leading-relaxed">
                    Students will benefit for the reason that the system will make
                    it easier to find a place to stay. They can review the available
                    rooms, see what the dormitory offers, and know the costs
                    upfront. This makes the whole process less stressful and more
                    straightforward, making their time at their respective study
                    smoother. The students who are satisfied with their dormitory
                    experience are most likely to fulfill their academic goals.
                </p>
                </div>
                <div>
                <h2
                    className={`text-xl font-semibold ${
                    darkMode ? "text-white" : "text-gray-800"
                    }`}
                >
                    Dorm Owners:
                </h2>
                <p className="leading-relaxed">
                    The system will help the dorm owners or dorm landlords, as well
                    as the staff in identifying and adjusting in different areas of
                    improvement in their services and facilities which leads to the
                    satisfaction of their borders and attracts future clients. It
                    may also give them a wider reach whilst seeking new tenants or
                    lessees.
                </p>
                </div>
                <div>
                <h2
                    className={`text-xl font-semibold ${
                    darkMode ? "text-white" : "text-gray-800"
                    }`}
                >
                    Researchers:
                </h2>
                <p className="leading-relaxed">
                    This study may help them with current data on the dormitory and
                    what is the student’s housing preferences and trends. This
                    information may help them to better understand how students
                    live on campus and give them ideas on how to make dorm life
                    better. The possible outcome of the study will also help the
                    researchers gain information on what to improve and change if
                    they wish to create another revision of the system.
                </p>
                </div>
            </div>
            </div>
        </div>
        </div>
    </div>
  );
};

export default AboutPage;
