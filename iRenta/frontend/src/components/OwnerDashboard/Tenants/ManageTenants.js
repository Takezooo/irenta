import React, { useState, useContext } from "react";
import { Waitlist } from "./WaitList";
import { ThemeContext } from "../../../contexts/ThemeContext";

const ManageTenant = () => {
  const { darkMode } = useContext(ThemeContext); // Access dark mode context
  const [tenants] = useState([
    {
      _id: "1",
      propertyName: "Sunrise Apartments",
      name: "John Doe",
      gender: "Male",
      startDate: "2023-01-01",
      endDate: "2023-12-31",
      paymentDate: "2023-10-01",
      remarks: "Good tenant",
      requests: "Requested for painting the walls",
    },
    {
      _id: "2",
      propertyName: "Downtown Condo",
      name: "Jane Smith",
      gender: "Female",
      startDate: "2022-06-01",
      endDate: "2023-05-31",
      paymentDate: "2023-09-15",
      remarks: "Always on time",
      requests: "Requested for new furniture",
    },
    {
      _id: "3",
      propertyName: "Lakeside Villa",
      name: "Mark Johnson",
      gender: "Male",
      startDate: "2023-02-01",
      endDate: "2023-11-30",
      paymentDate: "2023-10-05",
      remarks: "Quiet tenant",
      requests: "Requested for internet upgrade",
    },
  ]);

  return (
    <div
      className={`mt-16 flex-grow p-6 pb-4 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-200 text-black"
      }`}
    >
      <h1 className="text-2xl font-bold mb-6">Manage Tenants</h1>

      {/* Waitlist Section */}
      <div className="mb-8">
        <Waitlist />
      </div>

      {/* Tenants Table */}
      <div className="overflow-x-auto">
        <table
          className={`min-w-full border shadow-md rounded-lg ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <thead
            className={`${
              darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
            }`}
          >
            <tr>
              {[
                "Property Name",
                "Name",
                "Gender",
                "Start Date",
                "End Date",
                "Date of Payment",
                "Remarks",
                "Requests",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant, index) => (
              <tr
                key={index}
                className={`border-b ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {tenant.propertyName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {tenant.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {tenant.gender}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {tenant.startDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {tenant.endDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {tenant.paymentDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {tenant.remarks}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {tenant.requests}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageTenant;
