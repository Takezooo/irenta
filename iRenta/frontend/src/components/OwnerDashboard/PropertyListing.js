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
    <div className="pt-20 pb-4 sm:ml-64">
      <div className="w-full h-full overflow-hidden">
        {/* <div className="fixed">
            <button className="bg-blue-500 text-gray-100 px-4 py-2 rounded-md shadow hover:bg-blue-600">Add Property</button>
        </div> */}

        {error && <div className="text-red-500">{error}</div>} {/* Display error if any */}

        <div className="flex flex-col">
          {listings.map((listing) => (
            // <div
            //   key={listing._id}
            //   className="p-4 bg-white shadow rounded-md border"
            // >
            //   <h2 className="text-lg font-semibold">{listing.title}</h2>
            //   <p className="text-gray-700">{listing.description}</p>
            //   <p className="text-blue-600 font-bold">${listing.price}</p>
            // </div>
            <div 
              key={listing._id} 
              className="mb-8 flex justify-center items-center"
            >
              <div className="bg-white rounded-lg shadow-md p-6 border w-full max-w-5xl">
                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {/* Image Section */}
                  <div className="col-span-2">
                    <div className="relative">
                      <div className="h-72 bg-gray-200 rounded-lg shadow-md mb-4 flex items-center justify-center">
                        <span className="text-gray-500">Main Image</span>
                      </div>
                      {/* Thumbnails */}
                      <div className="flex justify-between space-x-2 overflow-x-auto scrollbar-hide">
                        <div className="h-20 w-20 bg-gray-300 rounded-md"></div>
                        <div className="h-20 w-20 bg-gray-300 rounded-md"></div>
                        <div className="h-20 w-20 bg-gray-300 rounded-md"></div>
                        <div className="h-20 w-20 bg-gray-300 rounded-md"></div>
                      </div>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="col-span-3 flex flex-col justify-between">
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                      <h2 className="text-lg text-blue-600 font-semibold">{listing.title}</h2>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">₱4,000 /head /month</h3>
                      <p className="text-gray-600 mt-1">Ermita, Manila</p>
                    </div>
                  
                    <div className="mt-6 border border-gray-300 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{listing.description}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Amenities Section */}
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Amenities</h4>
                          <ul className="text-gray-600 space-y-1">
                            <li>Fully Furnished</li>
                            <li>6 Bed and Bedframe</li>
                            <li>Aircon</li>
                            <li>WiFi / Internet</li>
                            <li>Electricity Bill</li>
                            <li>Water Bill</li>
                          </ul>
                        </div>

                        {/* Payment Terms Section */}
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Payment Terms</h4>
                          <ul className="text-gray-600 space-y-1">
                            <li>Advance Payment: 1 month</li>
                            <li>Lease Term: 6 months</li>
                            <li>Pay Period: Monthly</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-4">
                  <button className="bg-red-500 text-white px-4 py-2 rounded-md shadow hover:bg-red-600">Remove</button>
                  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md shadow hover:bg-gray-300">Edit</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      
    </div>
  );
};
