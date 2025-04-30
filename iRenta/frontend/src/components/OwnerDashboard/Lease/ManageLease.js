import React, { useState, useEffect, useContext } from "react";
import CreateLease from "./CreateLease.js";
import EditLease from "./EditLease.js";
import ViewLease from "./ViewLease.js";
import {
  fetchLeases,
  downloadPdf,
  updateLease,
  sendLeaseToSeeker,
} from "../../../global/api/Leases.js";
import { ThemeContext } from "../../../contexts/ThemeContext";
import { AiFillEdit } from "react-icons/ai";
import { IoDocumentText, IoDownload, IoSend } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import imageCompression from "browser-image-compression";
import SignaturePad from "react-signature-canvas";
import { fetchSeekersWithReservations } from '../../../global/api/Reservations.js';
import { toast } from "react-toastify";

const ManageLease = ({ seekerId }) => {
  const passedSeekerId = seekerId || "";
  const { darkMode } = useContext(ThemeContext); // Access ThemeContext for dark mode
  const [view, setView] = useState("LeaseHub");
  const [leases, setLeases] = useState([]);
  const [selectedLeaseId, setSelectedLeaseId] = useState(null);
  const [toBeSendLease, setToBeSendLease] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filteredLeases, setFilteredLeases] = useState([]);
  const [showTenantModal, setShowTenantModal] = useState(false); // Modal visibility
  const [tenantId, setTenantId] = useState(""); // Tenant ID from modal
  const [signatureFile, setSignatureFile] = useState(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const signaturePadRef = React.useRef();
  const [seekers, setSeekers] = useState([]);

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

  useEffect(() => {
    if (showTenantModal) {
      const fetchSeekers = async () => {
        try {
          const data = await fetchSeekersWithReservations();
          setSeekers(data);
        } catch (err) {
          console.error('Failed to fetch seekers with reservations:', err);
        }
      };
      fetchSeekers();
    }
  }, [showTenantModal]);

  const handleAttachSignature = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.includes("png")) {
      toast.error("Only PNG files with a transparent background are allowed.");
      return;
    }
    const options = {
      maxSizeMB: 0.5, // Compress to 1MB
      maxWidthOrHeight: 1024, // Resize dimensions
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setSignatureFile(compressedFile);
      toast.success("File compressed successfully!");
    } catch (error) {
      console.error("Error compressing file:", error);
      toast.error("Failed to compress the file.");
    }
  };

  const handleOpenSignaturePad = () => {
    setShowSignaturePad(true);
  };

  const handleCancelSignature = () => {
    setShowSignaturePad(false);
  };

  const handleDoneSignature = async () => {
    if (signaturePadRef.current) {
      const signatureUrl = signaturePadRef.current.toDataURL("image/png");

      try {
        // Fetch the signature as a blob
        const res = await fetch(signatureUrl);
        const blob = await res.blob();

        // Create a file object from the blob
        const file = new File([blob], "digital-signature.png", {
          type: "image/png",
        });

        // Compression options
        const options = {
          maxSizeMB: 0.5, // Target size in MB
          maxWidthOrHeight: 1024, // Maximum dimensions
          useWebWorker: true, // Use web worker for better performance
        };

        // Compress the file
        const compressedFile = await imageCompression(file, options);

        // Save the compressed file to state
        setSignatureFile(compressedFile);

        // Hide the signature pad
        setShowSignaturePad(false);

        toast.success("File compressed and saved successfully!");
      } catch (error) {
        console.error("Error handling the signature:", error);
        toast.error("Failed to process the signature. Please try again.");
      }
    }
  };

  const handleDownload = (leaseId) => {
    if (!leaseId) {
      console.error("Error: leaseId is undefined.");
      return;
    }
    downloadPdf(leaseId);
  };

  const handleSubmit = async (leaseId) => {
    setShowSignatureModal(false);
    const targetSeekerId = passedSeekerId || tenantId;

    if (!signatureFile) {
      toast.error("Please attach a signature or draw a digital signature.");
      return;
    }

    if (!targetSeekerId) {
      setShowTenantModal(true);
      return;
    }

    // Fetch the lease to check required fields
    const lease = leases.find(l => l._id === leaseId);
    if (!lease || !lease.property || !lease.tenant || !lease.contractDetails) {
      toast.error("Please ensure all required lease details are filled before sending.");
      return;
    }
    const rb = lease.contractDetails.rentBreakdown || {};
    if (
      !rb.baseRent ||
      !lease.contractDetails.startDate ||
      !lease.contractDetails.endDate ||
      !lease.contractDetails.paymentFrequency ||
      !lease.contractDetails.termsAndConditionsId ||
      !lease.contractDetails.rulesAndRegulations ||
      !lease.contractDetails.renewalTerms
    ) {
      toast.error("Please ensure all required lease details are filled before sending.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("isSignedByLandlord", true);
      formData.append("uploadedOwnerSignature", signatureFile);
      formData.append("tenant", typeof targetSeekerId === "object" ? targetSeekerId._id : targetSeekerId);
      await updateLease(leaseId, formData);

      await sendLeaseToSeeker(leaseId); // Call sendLeaseToSeeker API to send the lease

      // Update lease status to 'Sent' in the local state
      setLeases(prevLeases => prevLeases.map(l => l._id === leaseId ? { ...l, status: 'Sent' } : l));
      setFilteredLeases(prevLeases => prevLeases.map(l => l._id === leaseId ? { ...l, status: 'Sent' } : l));

      // Only show a single toast for success (handled in sendLeaseToSeeker)

      const updatedLeases = await fetchLeases();
      setLeases(updatedLeases);
      setFilteredLeases(updatedLeases);
    } catch (err) {
      console.error("Failed to update lease status:", err);
      toast.error("Failed to mark lease as ready to send.");
    }
  };

  const handleSend = (lease) => {
    const targetSeekerId = passedSeekerId || tenantId;

    if (!targetSeekerId) {
      // Show tenant modal if seeker ID is not provided
      setShowTenantModal(true);
    } else {
      // Otherwise, show the signature modal
      setToBeSendLease(lease);
      setShowSignatureModal(true);
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

  const handleModalSubmit = () => {
    if (tenantId) {
      setShowTenantModal(false);
      setShowSignatureModal(true); // Open the signature modal after tenant ID is provided
    } else {
      toast.error("Please provide a valid Tenant ID.");
    }
  };

  return (
    <div
      className={`mt-16 flex-grow p-6 pb-4 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-200 text-black"
      }`}
    >
      {/* Tenant Modal */}
      {showTenantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-lg shadow-md ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
            }`}
          >
            <h2 className="text-xl font-bold mb-4">Select Tenant</h2>
            <select
              value={tenantId}
              onChange={e => setTenantId(e.target.value)}
              className={`w-full px-4 py-2 rounded mb-4 ${
                darkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-gray-200 border-gray-300"
              }`}
            >
              <option value="">Select a tenant</option>
              {seekers.map(seeker => (
                <option key={seeker._id} value={seeker._id}>
                  {seeker.firstName} {seeker.lastName}
                </option>
              ))}
            </select>
            <div className="flex justify-end">
              <button
                onClick={() => setShowTenantModal(false)}
                className={`px-4 py-2 rounded mr-2 ${
                  darkMode
                    ? "bg-gray-600 hover:bg-gray-500 text-white"
                    : "bg-gray-300 hover:bg-gray-400 text-black"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                className={`px-4 py-2 rounded ${
                  darkMode
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

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
                  {["Property Name", "Tenant", "Total Rent", "Status", "Actions", "File"].map((header) => (
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
                {filteredLeases.map((lease) => {
                  // Calculate total rent
                  const rb = lease?.contractDetails?.rentBreakdown || {};
                  const baseRent = parseFloat(rb.baseRent) || 0;
                  const utilities = parseFloat(rb.utilities) || 0;
                  const amenities = parseFloat(rb.amenities) || 0;
                  let otherFees = 0;
                  if (Array.isArray(rb.otherFees)) {
                    otherFees = rb.otherFees.reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0);
                  } else if (typeof rb.otherFees === 'string') {
                    // If stored as string (e.g. "Name:Amount,Name:Amount")
                    otherFees = rb.otherFees.split(',').reduce((sum, fee) => {
                      const parts = fee.split(':');
                      return sum + (parseFloat(parts[1]) || 0);
                    }, 0);
                  }
                  const totalRent = baseRent + utilities + amenities + otherFees;
                  return (
                    <tr
                      key={lease?._id}
                      className={`border-b text-center ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {lease?.property?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {(lease?.tenant?.info?.firstName && lease?.tenant?.info?.lastName)
                          ? `${lease.tenant.info.firstName} ${lease.tenant.info.lastName}`
                          : lease?.tenantPlaceholder?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        ₱ {totalRent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {lease?.status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          className={`px-4 py-2 text-lg font-bold rounded ${
                            lease?.status === "Active"
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : darkMode
                                ? "bg-blue-600 text-white hover:bg-blue-500"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                          }`}
                          onClick={() => {
                            setSelectedLeaseId(lease?._id);
                            setView("EditLease");
                          }}
                          disabled={lease?.status === "Active"}
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
                        <button
                          className={`ml-2 px-4 py-2 text-lg font-bold rounded ${
                            lease?.status === "Active"
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : darkMode
                                ? "bg-orange-600 text-white hover:bg-orange-500"
                                : "bg-orange-500 text-white hover:bg-orange-600"
                          }`}
                          onClick={() => handleSend(lease._id)}
                          disabled={lease?.status === "Active"}
                        >
                          <IoSend />
                        </button>
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
                  );
                })}
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
          seekerId={passedSeekerId}
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
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-lg shadow-md ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
            }`}
          >
            <h2 className="text-xl font-bold mb-4">
              Attach or Draw Signature for {selectedLeaseId?.property?.name}
            </h2>

            {/* Attach File */}
            <div className="mb-4">
              <label
                className={`block mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-800"
                }`}
              >
                Attach Signature File (PNG only):
              </label>
              <input
                type="file"
                accept="image/png"
                onChange={handleAttachSignature}
                className={`w-full px-4 py-2 rounded ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-200 border-gray-300"
                }`}
              />
            </div>

            {/* Draw Signature */}
            <button
              onClick={handleOpenSignaturePad}
              className={`mb-4 px-4 py-2 rounded ${
                darkMode
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Draw Signature
            </button>

            {/* Signature Pad */}
            {showSignaturePad && (
              <div className="mt-4">
                <SignaturePad ref={signaturePadRef} />
                <div className="flex justify-center gap-3 mt-4">
                  <button
                    className={`px-4 py-2 rounded ${
                      darkMode
                        ? "bg-gray-600 text-white hover:bg-gray-500"
                        : "bg-gray-300 text-black hover:bg-gray-400"
                    }`}
                    onClick={handleCancelSignature}
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-4 py-2 rounded ${
                      darkMode
                        ? "bg-green-600 text-white hover:bg-green-500"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                    onClick={handleDoneSignature}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Submit or Cancel */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowSignatureModal(false)}
                className={`px-4 py-2 rounded mr-2 ${
                  darkMode
                    ? "bg-gray-600 text-white hover:bg-gray-500"
                    : "bg-gray-300 text-black hover:bg-gray-400"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit(toBeSendLease)}
                className={`px-4 py-2 rounded ${
                  darkMode
                    ? "bg-blue-600 text-white hover:bg-blue-500"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Send Lease
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLease;
