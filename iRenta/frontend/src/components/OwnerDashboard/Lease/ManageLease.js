import React, { useState, useEffect } from "react";
import CreateLease from "./CreateLease.js";
import EditLease from "./EditLease.js";
import ViewLease from "./ViewLease.js";
import { fetchLeases, downloadPdf, updateLease } from "../../../global/api/Leases.js";

const ManageLease = () => {
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
    <div className="mt-16 flex-grow p-6 pb-4">
      {view === "LeaseHub" ? (
        <>
          <h1 className="text-2xl font-bold mb-6">Lease Hub</h1>

          {/* Create Lease and Filter Buttons */}
          <div className="mb-4 flex flex-wrap gap-4">
            <button
              onClick={() => setView("CreateLease")}
              className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600"
            >
              Create Lease
            </button>
            <select
              value={filterStatus}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
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
            <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
              <thead className="bg-gray-100 rounded-lg">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Property Name
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Landlord
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Rent Amount
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    File
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeases.map((lease) => (
                  <tr key={lease?._id} className="text-center border-b">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {lease?.property.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {lease?.tenant || lease?.tenantPlaceholder?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {lease?.landlordName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ${lease?.contractDetails.rentAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {lease?.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        className="px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded hover:bg-blue-600"
                        onClick={() => {
                          setSelectedLeaseId(lease?._id);
                          setView("EditLease");
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="ml-2 px-4 py-2 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600"
                        onClick={() => {
                          setSelectedLeaseId(lease?._id);
                          setView("ViewLease");
                        }}
                      >
                        View
                      </button>
                      {lease?.status === "Draft" && (
                        <button
                          className="ml-2 px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded hover:bg-orange-600"
                          onClick={() => handleSend(lease._id)}
                        >
                          Send
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        className="px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded hover:bg-blue-600"
                        onClick={() => handleDownload(lease._id)}
                        disabled={!lease._id}
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
      ) : view === "CreateLease" ? (
        <CreateLease
          onLeaseCreated={() => {
            const refreshLeases = async () => {
              try {
                const updatedLeases = await fetchLeases();
                setLeases(updatedLeases);
                setFilteredLeases(updatedLeases);
                setView("LeaseHub");
              } catch (err) {
                console.error("Failed to refresh leases:", err);
              }
            };
            refreshLeases();
          }}
        />
      ) : view === "ViewLease" ? (
        <ViewLease leaseId={selectedLeaseId} />
      ) : (
        <EditLease
          leaseId={selectedLeaseId}
          onLeaseUpdated={() => {
            const refreshLeases = async () => {
              try {
                const updatedLeases = await fetchLeases();
                setLeases(updatedLeases);
                setFilteredLeases(updatedLeases);
                setView("LeaseHub");
              } catch (err) {
                console.error("Failed to refresh leases:", err);
              }
            };
            refreshLeases();
          }}
        />
      )}
    </div>
  );
};

export default ManageLease;
