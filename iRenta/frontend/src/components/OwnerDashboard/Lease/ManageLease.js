import React, { useState, useEffect, useContext } from "react";
import CreateLease from "./CreateLease.js";
import EditLease from "./EditLease.js";
import ViewLease from "./ViewLease.js";
import {
  fetchLeases,
  downloadPdf,
  updateLease,
} from "../../../global/api/Leases.js";
import { ThemeContext } from "../../../contexts/ThemeContext";
import { AiFillEdit } from "react-icons/ai";
import { IoDocumentText, IoDownload, IoSend } from "react-icons/io5";
import { MdDelete } from "react-icons/md";

const ManageLease = () => {
  const { darkMode } = useContext(ThemeContext); // Access ThemeContext for dark mode
  const [view, setView] = useState("LeaseHub");
  const [leases, setLeases] = useState([]);
  const [selectedLeaseId, setSelectedLeaseId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filteredLeases, setFilteredLeases] = useState([]);

  // Fetch leases from the backend
  useEffect(() => {
    const getLeases = async () => {
      try {
        const data = await fetchLeases();
        setLeases(data);
        setFilteredLeases(data);
      } catch (err) {
        console.error("Failed to fetch leases:", err);
      }
    };
    getLeases();
  }, []);

  const handleDownload = (leaseId) => {
    if (!leaseId) {
      console.error("Error: leaseId is undefined.");
      return;
    }
    console.log("Downloading PDF for lease ID:", leaseId);
    downloadPdf(leaseId);
  };

  const handleSend = async (leaseId) => {
    try {
      await updateLease(leaseId, { status: "Ready" });
      alert("Lease marked as ready to send!");
      const updatedLeases = await fetchLeases();
      setLeases(updatedLeases);
      setFilteredLeases(updatedLeases);
    } catch (err) {
      console.error("Failed to update lease status:", err);
      alert("Failed to mark lease as ready to send.");
    }
  };

  const handleFilterChange = (e) => {
    const status = e.target.value;
    setFilterStatus(status);
    if (status) {
      setFilteredLeases(leases.filter((lease) => lease.status === status));
    } else {
      setFilteredLeases(leases); // Show all leases when no filter is selected
    }
  };

  return (
    <div
      className={`mt-16 flex-grow p-6 pb-4 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-200 text-black"
      }`}
    >
      {view === "LeaseHub" ? (
        <>
          <h1 className="text-2xl font-bold mb-6">Lease Hub</h1>

          {/* Create Lease and Filter Buttons */}
          <div className="mb-4 flex flex-wrap gap-4">
            <button
              onClick={() => setView("CreateLease")}
              className={`px-4 py-2 rounded text-sm font-medium ${
                darkMode
                  ? "bg-green-600 text-white hover:bg-green-500"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              Create Lease
            </button>
            <select
              value={filterStatus}
              onChange={handleFilterChange}
              className={`px-4 py-2 border rounded text-sm ${
                darkMode
                  ? "bg-gray-800 text-white border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                  : "bg-white text-black border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            >
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Ready">Ready</option>
              <option value="Pending">Pending</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>

          {/* Leases Table */}
          <div className="overflow-x-auto">
            <table
              className={`min-w-full border shadow-md rounded-lg ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <thead className={darkMode ? "bg-gray-700" : "bg-gray-100"}>
                <tr>
                  {[
                    "Property Name",
                    "Tenant",
                    "Landlord",
                    "Rent Amount",
                    "Status",
                    "Actions",
                    "File",
                  ].map((header) => (
                    <th
                      key={header}
                      className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLeases.map((lease) => (
                  <tr
                    key={lease?._id}
                    className={`border-b text-center ${
                      darkMode ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {lease?.property.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {lease?.tenant || lease?.tenantPlaceholder?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {lease?.landlordName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      ₱ {lease?.contractDetails.rentAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {lease?.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        className={`px-4 py-2 text-lg font-bold rounded ${
                          darkMode
                            ? "bg-blue-600 text-white hover:bg-blue-500"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                        onClick={() => {
                          setSelectedLeaseId(lease?._id);
                          setView("EditLease");
                        }}
                      >
                        <AiFillEdit />
                      </button>
                      <button
                        className={`ml-2 px-4 py-2 text-lg font-bold rounded ${
                          darkMode
                            ? "bg-green-600 text-white hover:bg-green-500"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                        onClick={() => {
                          setSelectedLeaseId(lease?._id);
                          setView("ViewLease");
                        }}
                      >
                        <IoDocumentText />
                      </button>
                      {lease?.status === "Draft" ? (
                        <button
                          className={`ml-2 px-4 py-2 text-lg font-bold rounded ${
                            darkMode
                              ? "bg-red-600 text-white hover:bg-red-500"
                              : "bg-red-500 text-white hover:bg-red-600"
                          }`}
                          onClick={() => handleSend(lease._id)}
                        >
                          <MdDelete />
                        </button>
                      ) : (
                        <button
                          className={`ml-2 px-4 py-2 text-lg font-bold rounded ${
                            darkMode
                              ? "bg-orange-600 text-white hover:bg-orange-500"
                              : "bg-orange-500 text-white hover:bg-orange-600"
                          }`}
                          onClick={() => handleSend(lease._id)}
                        >
                          <IoSend />
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        className={`px-4 py-2 text-lg font-bold rounded ${
                          darkMode
                            ? "bg-blue-600 text-white hover:bg-blue-500"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                        onClick={() => handleDownload(lease._id)}
                        disabled={!lease._id}
                      >
                        <IoDownload />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : view === "CreateLease" ? (
        <CreateLease
          onLeaseCreated={async () => {
            const updatedLeases = await fetchLeases();
            setLeases(updatedLeases);
            setFilteredLeases(updatedLeases);
            setView("LeaseHub");
          }}
        />
      ) : view === "ViewLease" ? (
        <ViewLease leaseId={selectedLeaseId} />
      ) : (
        <EditLease
          leaseId={selectedLeaseId}
          onLeaseUpdated={async () => {
            const updatedLeases = await fetchLeases();
            setLeases(updatedLeases);
            setFilteredLeases(updatedLeases);
            setView("LeaseHub");
          }}
        />
      )}
    </div>
  );
};

export default ManageLease;
