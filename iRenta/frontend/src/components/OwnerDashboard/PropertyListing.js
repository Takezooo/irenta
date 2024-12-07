import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const PropertyListing = () => {
  const [listings, setListings] = useState([]); // State to store listings
  const [error, setError] = useState(null); // State for error handling

  useEffect(() => {
    // Fetch listings from the backend
    const fetchListings = async () => {
      try {
        const response = await axios.get("http://localhost:5000/listings", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setListings(response.data); // Update state with fetched listings
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching listings");
      }
    };

    fetchListings();
  }, []); // Empty dependency array means this runs once when the component mounts

  return (
    <div className="pt-20 pb-4 sm:ml-56">
      <div className="p-4 w-full h-full bg-gray-100 rounded-md shadow overflow-hidden">
        <div> 
          <h1>Property Listings</h1>
        </div>

        {error && <div className="text-red-500">{error}</div>} {/* Display error if any */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {listings.map((listing) => (
            <div
              key={listing._id}
              className="p-4 bg-white shadow rounded-md border"
            >
              <h2 className="text-lg font-semibold">{listing.title}</h2>
              <p className="text-gray-700">{listing.description}</p>
              <p className="text-blue-600 font-bold">${listing.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
