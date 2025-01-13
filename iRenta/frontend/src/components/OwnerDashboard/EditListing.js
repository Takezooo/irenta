import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AiOutlineClose } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import MapPicker from "../Mapping/MapPicker.js";
import { ThemeContext } from "../../contexts/ThemeContext";
import { GetToken } from "../../global/utils/Token.js";

const API_LINK = "http://localhost:5000/api";

const EditListing = () => {
  const { darkMode } = useContext(ThemeContext);
  const { id } = useParams(); // Extract the listing ID from the URL
  const navigate = useNavigate();
  const storedToken = GetToken();
  const [fileName] = useState("No file chosen");
  // State for form fields
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  // const [combinedImages, setCombinedImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("");
  const [bedroomNumber, setBedroomNumber] = useState("");
  const [bathroomNumber, setBathroomNumber] = useState("");
  const [propertySize, setPropertySize] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [address, setAddress] = useState({
    houseNumber: "",
    street: "",
    city: "",
    zip: "",
    lng: 0,
    lat: 0,
  });
  const [visitAvailability, setVisitAvailability] = useState({
    startTime: "",
    endTime: "",
  });
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  console.log(lat, lng)
  // Fetch the data for the specific listing
  useEffect(() => {
    const fetchListing = async () => {
      try {
        
        const response = await axios.get(`${API_LINK}/listings/${id}`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (response.status === 200) {
          const listing = response.data;
          setLat(parseFloat(listing.address.lat) || 0);
          setLng(parseFloat(listing.address.lng) || 0);
          // Populate state with fetched data
          setTitle(listing.title || "");
          setDescription(listing.description || "");
          setPrice(listing.price || "");
          setType(listing.type || "");
          setBedroomNumber(listing.bedroomNumber || "");
          setBathroomNumber(listing.bathroomNumber || "");
          setPropertySize(listing.propertySize || "");
          setSelectedAmenities(listing.amenities || []);
          setAddress({
            houseNumber: listing.address.houseNumber || "",
            street: listing.address.street || "",
            city: listing.address.city || "",
            zip: listing.address.zip || "",
            lng: listing.address.lng || 0,
            lat: listing.address.lat || 0,
          });
          setVisitAvailability(listing.visitAvailability || {
            startTime: "",
            endTime: "",
          });
          setExistingImages(listing.images || []);
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
        alert("Failed to fetch the listing. Please try again.");
        navigate("/owner-dashboard"); // Redirect if fetching fails
      }
    };

    fetchListing();
  }, [id, storedToken, navigate]);

  console.log(selectedImages);
  console.log(existingImages)
  // Handlers
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

    // Filter out invalid files
    const invalidFiles = files.filter((file) => !allowedTypes.includes(file.type));
    const newFiles = files.filter(
      (file) =>
        allowedTypes.includes(file.type) &&
        !selectedImages.some(
          (image) =>
            image instanceof File && image.name === file.name // Avoid duplicate files
        )
    );

    // Check for invalid file types
    if (invalidFiles.length > 0) {
      setErrorMessage(
        `Invalid file type detected. Only PNG, JPG, and JPEG files are allowed. Invalid files: ${invalidFiles
          .map((file) => file.name)
          .join(", ")}`
      );
      //event.target.value = ""; // Reset the input field
      return;
    }

    // Check for file count limit
    if (existingImages.length + newFiles.length > 10) {
      setErrorMessage("You can only upload up to 10 images.");
      return;
    }

    // Clear error message and update state with valid files
    setErrorMessage("");
    setSelectedImages((prevImages) => [...prevImages, ...newFiles]);
  };

  const handleRemoveImage = (index) => {
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImages = (index) => {
    const removedImage = existingImages[index]; // Get the image that is about to be removed
    
    // Remove the image from the existingImages array
    setExistingImages((prevImages) => prevImages.filter((_, i) => i !== index));
    
    // Add the removed image to the removedImages array
    setRemovedImages((prevRemovedImages) => [...prevRemovedImages, removedImage]);
  };

  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    setSelectedAmenities((prev) =>
      checked ? [...prev, value] : prev.filter((amenity) => amenity !== value)
    );
  };

  const handleLocationChange = async (location) => {
    try {
      const response = await axios.get(
        `/api/map/geocode?lat=${location.lat}&lng=${location.lng}`
      );
      const results = response.data.results;

      if (results && results.length > 0) {
        const addressComponents = results[0].address_components;

        let addressData = {
          houseNumber: "",
          street: "",
          city: "",
          zip: "",
        };

        let requiredFieldsFound = {
          houseNumber: false,
          street: false,
          city: false,
        };

        addressComponents.forEach((component) => {
          const types = component.types;

          if (types.includes("street_number")) {
            addressData.houseNumber = component.long_name;
            requiredFieldsFound.houseNumber = true;
          }
          if (types.includes("route")) {
            addressData.street = component.long_name;
            requiredFieldsFound.street = true;
          }
          if (types.includes("locality")) {
            addressData.city = component.long_name;
            requiredFieldsFound.city = true;
          }
          if (types.includes("postal_code")) {
            addressData.zip = component.long_name;
          }
        });

        if (!requiredFieldsFound.houseNumber) {
          addressData.houseNumber = "Please Input Manually";
        }
        if (!requiredFieldsFound.street) {
          addressData.street = "Please Input Manually";
        }
        if (!requiredFieldsFound.city) {
          addressData.city = "Please Input Manually";
        }

        setAddress({
          ...addressData,
          lng: location.lng,
          lat: location.lat,
        });
      } else {
        console.error("No address components found.");
      }
    } catch (error) {
      console.error("Error fetching address details:", error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (
      address.houseNumber === "Please Input Manually" ||
      address.street === "Please Input Manually" ||
      address.city === "Please Input Manually"
    ) {
      alert("Please fill out all address fields manually.");
      return;
    }
  
    // Validate required fields
    if (!title || !address.houseNumber || !address.street || !address.city) {
      alert("Please fill out all required fields.");
      return;
    }
  
    try {
      const formData = new FormData();
  
      // Append non-file data as a JSON string
      formData.append(
        "data",
        JSON.stringify({
          title,
          description,
          price,
          type,
          bedroomNumber,
          bathroomNumber,
          propertySize,
          address,
          visitAvailability,
          amenities: selectedAmenities,
          removedImages: removedImages,
        })
      );
  
      const newImageFiles = selectedImages.filter((image) => image instanceof File); // Newly added files
      // Append new image files to the FormData
      newImageFiles.forEach((file) => {
        formData.append("files", file); // Use "newImages" key for new files
      });
  
      // Make the API request
      const response = await axios.put(`${API_LINK}/listings/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.status === 200) {
        alert("Listing updated successfully!");
        navigate("/owner-dashboard");
      }
    } catch (error) {
      console.error("Error updating listing:", error);
      alert("An error occurred while updating the listing.");
    }
  };
  

  if (lat === 0 || lng === 0) {
    return <div>Loading map...</div>; // Show loading or default content until lat/lng is valid
  }
  
  return (
    <div>
      <div
        className={`relative flex flex-col lg:flex-row h-screen ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-black"
        }`}
      >
        <div className="relative w-full lg:w-96 h-screen flex flex-col text-sm">
          <div
            className={`p-6 border-b ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-50 border-gray-300"
            }`}
          >
            <button
              className={`fixed right-10 rounded-full p-2 ${
                darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                  : "bg-gray-200 text-gray-400 hover:bg-gray-300 hover:text-gray-600"
              } transition`}
              onClick={() => {
                navigate("/owner-dashboard");
              }}
            >
              <AiOutlineClose className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold">Edit Listing</h2>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {/* Photo Upload Section */}
            <div
              className={`p-4 rounded-lg ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gray-100 border-gray-300"
              }`}
            >
              <p
                className={`text-sm mb-2 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Photos • {existingImages.length + selectedImages.length} / 10 • You can add up to 10
                photos.
              </p>
              <div className="flex items-center">
                <label
                  htmlFor="upload-images"
                  className={`px-4 py-2 rounded-l-lg cursor-pointer ${
                    darkMode
                      ? "bg-blue-600 text-white hover:bg-blue-500"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Choose Files
                </label>
                <input
                  type="file"
                  id="upload-images"
                  multiple
                  className="hidden"
                  accept=".png, .jpg, .jpeg"
                  onChange={handleFileChange}
                />
                <span
                  className={`px-3 py-2 rounded-r-lg flex-grow ${
                    darkMode
                      ? "bg-gray-700 text-gray-300 border border-gray-600"
                      : "bg-gray-100 text-gray-600 border border-gray-300"
                  }`}
                >
                  {existingImages.length + selectedImages.length > 0
                    ? `${existingImages.length + selectedImages.length} file(s) selected`
                    : "No file chosen"}
                </span>
              </div>
              {errorMessage && (
                <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
              )}

              <div>
                {/* Preview Section */}
                {existingImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {existingImages.map((image, index) => {
                      return (
                        <div key={index} className="relative w-full h-24 bg-gray-200 rounded-md overflow-hidden">
                          <img
                            src={image.link} // Use the "link" property for fetched images
                            alt={`Preview ${index}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full"
                            onClick={() => handleRemoveExistingImages(index)}
                          >
                            <IoClose className="w-6 h-6" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {selectedImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {selectedImages.map((image, index) => {
                      return (
                        <div key={index} className="relative w-full h-24 bg-gray-200 rounded-md overflow-hidden">
                          <img
                            src={URL.createObjectURL(image)} // Create object URL for the image
                            alt={`Preview ${index}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <IoClose className="w-6 h-6" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                {/* Property Name */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Property Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter property name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full p-3 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 focus:outline-none"
                        : "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:outline-none"
                    }`}
                  />
                </div>

                {/* Rental Type */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Rental Type
                  </label>
                  <select
                    onChange={(e) => setType(e.target.value)}
                    value={type}
                    className={`w-full p-3 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 focus:outline-none"
                        : "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:outline-none"
                    }`}
                  >
                    <option value="">Select rental type</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="condo">Condo</option>
                  </select>
                </div>

                {/* Number of Bedrooms */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Number of Bedrooms
                  </label>
                  <input
                    type="number"
                    value={bedroomNumber}
                    placeholder="Enter number of bedrooms"
                    onChange={(e) => setBedroomNumber(e.target.value)}
                    className={`w-full p-3 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 focus:outline-none"
                        : "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:outline-none"
                    }`}
                  />
                </div>

                {/* Number of Bathrooms */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Number of Bathrooms
                  </label>
                  <input
                    type="number"
                    value={bathroomNumber}
                    placeholder="Enter number of bathrooms"
                    onChange={(e) => setBathroomNumber(e.target.value)}
                    className={`w-full p-3 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 focus:outline-none"
                        : "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:outline-none"
                    }`}
                  />
                </div>

                {/* Price per Month */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Price per Month
                  </label>
                  <input
                    type="text"
                    value={price}
                    placeholder="Enter price per month"
                    onChange={(e) => setPrice(e.target.value)}
                    className={`w-full p-3 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 focus:outline-none"
                        : "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:outline-none"
                    }`}
                  />
                </div>

                {/* Amenities & Inclusions */}
                <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Amenities & Inclusions
                </label>
                <div
                  className={`space-y-2 rounded-lg p-2 border ${
                    darkMode
                      ? "bg-gray-800 text-gray-300 border-gray-700"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  {[
                    "Fully Furnished",
                    "Semi Furnished",
                    "Aircon",
                    "WiFi / Internet",
                    "Electricity Bill",
                    "Water Bill",
                  ].map((amenity) => (
                    <label key={amenity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={amenity}
                        className={`form-checkbox ${
                          darkMode ? "text-blue-400" : "text-blue-500"
                        }`}
                        checked={selectedAmenities.includes(amenity)} // Automatically checks based on selectedAmenities
                        onChange={handleAmenityChange}
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>


                {/* Property Size */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Property Size (sq ft)
                  </label>
                  <input
                    type="text"
                    value={propertySize}
                    placeholder="Enter property size in square feet"
                    onChange={(e) => setPropertySize(e.target.value)}
                    className={`w-full p-3 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 focus:outline-none"
                        : "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:outline-none"
                    }`}
                  />
                </div>

                {/* Visit Availability */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Visit Availability
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="time"
                      value={visitAvailability.startTime}
                      placeholder="Start Time"
                      onChange={(e) =>
                        setVisitAvailability((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                      className={`w-full p-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 focus:outline-none"
                          : "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:outline-none"
                      }`}
                    />
                    <input
                      type="time"
                      value={visitAvailability.endTime}
                      placeholder="End Time"
                      onChange={(e) =>
                        setVisitAvailability((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                      className={`w-full p-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 focus:outline-none"
                          : "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:outline-none"
                      }`}
                    />
                  </div>
                </div>

                {/* Rental Description */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Rental Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    placeholder="Enter a description of the rental"
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full p-3 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 focus:outline-none"
                        : "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:outline-none"
                    }`}
                  ></textarea>
                </div>

                {/* File Input Styled as Choose File */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
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
                    <span
                      className={`flex-grow p-2 rounded-e-lg border ${
                        darkMode
                          ? "bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 focus:outline-none"
                          : "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:outline-none"
                      }`}
                    >
                      {fileName}
                    </span>
                  </div>
                </div>

                {/* Map Section */}
                <div
                  className={`rounded-lg h-45 overflow-hidden ${
                    darkMode
                      ? "bg-gray-800 text-gray-300"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      House Number:
                    </label>
                    <input
                      type="text"
                      placeholder="Enter property House Number"
                      value={address.houseNumber}
                      onChange={(e) =>
                        setAddress({ ...address, houseNumber: e.target.value })
                      }
                      className={`w-full p-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 focus:outline-none"
                          : "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:outline-none"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Street:
                    </label>
                    <input
                      type="text"
                      placeholder="Enter property Street"
                      value={address.street}
                      onChange={(e) =>
                        setAddress({ ...address, street: e.target.value })
                      }
                      className={`w-full p-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 focus:outline-none"
                          : "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:outline-none"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      City:
                    </label>
                    <input
                      type="text"
                      placeholder="Enter property City"
                      value={address.city}
                      onChange={(e) =>
                        setAddress({ ...address, city: e.target.value })
                      }
                      className={`w-full p-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 focus:outline-none"
                          : "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:outline-none"
                      }`}
                    />
                  </div>
                  <MapPicker
                    className={`w-full p-3 border rounded-lg ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 border-gray-600"
                        : "bg-white text-gray-800 border-gray-300"
                    }`}
                    center={{
                      lat: lat, 
                      lng: lng
                    }}
                    onLocationChange={handleLocationChange}
                  />
                </div>
              </div>
            </div>

          {/* Fixed Footer */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-6 ${
              darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
            }`}
          >
            <button
              className={`w-full py-3 rounded-lg ${
                darkMode
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
              onClick={handleFormSubmit}
            >
              Update Listing
            </button>
          </div>

          </div>
        </div>

        {/* Preview Section (Hidden on Phones) */}
        <div className="hidden lg:flex flex-grow justify-center p-6 overflow-y-auto">
          <div
            className={`flex flex-col items-center justify-center gap-8 ${
              darkMode ? "text-gray-300" : "text-gray-800"
            }`}
          >
            <div
              className={`rounded-lg shadow-md p-6 border w-full max-w-4xl ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
            >
              <h1 className="mb-4 font-bold text-xl text-center">PREVIEW</h1>
              <div className="flex flex-col xl:flex-row gap-6">
                {/* Image Gallery */}
                <div className="w-full xl:w-1/2">
                  <div className="relative">
                    <div
                      className={`h-60 sm:h-80 rounded-lg shadow-md mb-4 flex items-center justify-center ${
                        darkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      <span>Main Image</span>
                    </div>
                    {/* Thumbnail Images */}
                    <div className="flex justify-between space-x-2 overflow-x-auto">
                      <div
                        className={`h-16 w-20 sm:h-20 sm:w-24 rounded-md ${
                          darkMode ? "bg-gray-600" : "bg-gray-300"
                        }`}
                      ></div>
                      <div
                        className={`h-16 w-20 sm:h-20 sm:w-24 rounded-md ${
                          darkMode ? "bg-gray-600" : "bg-gray-300"
                        }`}
                      ></div>
                      <div
                        className={`h-16 w-20 sm:h-20 sm:w-24 rounded-md ${
                          darkMode ? "bg-gray-600" : "bg-gray-300"
                        }`}
                      ></div>
                      <div
                        className={`h-16 w-20 sm:h-20 sm:w-24 rounded-md ${
                          darkMode ? "bg-gray-600" : "bg-gray-300"
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="w-full xl:w-1/2 flex flex-col">
                  <div
                    className={`border-b pb-4 mb-4 ${
                      darkMode ? "border-gray-600" : "border-gray-300"
                    }`}
                  >
                    <h2
                      className={`text-xl sm:text-2xl font-bold ${
                        darkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      Placeholder Title
                    </h2>
                    <p
                      className={`mt-2 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Ermita, Manila
                    </p>
                  </div>

                  <div
                    className={`border-b pb-4 mb-2 ${
                      darkMode ? "border-gray-600" : "border-gray-300"
                    }`}
                  >
                    <h3
                      className={`text-lg sm:text-2xl font-semibold mb-4 ${
                        darkMode ? "text-gray-300" : "text-gray-800"
                      }`}
                    >
                      ₱4,000 / head / month
                    </h3>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                      <button
                        className={`px-4 py-2 rounded-full ${
                          darkMode
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                      >
                        Request Visit
                      </button>
                      <button
                        className={`border px-4 py-2 rounded-full ${
                          darkMode
                            ? "border-gray-600 hover:bg-gray-700"
                            : "border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        Add to Wishlist
                      </button>
                    </div>
                    <p
                      className={`text-sm mt-2 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Note: 10% of the principal amount is required to book.
                    </p>
                  </div>

                  {/* Amenities and Payment Terms */}
                  <div
                    className={`mt-2 grid grid-cols-1 sm:grid-cols-2 gap-6 border rounded-lg p-4 ${
                      darkMode
                        ? "border-gray-600 bg-gray-700"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <div>
                      <h4
                        className={`font-semibold mb-2 ${
                          darkMode ? "text-gray-300" : "text-gray-800"
                        }`}
                      >
                        Amenities & Inclusions
                      </h4>
                      <ul
                        className={`space-y-1 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        <li>Fully Furnished</li>
                        <li>6 Bed and Bedframe</li>
                        <li>Aircon</li>
                        <li>WiFi / Internet</li>
                        <li>Electricity Bill</li>
                        <li>Water Bill</li>
                      </ul>
                    </div>
                    <div>
                      <h4
                        className={`font-semibold mb-2 ${
                          darkMode ? "text-gray-300" : "text-gray-800"
                        }`}
                      >
                        Payment Terms
                      </h4>
                      <ul
                        className={`space-y-1 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
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

export default EditListing;
