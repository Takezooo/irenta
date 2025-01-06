import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";

import { ThemeContext } from "../contexts/ThemeContext";
import Topbar from "../components/global/Topbar";
import { IoHome } from "react-icons/io5";
import { MdPayments } from "react-icons/md";
import { FaTools } from "react-icons/fa";

const TenantDashboard = () => {
  const { darkMode } = useContext(ThemeContext); // Access dark mode context
  const [activeFeature, setActiveFeature] = useState("Lease Overview"); // State for active feature
  const location = useLocation();

  // Sidebar visibility logic for `/tenant-dashboard`
  const isTenantDashboard = location.pathname.startsWith("/tenant-dashboard");

  // Dummy data
  const leaseDetails = {
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    rentAmount: "$1,500",
    paymentFrequency: "Monthly",
  };

  const paymentHistory = [
    { date: "2023-01-01", amount: "$1,500", status: "Paid" },
    { date: "2023-02-01", amount: "$1,500", status: "Paid" },
    { date: "2023-03-01", amount: "$1,500", status: "Pending" },
  ];

  const maintenanceRequests = [
    {
      id: 1,
      description: "Leaking faucet in the kitchen",
      status: "Pending",
      image: "https://via.placeholder.com/150",
    },
    {
      id: 2,
      description: "Broken window in the living room",
      status: "In Progress",
      image: "https://via.placeholder.com/150",
    },
    {
      id: 3,
      description: "Heating not working in the bedroom",
      status: "Completed",
      image: "https://via.placeholder.com/150",
    },
  ];

  return (
    <div className={` ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-200 text-black"
      }`}>
      <Topbar />
      {/* Sidebar */}
      {isTenantDashboard && (
        <>
            {/* Desktop Sidebar */}
            <aside
            className={`hidden lg:inline-block fixed ml-4 top-20 left-0 z-40 w-64 h-[90%] transform transition-all duration-300 ease-in-out bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md`}
            >
            <div className="flex flex-col justify-between h-full py-3">
                <div className="flex flex-col items-center space-y-2 font-medium">
                <h1 className="text-2xl font-bold mb-6">Tenant Dashboard</h1>
                <button
                    onClick={() => setActiveFeature("Lease Overview")}
                    className={`flex items-center w-full py-3 px-6 hover:bg-gray-200 dark:hover:bg-gray-600 group ${
                    activeFeature === "Lease Overview"
                        ? "bg-gray-300 dark:bg-gray-700"
                        : ""
                    }`}
                >
                    <IoHome
                    className="text-xl text-blue-700 dark:text-blue-400 transition duration-75 group-hover:text-gray-900 dark:group-hover:text-gray-300"
                    />
                    <span className="ml-2 p-1 opacity-90 text-sm font-medium text-black dark:text-white ms-3 whitespace-nowrap">
                    Lease Overview
                    </span>
                </button>
                <button
                    onClick={() => setActiveFeature("Payment History")}
                    className={`flex items-center w-full py-3 px-6 hover:bg-gray-200 dark:hover:bg-gray-600 group ${
                    activeFeature === "Payment History"
                        ? "bg-gray-300 dark:bg-gray-700"
                        : ""
                    }`}
                >
                    <MdPayments
                    className="text-xl text-blue-700 dark:text-blue-400 transition duration-75 group-hover:text-gray-900 dark:group-hover:text-gray-300"
                    />
                    <span className="ml-2 p-1 opacity-90 text-sm font-medium text-black dark:text-white ms-3 whitespace-nowrap">
                    Payment History
                    </span>
                </button>
                <button
                    onClick={() => setActiveFeature("Request Maintenance")}
                    className={`flex items-center w-full py-3 px-6 hover:bg-gray-200 dark:hover:bg-gray-600 group ${
                    activeFeature === "Request Maintenance"
                        ? "bg-gray-300 dark:bg-gray-700"
                        : ""
                    }`}
                >
                    <FaTools
                    className="text-xl text-blue-700 dark:text-blue-400 transition duration-75 group-hover:text-gray-900 dark:group-hover:text-gray-300"
                    />
                    <span className="ml-2 p-1 opacity-90 text-sm font-medium text-black dark:text-white ms-3 whitespace-nowrap">
                    Request Maintenance
                    </span>
                </button>
                </div>
            </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 shadow-md z-50">
            <div className="flex justify-around py-3">
                <button
                onClick={() => setActiveFeature("Lease Overview")}
                className={`flex flex-col items-center text-blue-500 dark:text-blue-400 ${
                    activeFeature === "Lease Overview"
                    ? "text-blue-900 dark:text-blue-500"
                    : ""
                }`}
                >
                <IoHome size={24} />
                <span className="text-xs dark:text-white">Lease Overview</span>
                </button>
                <button
                onClick={() => setActiveFeature("Payment History")}
                className={`flex flex-col items-center text-blue-500 dark:text-blue-400 ${
                    activeFeature === "Payment History"
                    ? "text-blue-900 dark:text-blue-500"
                    : ""
                }`}
                >
                <MdPayments size={24} />
                <span className="text-xs dark:text-white">Payment History</span>
                </button>
                <button
                onClick={() => setActiveFeature("Request Maintenance")}
                className={`flex flex-col items-center text-blue-500 dark:text-blue-400 ${
                    activeFeature === "Request Maintenance"
                    ? "text-blue-900 dark:text-blue-500"
                    : ""
                }`}
                >
                <FaTools size={24} />
                <span className="text-xs dark:text-white">Request Maintenance</span>
                </button>
            </div>
            </div>
        </>
        )}

      <div
        className={`transition-all duration-300 mx-4 mt-16 lg:mt-0 ${
          isTenantDashboard ? "lg:ml-72" : ""
        }`}
      >
        
        <div
          className={`pt-20 flex-grow p-6 pb-4 min-h-screen ${
            darkMode ? "bg-gray-900 text-white" : "bg-gray-200 text-black"
          }`}
        >
            {activeFeature === "Lease Overview" && (
                <div
                className={`p-6 rounded-lg shadow-md mb-6 ${
                    darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
                >
                <h2 className="text-xl font-semibold mb-4">Lease Overview</h2>
                <p>
                    <strong>Start Date:</strong> {leaseDetails.startDate}
                </p>
                <p>
                    <strong>End Date:</strong> {leaseDetails.endDate}
                </p>
                <p>
                    <strong>Rent Amount:</strong> {leaseDetails.rentAmount}
                </p>
                <p>
                    <strong>Payment Frequency:</strong>{" "}
                    {leaseDetails.paymentFrequency}
                </p>
                </div>
                
            )}
            {activeFeature === "Payment History" && (
                <div
                className={`p-6 rounded-lg shadow-md mb-6 ${
                    darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
                >
                <h2 className="text-xl font-semibold mb-4">
                    Rent Payment History
                </h2>
                <table className="w-full border-collapse">
                    <thead>
                    <tr>
                        <th
                        className={`px-4 py-2 ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                        >
                        Date
                        </th>
                        <th
                        className={`px-4 py-2 ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                        >
                        Amount
                        </th>
                        <th
                        className={`px-4 py-2 ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                        >
                        Status
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {paymentHistory.map((payment, index) => (
                        <tr
                        key={index}
                        className={`border-t text-center ${
                            darkMode ? "border-gray-700" : "border-gray-200"
                        }`}
                        >
                        <td className="px-4 py-2">{payment.date}</td>
                        <td className="px-4 py-2">{payment.amount}</td>
                        <td className="px-4 py-2">{payment.status}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}
            {activeFeature === "Request Maintenance" && (
            <div
                className={`p-6 rounded-lg shadow-md ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}
            >
                <h2 className="text-xl font-semibold mb-4">Request Maintenance</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {maintenanceRequests.map((request) => (
                    <div
                    key={request.id}
                    className={`p-4 rounded-lg shadow-md ${
                        darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"
                    }`}
                    >
                    <img
                        src={request.image}
                        alt="Maintenance Issue"
                        className="rounded-lg w-full h-64 object-cover mb-4"
                    />
                    <h3 className="text-lg font-semibold mb-2">Maintenance Request</h3>
                    <p className="text-sm">
                        <strong>Description:</strong> {request.description}
                    </p>
                    <p className="text-sm">
                        <strong>Status:</strong> {request.status}
                    </p>
                    </div>
                ))}
                </div>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;
