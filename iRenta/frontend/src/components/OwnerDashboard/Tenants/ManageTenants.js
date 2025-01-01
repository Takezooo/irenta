import React, { useState } from "react";
import { Waitlist } from "./WaitList.js";
const ManageTenant = () => {
  const [tenants] = useState([
    {
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
    <div className="mt-16 flex-grow p-6 pb-4">
      <h1 className="text-2xl font-bold mb-6">Manage Tenants</h1>

      <Waitlist></Waitlist>

      {/* Tenants Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
          <thead className="bg-gray-100 rounded-lg">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Property Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Gender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Date of Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Remarks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Requests
              </th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant, index) => (
              <tr key={index} className="border-b">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {tenant.propertyName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {tenant.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {tenant.gender}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {tenant.startDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {tenant.endDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {tenant.paymentDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {tenant.remarks}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
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
