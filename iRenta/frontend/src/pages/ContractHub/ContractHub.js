import React from "react";

const ContractHub = () => {
  // Placeholder contracts
  const contracts = [
    {
      id: 1,
      propertyName: "Greenwood Apartment",
      tenant: "John Doe",
      landlord: "Jane Smith",
      rentAmount: "$1,500",
      status: "Active",
    },
    {
      id: 2,
      propertyName: "Sunset Villas",
      tenant: "Alice Brown",
      landlord: "Bob Johnson",
      rentAmount: "$2,000",
      status: "Pending",
    },
    {
      id: 3,
      propertyName: "Blue Lagoon Condo",
      tenant: "Charlie Davis",
      landlord: "Diana Ross",
      rentAmount: "$1,200",
      status: "Completed",
    },
  ];

  return (
      <div className="mt-16 flex-grow p-6 pb-4 sm:ml-64">
        <h1 className="text-2xl font-bold mb-6">Contract Hub</h1>

        {/* Contracts Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
            <thead className="bg-gray-100 rounded-lg">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Property Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Landlord
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Rent Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.id} className="border-b">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {contract.propertyName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {contract.tenant}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {contract.landlord}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {contract.rentAmount}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      contract.status === "Active"
                        ? "text-green-600"
                        : contract.status === "Pending"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    {contract.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      className="px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded hover:bg-blue-600"
                      onClick={() => alert(`Viewing details for ${contract.propertyName}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
};

export default ContractHub;
