import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineClose } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { GetToken } from "../../global/utils/Token.js";

const API_LINK = "http://localhost:5000/api";

const AddListing = () => {

  const storedToken = GetToken();
  const [selectedImages, setSelectedImages] = useState([]);
  const [fileName, setFileName] = useState("No file chosen");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("");
  const [bedroomNumber, setBedroomNumber] = useState("");
  const [bathroomNumber, setBathroomNumber] = useState("");
  const [propertySize, setPropertySize] = useState("");
  const [address, setAddress] = useState({
    houseNumber: "12",
    street: "rw",
    city: "rw",
    zip: "r",
    long: "r",
    lat: "r",
  });

  const handleFormSubmit = async (e) => {
    e.preventDefault(); 
    // Ensure that required fields are filled out
    if (!title || !address.houseNumber || !address.street || !address.city) {
      alert("Please fill out all required fields.");
      return;
    }

    try {
      const newListing = {
        title,
        description,
        price,
        type,
        bedroomNumber,
        bathroomNumber,
        propertySize,
        address,
      };

      // Send a POST request to the backend API
      const response = await axios.post(
        `${API_LINK}/listings`,
        newListing,
        {
          headers: {
            Authorization: `Bearer ${storedToken}`, // Include the token here
          },
        }
      );

      if (response.status === 201) {
        // Successfully created the listing
        alert("Listing created successfully!");
        navigate("/owner-dashboard"); // Navigate to the owner dashboard
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("An error occurred while creating the listing.");
    }
  };


  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.filter(
      (file) => file.type.startsWith("image/") && !selectedImages.includes(file)
    );

    if (selectedImages.length + newFiles.length > 10) {
      alert("You can only upload up to 10 images.");
      return;
    }

    setSelectedImages((prevImages) => [...prevImages, ...newFiles]);
  };

  const handleRemoveImage = (index) => {
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="relative flex flex-col lg:flex-row h-screen">
        <div className="w-full lg:w-96 h-screen bg-gray-50 flex flex-col text-sm">
          {/* Fixed Header */}
          <div className="p-6 bg-gray-50 border-b">
            <button
                className="fixed right-10 bg-gray-200 rounded-full p-2 text-gray-400 hover:bg-gray-400 hover:text-gray-600 transition"
                onClick={() => {
                  navigate("/owner-dashboard");
                }}
            >
                <AiOutlineClose className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold text-gray-800">Add a Listing</h2>
          </div>

          {/* Scrollable Content */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {/* Photo Upload Section */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm mb-2 text-gray-600">
            Photos • {selectedImages.length} / 10 • You can add up to 10 photos.
          </p>
          {/* File Input */}
          <div className="flex items-center">
            <label
              htmlFor="upload-images"
              className="bg-blue-500 text-white px-4 py-2 rounded-l-lg cursor-pointer hover:bg-blue-600"
            >
              Choose Files
            </label>
            <input
              type="file"
              id="upload-images"
              multiple
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <span className="bg-gray-100 border border-gray-300 px-3 py-2 rounded-r-lg text-gray-600 flex-grow">
              {selectedImages.length > 0
                ? `${selectedImages.length} file(s) selected`
                : "No file chosen"}
            </span>
          </div>
          {/* Preview Section */}
          {selectedImages.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {selectedImages.map((image, index) => (
                <div
                  key={index}
                  className="relative w-full h-24 bg-gray-200 rounded-md overflow-hidden"
                >
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full"
                    onClick={() => handleRemoveImage(index)}
                  >
                  <IoClose className="w-6 h-6"/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

            {/* Input Fields */}
            <div className="space-y-4">
              {/* Property name */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Property Name
                </label>
                <input
                  type="text"
                  placeholder="Enter property name"
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Rental Type */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Rental Type
                </label>
                <select 
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select rental type</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                </select>
              </div>

              {/* Number of Bedrooms */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Number of Bedrooms
                </label>
                <input
                  type="number"
                  placeholder="Enter number of bedrooms"
                  onChange={(e) => setBedroomNumber(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Number of Bathrooms */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Number of Bathrooms
                </label>
                <input
                  type="number"
                  placeholder="Enter number of bathrooms"
                  onChange={(e) => setBathroomNumber(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Price per Month */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Price per Month
                </label>
                <input
                  type="text"
                  placeholder="Enter price per month"
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Property Square Feet */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Property Square Feet
                </label>
                <input
                  type="text"
                  placeholder="Enter property size in square feet"
                  onChange={(e) => setPropertySize(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Rental Description */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Rental Description
                </label>
                <textarea
                  placeholder="Enter a description of the rental"
                  rows={4}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* File Input Styled as Choose File */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Upload Business Permit
                </label>
                <div className="flex items-center">
                  <label
                    htmlFor="upload-permit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-l-lg cursor-pointer hover:bg-blue-600"
                  >
                    Choose File
                  </label>
                  <input
                    type="file"
                    id="upload-permit"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  />
                  <span className="bg-gray-100 border border-gray-300 px-3 py-2 rounded-r-lg text-gray-600 flex-grow">
                    {fileName}
                  </span>
                </div>
              </div>

              {/* Map Section */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Pin Location
                </label>
                <div className="bg-gray-100 rounded-lg h-40 overflow-hidden">
                  <iframe
                    className="w-full h-full border-none"
                    src={`https://maps.google.com/maps?q=Manila&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    allowFullScreen
                    title="Pinned Location Map"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="p-6 bg-gray-50 border-t">
            <button 
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
              onClick={handleFormSubmit}
            >
              Add Listing
            </button>
          </div>
        </div>

        {/* Preview Section (Hidden on Phones) */}
        <div className="hidden lg:flex flex-grow justify-center p-6 overflow-y-auto">
          <div className="flex flex-col items-center justify-center gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 border w-full max-w-4xl">
              <h1 className="mb-4 font-bold text-xl text-center">PREVIEW</h1>
              <div className="flex flex-col xl:flex-row gap-6">
                {/* Image Gallery */}
                <div className="w-full xl:w-1/2">
                  <div className="relative">
                    <div className="h-60 sm:h-80 bg-gray-200 rounded-lg shadow-md mb-4 flex items-center justify-center">
                      <span className="text-gray-500">Main Image</span>
                    </div>
                    {/* Thumbnail Images */}
                    <div className="flex justify-between space-x-2 overflow-x-auto">
                      <div className="h-16 w-20 sm:h-20 sm:w-24 bg-gray-300 rounded-md"></div>
                      <div className="h-16 w-20 sm:h-20 sm:w-24 bg-gray-300 rounded-md"></div>
                      <div className="h-16 w-20 sm:h-20 sm:w-24 bg-gray-300 rounded-md"></div>
                      <div className="h-16 w-20 sm:h-20 sm:w-24 bg-gray-300 rounded-md"></div>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="w-full xl:w-1/2 flex flex-col">
                  <div className="border-b pb-4 mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-blue-600">
                      Placeholder Title
                    </h2>
                    <p className="text-gray-600 mt-2">Ermita, Manila</p>
                  </div>

                  <div className="border-b pb-4 mb-2">
                    <h3 className="text-lg sm:text-2xl font-semibold mb-4">
                      ₱4,000 / head / month
                    </h3>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600">
                        Request Visit
                      </button>
                      <button className="border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-100">
                        Add to Wishlist
                      </button>
                    </div>
                    <p className="text-gray-500 text-sm mt-2">
                      Note: 10% of the principal amount is required to book.
                    </p>
                  </div>

                  {/* Amenities and Payment Terms */}
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-6 border border-gray-300 rounded-lg p-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Amenities & Inclusions
                      </h4>
                      <ul className="text-gray-600 space-y-1">
                        <li>Fully Furnished</li>
                        <li>6 Bed and Bedframe</li>
                        <li>Aircon</li>
                        <li>WiFi / Internet</li>
                        <li>Electricity Bill</li>
                        <li>Water Bill</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Payment Terms
                      </h4>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddListing;
