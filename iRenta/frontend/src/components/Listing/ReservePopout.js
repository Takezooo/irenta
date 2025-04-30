import React, { useState, useEffect, useContext } from "react";
import {
  AiOutlineClose,
  AiFillCheckCircle,
  AiFillCloseCircle,
  AiOutlineDownload,
  AiOutlineClockCircle,
  AiOutlineCalendar,
  AiOutlineUser,
  AiOutlineHome,
  AiOutlineDollar,
  AiOutlineFileText,
} from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { updateReservationStatus } from "../../global/api/Reservations";
import { ThemeContext } from "../../contexts/ThemeContext";
import { toast } from "react-toastify";
import { fetchLeases } from "../../global/api/Leases";

const ReservePopout = ({
  property,
  onClose,
  isOwner,
  requestDetails,
  setActiveContent,
}) => {
  const { darkMode } = useContext(ThemeContext);
  const [isLoading, setIsLoading] = useState(false);
  const [validIdBase64, setValidIdBase64] = useState("");
  const [status, setStatus] = useState("");
  const [hasAvailableLeases, setHasAvailableLeases] = useState(false);
  const [isCheckingLeases, setIsCheckingLeases] = useState(false);
  const navigate = useNavigate();

  const dummyProperty = {
    title: "Modern Beachside Villa",
    images: [{ link: "/beachside-villa.jpg" }],
    price: "$250",
  };

  const displayProperty = property || dummyProperty;

  const dummyRequestDetails = {
    requesterName: "John Doe",
    dateTime: "2025-01-02 10:30 AM",
    status: "Pending",
  };

  const displayRequestDetails = requestDetails || dummyRequestDetails;

  useEffect(() => {
    // Set initial status from request details
    setStatus(displayRequestDetails.status);
    
    // Convert valid ID to readable image
    if (displayRequestDetails.uploadedValidId === "No Uploaded Valid Id") {
      return;
    } else {
      const byteArray = new Uint8Array(
        displayRequestDetails.uploadedValidId.data.data
      );
      const base64String = btoa(
        byteArray.reduce((data, byte) => data + String.fromCharCode(byte), "")
      );
      setValidIdBase64(
        `data:${displayRequestDetails.uploadedValidId.contentType};base64,${base64String}`
      );
    }
  }, [displayRequestDetails]);

  // Check if owner has any available leases
  useEffect(() => {
    const checkForAvailableLeases = async () => {
      if (!isOwner) return;
      
      setIsCheckingLeases(true);
      try {
        const leases = await fetchLeases();
        // Check if there are any leases that can be used
        const availableLeases = leases && leases.length > 0;
        setHasAvailableLeases(availableLeases);
      } catch (error) {
        console.error("Error checking for available leases:", error);
        setHasAvailableLeases(false);
      } finally {
        setIsCheckingLeases(false);
      }
    };

    checkForAvailableLeases();
  }, [isOwner]);

  const handleDecline = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await updateReservationStatus(displayRequestDetails.id, "Declined");
      setStatus("Declined");
      toast.success("Reservation declined successfully!");
      onClose();
    } catch (error) {
      console.error("Error declining reservation:", error);
      toast.error("Failed to decline reservation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!displayRequestDetails.id || isLoading) {
      toast.error("Reservation ID is missing or request is processing.");
      return;
    }

    // Validate if owner has available leases before approving
    if (!hasAvailableLeases) {
      toast.error("You don't have any lease agreements ready to send. Please create a lease agreement first.");
      return;
    }

    setIsLoading(true);
    try {
      await updateReservationStatus(displayRequestDetails.id, "Approved");
      setStatus("Approved");
      toast.success("Reservation approved! Redirecting to send contract...");
      
      // Short delay before navigation for toast to be visible
      setTimeout(() => {
      navigate("/owner-dashboard", {
        state: {
          contentActive: "content6",
          seekerId: displayRequestDetails.seekerId,
        },
      });
      }, 1500);
    } catch (error) {
      console.error("Error approving reservation:", error);
      toast.error("Failed to approve reservation. Please try again.");
      setIsLoading(false);
    }
  };

  const handleManageLease = () => {
    if (!displayRequestDetails.seekerId) {
      toast.error("Seeker information is missing. Cannot manage lease.");
      return;
    }

    navigate("/owner-dashboard", {
      state: {
        contentActive: "content6",
        seekerId: displayRequestDetails.seekerId,
      },
    });
  };

  const handleDownload = () => {
    if (!validIdBase64) {
      toast.error("No valid ID available for download.");
      return;
    }

    // Create a temporary anchor element
    const link = document.createElement("a");
    link.href = validIdBase64;
    link.download = "ValidID.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info("Valid ID downloaded successfully.");
  };

  const isValidIdExisting = () => {
    return displayRequestDetails.uploadedValidId !== "No Uploaded Valid Id";
  };

  // Check if the reservation is already processed (approved or declined)
  const isReservationProcessed = () => {
    return status === "Approved" || status === "Declined";
  };

  // Get status display details
  const getStatusDisplay = () => {
    switch(status) {
      case "Approved":
        return { 
          icon: <AiFillCheckCircle className="text-green-500" />,
          text: "Approved",
          color: "text-green-500",
          bgColor: darkMode ? "bg-green-900/30" : "bg-green-50",
          borderColor: darkMode ? "border-green-700" : "border-green-200",
          lightBg: "bg-green-50",
          lightText: "text-green-800"
        };
      case "Declined":
        return { 
          icon: <AiFillCloseCircle className="text-red-500" />,
          text: "Declined",
          color: "text-red-500",
          bgColor: darkMode ? "bg-red-900/30" : "bg-red-50",
          borderColor: darkMode ? "border-red-700" : "border-red-200",
          lightBg: "bg-red-50",
          lightText: "text-red-800"
        };
      default:
        return { 
          icon: <AiOutlineClockCircle className="text-yellow-500" />,
          text: "Pending",
          color: "text-yellow-500",
          bgColor: darkMode ? "bg-yellow-900/30" : "bg-yellow-50",
          borderColor: darkMode ? "border-yellow-700" : "border-yellow-200",
          lightBg: "bg-yellow-50",
          lightText: "text-yellow-800"
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  const formattedDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Render the appropriate action button based on status
  const renderActionButton = () => {
    if (status === "Approved") {
      // Show Manage Lease button when status is Approved
      return (
        <button
          onClick={handleManageLease}
          className={`py-2.5 px-5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            darkMode
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          <AiOutlineFileText size={18} />
          Manage Lease
        </button>
      );
    } else if (status === "Declined") {
      // No action buttons for declined status
      return null;
    } else {
      // Show Approve and Decline buttons for pending status
      return (
        <>
          <button
            onClick={handleDecline}
            disabled={isLoading || isReservationProcessed()}
            className={`py-2.5 px-5 rounded-lg font-medium transition-all ${
              isLoading || isReservationProcessed()
                ? "bg-gray-400 cursor-not-allowed opacity-60"
                : darkMode
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {isLoading && status === "Declined" ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : "Decline"}
          </button>
          <button
            onClick={handleApprove}
            disabled={isLoading || isReservationProcessed() || isCheckingLeases || !hasAvailableLeases}
            className={`py-2.5 px-5 rounded-lg font-medium transition-all ${
              isLoading || isReservationProcessed() || isCheckingLeases || !hasAvailableLeases
                ? "bg-gray-400 cursor-not-allowed opacity-60"
                : darkMode
                  ? "bg-green-600 hover:bg-green-500 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
            }`}
            title={!hasAvailableLeases ? "You need to create a lease agreement first" : ""}
          >
            {isLoading && status === "Approved" ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : isCheckingLeases ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking Leases...
              </span>
            ) : "Approve & Send Contract"}
          </button>
        </>
      );
    }
  };

  return (
    <div
      className={`fixed inset-0 ${
        darkMode ? "bg-gray-900 bg-opacity-80" : "bg-black bg-opacity-50"
      } flex items-center justify-center z-50 p-4`}
    >
      <div
        className={`rounded-xl shadow-xl max-w-2xl w-full overflow-hidden ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        } flex flex-col`}
      >
        {/* Header with property image banner */}
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={displayProperty.images?.[0]?.link || "/placeholder-image.jpg"}
            alt={displayProperty.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          
          {/* Close button */}
        <button
          onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-2 bg-black/40 text-white hover:bg-black/60 transition-colors"
            aria-label="Close"
          >
            <AiOutlineClose size={20} />
        </button>

          {/* Property title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">{displayProperty.title}</h2>
            <div className="flex items-center mt-1">
              <AiOutlineDollar className="text-white mr-1" />
              <p className="text-white font-medium">{displayProperty.price} / night</p>
            </div>
          </div>
        </div>
        
        {/* Status banner */}
        <div className={`py-3 px-6 flex items-center justify-between ${statusDisplay.bgColor} ${darkMode ? "border-t border-b" : "border-b"} ${statusDisplay.borderColor}`}>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold">Status:</span>
            <div className="flex items-center gap-1.5">
              {statusDisplay.icon}
              <span className={`font-medium ${statusDisplay.color}`}>{statusDisplay.text}</span>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold">
            {isOwner
              ? "Reservation Request"
              : status === "Approved"
              ? "Reservation Confirmed"
              : "Reservation Status"}
          </h3>
        </div>

        <div className="overflow-auto max-h-[60vh]">
          {/* Reservation details section */}
          <div className={`p-6 grid grid-cols-1 md:grid-cols-2 gap-4 ${darkMode ? "border-b border-gray-700" : "border-b border-gray-200"}`}>
            {/* Requester info */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-full mt-0.5 ${darkMode ? "bg-gray-700" : "bg-blue-50"}`}>
                  <AiOutlineUser className={darkMode ? "text-blue-400" : "text-blue-600"} size={20} />
                </div>
                <div>
                  <h4 className={`font-medium text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Requester</h4>
                  <p className="font-medium">{displayRequestDetails.requesterName}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-full mt-0.5 ${darkMode ? "bg-gray-700" : "bg-blue-50"}`}>
                  <AiOutlineCalendar className={darkMode ? "text-blue-400" : "text-blue-600"} size={20} />
                </div>
                <div>
                  <h4 className={`font-medium text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Request Date</h4>
                  <p>{formattedDate(displayRequestDetails.dateTime)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-full mt-0.5 ${darkMode ? "bg-gray-700" : "bg-blue-50"}`}>
                  <AiOutlineHome className={darkMode ? "text-blue-400" : "text-blue-600"} size={20} />
                </div>
                <div>
                  <h4 className={`font-medium text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Property</h4>
                  <p className="font-medium">{displayProperty.title}</p>
                </div>
              </div>
            </div>
            
            {/* Valid ID section */}
            {isOwner && isValidIdExisting() ? (
              <div className="space-y-3">
                <h4 className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Valid ID Document
                </h4>
                <div className="relative rounded-lg overflow-hidden border shadow-sm bg-gray-50">
                  <img
                    src={validIdBase64}
                    alt="Valid ID"
                    className="w-full object-contain h-48"
                  />
                  <button
                    onClick={handleDownload}
                    className="absolute bottom-3 right-3 rounded-lg py-1.5 px-3 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm font-medium shadow-sm"
                  >
                    <AiOutlineDownload size={16} />
                    Download
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                {isOwner && (
                  <div className={`p-6 text-center rounded-lg border ${
                    darkMode ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"
                  }`}>
                    <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      No valid ID uploaded by the requester
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Message for approved status - different messages for owner vs seeker */}
          {status === "Approved" && (
            <div className={`px-6 py-4 ${statusDisplay.lightBg} border-b border-green-200`}>
              <div className="flex items-center gap-3">
                <AiFillCheckCircle className="text-green-500 flex-shrink-0" size={24} />
                <p className={`text-sm ${statusDisplay.lightText}`}>
                  {isOwner
                    ? `You have approved this reservation request. A contract will be sent to ${displayRequestDetails.requesterName}.`
                    : "Your reservation has been approved! Please check your notifications to view the contract details."}
                </p>
              </div>
            </div>
          )}
          
          {/* Message for declined status */}
          {status === "Declined" && (
            <div className={`px-6 py-4 ${statusDisplay.lightBg} border-b border-red-200`}>
              <div className="flex items-center gap-3">
                <AiFillCloseCircle className="text-red-500 flex-shrink-0" size={24} />
                <p className={`text-sm ${statusDisplay.lightText}`}>
                  {isOwner
                    ? "You have declined this reservation request. The seeker has been notified."
                    : "Your reservation request has been declined by the property owner."}
                </p>
              </div>
            </div>
          )}
          
          {/* Warning for no available leases */}
          {isOwner && !hasAvailableLeases && !isReservationProcessed() && !isCheckingLeases && (
            <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200">
              <div className="flex items-center gap-3">
                <AiOutlineClockCircle className="text-yellow-500 flex-shrink-0" size={24} />
                <p className="text-sm text-yellow-800">
                  You don't have any lease agreements available to send. Please create a lease agreement first before approving this request.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions Section */}
        <div className={`p-6 ${darkMode ? "bg-gray-750" : "bg-gray-50"} flex gap-3 justify-end`}>
          {isOwner ? (
            renderActionButton()
          ) : (
            // Close button for non-owners
            <button
              onClick={onClose}
              className={`py-2.5 px-6 rounded-lg font-medium transition-all ${
              darkMode
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            Close
          </button>
        )}
        </div>
      </div>
    </div>
  );
};

export default ReservePopout;
