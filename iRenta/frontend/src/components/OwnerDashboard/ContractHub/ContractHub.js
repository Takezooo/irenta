import React, { useState, useEffect } from "react";
import CreateContract from "./CreateContract";
import EditContract from "./EditContract";
import ViewContract from "./ViewContract"; // Import the ViewContract component
import { fetchContracts, downloadPdf, updateContractStatus } from "../../../api/Contracts.js"; // Import the API function to fetch and update contracts

const ContractHub = () => {
  const [view, setView] = useState("ContractHub"); // State to toggle between views
  const [contracts, setContracts] = useState([]); // State to store fetched contracts
  const [selectedContractId, setSelectedContractId] = useState(null); // Track the contract being edited or viewed

  const handleDownload = (contractId) => {
    if (!contractId) {
      console.error("Error: contractId is undefined.");
      return;
    }
    console.log("Downloading PDF for contract ID:", contractId);
    downloadPdf(contractId);
  };

  // Fetch contracts from the backend
  useEffect(() => {
    const getContracts = async () => {
      try {
        const data = await fetchContracts();
        setContracts(data);
      } catch (err) {
        console.error("Failed to fetch contracts:", err);
      }
    };

    getContracts();
  }, []); // Run once on component mount

  return (
    <div className="mt-16 flex-grow p-6 pb-4">
      {view === "ContractHub" ? (
        <>
          <h1 className="text-2xl font-bold mb-6">Contract Hub</h1>

          {/* Create and Upload Contract Button */}
          <div className="mb-4 flex flex-wrap gap-4">
            <button
              onClick={() => setView("CreateContract")}
              className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600"
            >
              Create Contract
            </button>
          </div>

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    File
                  </th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr key={contract?._id} className="border-b">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {contract?.property.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {contract?.tenant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {contract?.landlordName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ${contract?.contractDetails.rentAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <select
                        className="border border-gray-300 rounded px-2 py-1 text-sm font-semibold"
                        value={contract.status}
                      >
                        <option className="text-orange-500" value="Pending">Pending</option>
                        <option className="text-blue-500" value="Active">Active</option>
                        <option className="text-red-500" value="Expired">Terminated</option>
                        <option className="text-green-500" value="Expired">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {contract.status === "Pending" ? (
                        <button
                          className="px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded hover:bg-blue-600"
                          onClick={() => {
                            setSelectedContractId(contract?._id); // Set the selected contract ID
                            setView("EditContract"); // Switch to the EditContract view
                          }}
                        >
                          Edit
                        </button>
                      ) : (
                        <button
                          className="px-4 py-2 bg-gray-300 text-gray-500 text-xs font-bold rounded cursor-not-allowed"
                          disabled
                        >
                          Edit
                        </button>
                      )}
                      <button
                        className="ml-2 px-4 py-2 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600"
                        onClick={() => {
                          setSelectedContractId(contract?._id); // Set the selected contract ID
                          setView("ViewContract"); // Switch to the ViewContract view
                        }}
                      >
                        View
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        className="px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded hover:bg-blue-600"
                        onClick={() => handleDownload(contract._id)}
                        disabled={!contract._id} // Disable the button if _id is missing
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : view === "CreateContract" ? (
        <CreateContract
          onContractCreated={() => {
            // Fetch the contracts again after creating a new one
            const refreshContracts = async () => {
              try {
                const updatedContracts = await fetchContracts();
                setContracts(updatedContracts);
                setView("ContractHub"); // Go back to Contract Hub view
              } catch (err) {
                console.error("Failed to refresh contracts:", err);
              }
            };

            refreshContracts();
          }}
        />
      ) : view === "ViewContract" ? (
        <ViewContract contractId={selectedContractId} />
      ) : (
        <EditContract
          contractId={selectedContractId}
          onContractUpdated={() => {
            // Fetch the contracts again after updating
            const refreshContracts = async () => {
              try {
                const updatedContracts = await fetchContracts();
                setContracts(updatedContracts);
                setView("ContractHub"); // Go back to Contract Hub view
              } catch (err) {
                console.error("Failed to refresh contracts:", err);
              }
            };

            refreshContracts();
          }}
        />
      )}
    </div>
  );
};

export default ContractHub;
