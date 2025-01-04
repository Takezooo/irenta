import React, { useState, useEffect, useContext } from "react";
import CreateContract from "./CreateContract";
import EditContract from "./EditContract";
import ViewContract from "./ViewContract";
import { fetchContracts, downloadPdf, updateContractStatus } from "../../../global/api/Contracts.js";
import { ThemeContext } from "../../../contexts/ThemeContext"; // Import ThemeContext for dark mode

const ContractHub = () => {
  const { darkMode } = useContext(ThemeContext); // Access dark mode state
  const [view, setView] = useState("ContractHub");
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [status, setStatus] = useState("Pending");

  const handleDownload = (contractId) => {
    if (!contractId) {
      console.error("Error: contractId is undefined.");
      return;
    }
    console.log("Downloading PDF for contract ID:", contractId);
    downloadPdf(contractId);
  };

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
  }, []);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const getTextColor = () => {
    switch (status) {
      case "Pending":
        return "text-orange-500";
      case "Active":
        return "text-blue-500";
      case "Terminated":
        return "text-red-500";
      case "Completed":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div
      className={`mt-16 flex-grow p-6 pb-4 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      {view === "ContractHub" ? (
        <>
          <h1 className="text-2xl font-bold mb-6">Contract Hub</h1>

          {/* Create and Upload Contract Button */}
          <div className="mb-4 flex flex-wrap gap-4">
            <button
              onClick={() => setView("CreateContract")}
              className={`px-4 py-2 text-sm font-medium rounded ${
                darkMode
                  ? "bg-green-600 text-white hover:bg-green-500"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              Create Contract
            </button>
          </div>

          {/* Contracts Table */}
          <div className="overflow-x-auto">
            <table
              className={`min-w-full border shadow-md rounded-lg ${
                darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              <thead
                className={`${
                  darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                }`}
              >
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Property Name
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Landlord
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Rent Amount
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    File
                  </th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr
                    key={contract?._id}
                    className={`text-center ${
                      darkMode ? "border-b border-gray-700" : "border-b border-gray-200"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {contract?.property.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {contract?.tenant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {contract?.landlordName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      ${contract?.contractDetails.rentAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        className={`mt-1 border rounded px-2 py-1 text-sm font-medium ${
                          darkMode
                            ? `bg-gray-700 text-white border-gray-600 ${getTextColor()}`
                            : `bg-white text-black border-gray-300 ${getTextColor()}`
                        }`}
                        value={status}
                        onChange={handleStatusChange}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Active">Active</option>
                        <option value="Terminated">Terminated</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {contract.status === "Pending" ? (
                        <button
                          className={`px-4 py-2 text-xs font-bold rounded ${
                            darkMode
                              ? "bg-blue-600 text-white hover:bg-blue-500"
                              : "bg-blue-500 text-white hover:bg-blue-600"
                          }`}
                          onClick={() => {
                            setSelectedContractId(contract?._id);
                            setView("EditContract");
                          }}
                        >
                          Edit
                        </button>
                      ) : (
                        <button
                          className="px-4 py-2 text-xs font-bold rounded bg-gray-300 text-gray-500 cursor-not-allowed"
                          disabled
                        >
                          Edit
                        </button>
                      )}
                      <button
                        className={`ml-2 px-4 py-2 text-xs font-bold rounded ${
                          darkMode
                            ? "bg-green-600 text-white hover:bg-green-500"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                        onClick={() => {
                          setSelectedContractId(contract?._id);
                          setView("ViewContract");
                        }}
                      >
                        View
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        className={`px-4 py-2 text-xs font-bold rounded ${
                          darkMode
                            ? "bg-blue-600 text-white hover:bg-blue-500"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                        onClick={() => handleDownload(contract._id)}
                        disabled={!contract._id}
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
            const refreshContracts = async () => {
              try {
                const updatedContracts = await fetchContracts();
                setContracts(updatedContracts);
                setView("ContractHub");
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
            const refreshContracts = async () => {
              try {
                const updatedContracts = await fetchContracts();
                setContracts(updatedContracts);
                setView("ContractHub");
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
