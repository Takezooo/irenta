import { useState, useEffect, useContext } from "react";
import { fetchWaitlist, moveToTenant } from "../../../global/api/Tenants";
import { fetchSpecificList } from "../../../global/api/Listings";
import { ThemeContext } from "../../../contexts/ThemeContext";
import { toast } from "react-toastify";

export const Waitlist = () => {
  const [waitlist, setWaitlist] = useState([]);
  const [listings, setListings] = useState([]);
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    const loadWaitlist = async () => {
      try {
        const data = await fetchWaitlist();
        setWaitlist(data);
      } catch (error) {
        console.error("Error fetching waitlist:", error);
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
              const data = await fetchSpecificList(item.propertyId); // Assuming item has propertyId
              return data;
            } catch (err) {
              console.error(
                `Failed to fetch listing for propertyId ${item.propertyId}:`,
                err
              );
              return null; // Or handle the error differently (e.g., return an empty object)
            }
          })
        );

        // Filter out any null values (failed fetches)
        const filteredListings = fetchedListings.filter(Boolean);

        setListings(filteredListings);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      }
    };

    fetchListings();
  }, [waitlist]); // Only re-render when waitlist changes

  const handleMoveToTenant = async (tenantId) => {
    try {
      //setIsLoading(true); // Add loading state
      const response = await moveToTenant(tenantId);
      
      if (response.tenant && response.lease) {
        setWaitlist((prev) => prev.filter((item) => item._id !== tenantId));
        toast.success("Successfully moved to tenant and generated rent dates!");
      } else {
        throw new Error('Incomplete response from server');
      }
    } catch (error) {
      console.error("Error moving to tenant:", error);
      toast.error(error.message || "Failed to move to tenant");
    }
    //  finally {
    //   setIsLoading(false); // Clear loading state
    // }
  };

  if (!waitlist.length) {
    return (
      <div>
        <h2
          className={`text-xl font-bold mb-4 ${
            darkMode ? "text-white" : "text-black"
          }`}
        >
          Waitlist
        </h2>
        <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          No Seekers signed the lease agreement.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2
        className={`text-xl font-bold mb-4 ${
          darkMode ? "text-white" : "text-black"
        }`}
      >
        Waitlist
      </h2>
      {waitlist.length > 0 ? (
        <div>
          {waitlist.map((item) => {
            const matchingListing = listings.find(
              (l) => l._id === item.propertyId
            );
            const address = matchingListing?.address || {};
            return (
              <div
                key={item?._id}
                className={`mb-4 p-4 border rounded shadow-md flex items-center justify-between ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div
                  className={`flex gap-4 items-center ${
                    darkMode ? "text-gray-300" : "text-gray-800"
                  }`}
                >
                  <span>
                    <strong>Seeker:</strong>{" "}
                    {item?.seekerId?.info?.firstName || "Unknown"}{" "}
                    {item?.seekerId?.info?.lastName || ""}
                  </span>
                  <span>
                    <strong>Property:</strong>{" "}
                    {matchingListing?.title || "Unknown"}
                  </span>
                  <span>
                    <strong>Address:</strong> {address.houseNumber || ""}{" "}
                    {address.street || ""}, {address.city || ""},{" "}
                    {address.zip || ""}
                  </span>
                  <span>
                    <strong>Date:</strong>{" "}
                    {new Date(item?.waitListedDate).toLocaleDateString() ||
                      "Unknown"}
                  </span>
                </div>
                <button
                  onClick={() => handleMoveToTenant(item._id)}
                  className={`px-4 py-2 rounded text-white ${
                    darkMode
                      ? "bg-green-600 hover:bg-green-500"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  Move to Tenant
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No waitlisted items found.</p>
      )}
    </div>
  );
};
