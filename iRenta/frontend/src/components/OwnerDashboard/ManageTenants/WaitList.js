import { useState, useEffect, useContext } from "react";
import { fetchWaitlist, moveToTenant } from "../../../global/api/Tenants";
import { fetchSpecificList } from "../../../global/api/Listings";
import { ThemeContext } from "../../../contexts/ThemeContext";
import { toast } from "react-toastify";

export const Waitlist = () => {
  const [waitlist, setWaitlist] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    const loadWaitlist = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchWaitlist();
        setWaitlist(data);
      } catch (error) {
        setError("Failed to fetch waitlist. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadWaitlist();
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const fetchedListings = await Promise.all(
          waitlist.map(async (item) => {
            try {
              const data = await fetchSpecificList(item.propertyId);
              return data;
            } catch (err) {
              return null;
            }
          })
        );
        setListings(fetchedListings.filter(Boolean));
      } catch (err) {
        // Silent fail
      }
    };
    if (waitlist.length) fetchListings();
  }, [waitlist]);

  const handleMoveToTenant = async (tenantId) => {
    setProcessingId(tenantId);
    try {
      const response = await moveToTenant(tenantId);
      if (response.tenant && response.lease) {
        setWaitlist((prev) => prev.filter((item) => item._id !== tenantId));
        toast.success("Successfully moved to tenant and generated rent dates!");
      } else {
        throw new Error('Incomplete response from server');
      }
    } catch (error) {
      toast.error(error.message || "Failed to move to tenant");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</div>
    );
  }

  if (!waitlist.length) {
    return (
      <div>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-black"}`}>Waitlist</h2>
        <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>No Seekers signed the lease agreement.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-black"}`}>Waitlist</h2>
      <div className="flex flex-col gap-4">
        {waitlist.map((item) => {
          const matchingListing = listings.find((l) => l._id === item.propertyId);
          const address = matchingListing?.address || {};
          return (
            <div
              key={item?._id}
              className={`p-4 border rounded shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className={`flex flex-col gap-2 flex-1 ${darkMode ? "text-gray-300" : "text-gray-800"}`}>
                <span><strong>Seeker:</strong> {item?.seekerId?.info?.firstName || "Unknown"} {item?.seekerId?.info?.lastName || ""}</span>
                <span><strong>Property:</strong> {matchingListing?.title || "Unknown"}</span>
                <span><strong>Address:</strong> {address.houseNumber || ""} {address.street || ""}, {address.city || ""}, {address.zip || ""}</span>
                <span><strong>Date:</strong> {new Date(item?.waitListedDate).toLocaleDateString() || "Unknown"}</span>
              </div>
              <button
                onClick={() => handleMoveToTenant(item._id)}
                className={`w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2 rounded text-white flex items-center justify-center gap-2 ${
                  darkMode ? "bg-green-600 hover:bg-green-500" : "bg-green-500 hover:bg-green-600"
                } ${processingId === item._id ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={processingId === item._id}
              >
                {processingId === item._id && (
                  <span className="animate-spin h-5 w-5 border-2 border-t-2 border-white rounded-full"></span>
                )}
                Move to Tenant
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
