import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AiOutlineClose } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import MapPickerV2 from "../Mapping/MapPickerV2.js";
import { ThemeContext } from "../../contexts/ThemeContext";
import { GetToken } from "../../global/utils/Token.js";

const API_LINK = "https://irenta-production.up.railway.app/api";

const EditListing = () => {
	const { darkMode } = useContext(ThemeContext);
	const { id } = useParams();
	const navigate = useNavigate();
	const storedToken = GetToken();
	const [fileName] = useState("No file chosen");
	// State for form fields
	const [selectedImages, setSelectedImages] = useState([]);
	const [existingImages, setExistingImages] = useState([]);
	const [removedImages, setRemovedImages] = useState([]);
	const [errorMessage, setErrorMessage] = useState("");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [price, setPrice] = useState("");
	const [type, setType] = useState("");
	const [bedroomNumber, setBedroomNumber] = useState("");
	const [bathroomNumber, setBathroomNumber] = useState("");
	const [propertySize, setPropertySize] = useState("");
	const [selectedAmenities, setSelectedAmenities] = useState([]);
	const [utilitiesIncluded, setUtilitiesIncluded] = useState(false);
	const [includedUtilities, setIncludedUtilities] = useState([]);
	const [priceType, setPriceType] = useState("per_head");
	const [rentPeriod, setRentPeriod] = useState("month");
	const [pricePerUnit, setPricePerUnit] = useState("");
	const [vacancyStatus, setVacancyStatus] = useState("Vacant");
	const [customAmenity, setCustomAmenity] = useState({
		name: "",
		fee: 0,
	});
	const [address, setAddress] = useState({
		houseNumber: "",
		street: "",
		city: "",
		zip: "",
		lng: 0,
		lat: 0,
		formattedAddress: ""
	});
	const [visitAvailability, setVisitAvailability] = useState({
		startTime: "",
		endTime: "",
	});
	const [vacant, setVacant] = useState(0);

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
					console.log(listing);
					setAddress({
						houseNumber: listing.address.houseNumber || "",
						street: listing.address.street || "",
						city: listing.address.city || "",
						zip: listing.address.zip || "",
						lng: parseFloat(listing.address.lng) || 0,
						lat: parseFloat(listing.address.lat) || 0,
						formattedAddress: listing.address.formattedAddress || ""
					});
					// Populate state with fetched data
					setTitle(listing.title || "");
					setDescription(listing.description || "");
					setPrice(listing.price || "");
					setType(listing.type || "");
					setBedroomNumber(listing.bedroomNumber || "");
					setBathroomNumber(listing.bathroomNumber || "");
					setPropertySize(listing.propertySize || "");
					setSelectedAmenities(listing.amenities || []);
					setVisitAvailability(
						listing.visitAvailability || {
							startTime: "",
							endTime: "",
						}
					);
					setVacant(listing.vacantUnits || 0);
					setUtilitiesIncluded(listing.utilitiesIncluded || false);
					setIncludedUtilities(listing.includedUtilities || []);
					setPriceType(listing.priceType || "per_head");
					setRentPeriod(listing.rentPeriod || "month");
					setPricePerUnit(listing.price || "");
					setVacancyStatus(
						listing.vacancyStatus ||
							(listing.vacant > 0 ? "Vacant" : "Occupied")
					);
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

	useEffect(() => {
		// Automatically set vacancyStatus based on vacant count
		setVacancyStatus(vacant > 0 ? "Vacant" : "Occupied");
	}, [vacant]);

	// Handlers
	const handleFileChange = (event) => {
		const files = Array.from(event.target.files);
		const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

		// Filter out invalid files
		const invalidFiles = files.filter(
			(file) => !allowedTypes.includes(file.type)
		);
		const newFiles = files.filter(
			(file) =>
				allowedTypes.includes(file.type) &&
				!selectedImages.some(
					(image) => image instanceof File && image.name === file.name // Avoid duplicate files
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
		setRemovedImages((prevRemovedImages) => [
			...prevRemovedImages,
			removedImage,
		]);
	};

	const handleAddCustomAmenity = () => {
		if (customAmenity.name.trim() === "") {
			alert("Please enter a name for the custom amenity.");
			return;
		}

		if (selectedAmenities.some((a) => a.name === customAmenity.name.trim())) {
			alert("This amenity already exists.");
			return;
		}

		setSelectedAmenities((prev) => [
			...prev,
			{
				name: customAmenity.name.trim(),
				fee: parseFloat(customAmenity.fee) || 0,
			},
		]);

		setCustomAmenity({ name: "", fee: 0 });
	};

	const handleAmenityChange = (e) => {
		const { value, checked } = e.target;
		setSelectedAmenities((prev) =>
			checked ? [...prev, value] : prev.filter((amenity) => amenity !== value)
		);
	};

	const handleFormSubmit = async (e) => {
		e.preventDefault();

		// Validate required fields
		if (!title || !description || !pricePerUnit || !type || !address.lat || !address.lng) {
			setErrorMessage("Please fill in all required fields and select a location on the map.");
			return;
		}

		try {
			const formData = new FormData();

			// Create the data object that will be stringified
			const listingData = {
				title: title || "",
				description: description || "",
				type: type || "",
				bedroomNumber: Number(bedroomNumber) || 0,
				bathroomNumber: Number(bathroomNumber) || 0,
				propertySize: propertySize || "0",
				priceType: priceType || "total",
				rentPeriod: rentPeriod || "month",
				price: Number(pricePerUnit) || 0,
				vacancyStatus: vacancyStatus || "Vacant",
				vacantUnits: Number(vacant) || 0,
				utilitiesIncluded: Boolean(utilitiesIncluded),
				amenities: Array.isArray(selectedAmenities) ? selectedAmenities : [],
				includedUtilities: Array.isArray(includedUtilities) ? includedUtilities : [],
				visitAvailability: {
					startTime: visitAvailability?.startTime || "",
					endTime: visitAvailability?.endTime || ""
				},
				address: {
					houseNumber: address?.houseNumber || "N/A",
					street: address?.street || "",
					city: address?.city || "",
					zip: address?.zip || "",
					lat: parseFloat(address?.lat) || 0,
					lng: parseFloat(address?.lng) || 0
				},
				removedImages: Array.isArray(removedImages) ? removedImages : []
			};

			// Append the stringified data
			formData.append("data", JSON.stringify(listingData));

			// Handle image files
			if (selectedImages && selectedImages.length > 0) {
				selectedImages.forEach((image) => {
					if (image instanceof File) {
						formData.append("files", image);
					}
				});
			}

			// Log the form data for debugging
			console.log("Form Data Contents:");
			for (let [key, value] of formData.entries()) {
				if (value instanceof File) {
					console.log(key, ':', 'File', ':', value.name);
				} else {
					try {
						// Try to parse as JSON to check if it's properly formatted
						const parsed = JSON.parse(value);
						console.log(key, ':', 'JSON', ':', JSON.stringify(parsed, null, 2));
					} catch (e) {
						console.log(key, ':', typeof value, ':', value);
					}
				}
			}

			const response = await axios.put(
				`${API_LINK}/listings/${id}`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${storedToken}`,
						"Content-Type": "multipart/form-data",
					},
				}
			);

			if (response.status === 200) {
				alert("Listing updated successfully!");
				navigate("/owner-dashboard");
			}
		} catch (error) {
			console.error("Error updating listing:", error);
			if (error.response?.data) {
				console.error("Server response:", error.response.data);
			}
			
			let errorMsg = "Failed to update listing. ";
			if (error.response?.data?.message) {
				errorMsg += error.response.data.message;
			} else if (error.response?.data?.error) {
				errorMsg += error.response.data.error;
			} else {
				errorMsg += "Please check all fields and try again.";
			}
			
			setErrorMessage(errorMsg);
		}
	};

	const handleAddressSelect = (selectedAddress) => {
		// Extract address components
		const addressComponents = selectedAddress.address_components;
		let newAddress = {
			houseNumber: "",
			street: "",
			city: "",
			zip: "",
			lat: selectedAddress.geometry.location.lat(),
			lng: selectedAddress.geometry.location.lng(),
			formattedAddress: selectedAddress.formatted_address
		};

		// Parse address components
		addressComponents.forEach(component => {
			const types = component.types;
			if (types.includes('street_number')) {
				newAddress.houseNumber = component.long_name;
			} else if (types.includes('route')) {
				newAddress.street = component.long_name;
			} else if (types.includes('locality')) {
				newAddress.city = component.long_name;
			} else if (types.includes('postal_code')) {
				newAddress.zip = component.long_name;
			}
		});

		// If no house number is found, use a placeholder or the first part of the formatted address
		if (!newAddress.houseNumber) {
			const firstPart = selectedAddress.formatted_address.split(',')[0];
			if (firstPart.match(/^\d+/)) {
				newAddress.houseNumber = firstPart.match(/^\d+/)[0];
			} else {
				newAddress.houseNumber = "N/A";
			}
		}

		setAddress(newAddress);
	};

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
								Photos • {existingImages.length + selectedImages.length} / 10 •
								You can add up to 10 photos.
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
										? `${
												existingImages.length + selectedImages.length
										  } file(s) selected`
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
												<div
													key={index}
													className="relative w-full h-24 bg-gray-200 rounded-md overflow-hidden"
												>
													<img
														src={image.link}
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
												<div
													key={index}
													className="relative w-full h-24 bg-gray-200 rounded-md overflow-hidden"
												>
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

								<div>
									<label
										className={`block text-sm font-medium mb-1 ${
											darkMode ? "text-gray-300" : "text-gray-700"
										}`}
									>
										Vacant Spaces
									</label>
									<input
										type="number"
										min="0"
										placeholder="Enter number of vacant spaces"
										value={vacant}
										onChange={(e) => setVacant(parseInt(e.target.value) || 0)} // Ensure it's a number
										className={`w-full p-3 rounded-lg border ${
											darkMode
												? "bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 focus:outline-none"
												: "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:outline-none"
										}`}
									/>
								</div>

								{/* Vacancy Status */}
								<div>
									<label
										className={`block text-sm font-medium mb-1 ${
											darkMode ? "text-gray-300" : "text-gray-700"
										}`}
									>
										Vacancy Status
									</label>
									<select
										value={vacancyStatus}
										onChange={(e) => setVacancyStatus(e.target.value)}
										className={`w-full p-3 rounded-lg border ${
											darkMode
												? "bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 focus:outline-none"
												: "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:outline-none"
										}`}
									>
										<option value="vacant">Vacant</option>
										<option value="occupied">Occupied</option>
										<option value="reserved">Reserved</option>
									</select>
								</div>

								{/* Pricing Type Selector */}
								<div>
									<label
										className={`block text-sm font-medium mb-1 ${
											darkMode ? "text-gray-300" : "text-gray-700"
										}`}
									>
										Pricing Type
									</label>
									<select
										value={priceType}
										onChange={(e) => setPriceType(e.target.value)}
										className={`w-full p-3 rounded-lg border ${
											darkMode
												? "bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 focus:outline-none"
												: "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:outline-none"
										}`}
									>
										<option value="per_head">Per Person</option>
										<option value="total">Total Price</option>
									</select>
								</div>

								{/* Rent Period Selector (only show for per_head) */}
								{priceType === "per_head" && (
									<div>
										<label
											className={`block text-sm font-medium mb-1 ${
												darkMode ? "text-gray-300" : "text-gray-700"
											}`}
										>
											Rent Period
										</label>
										<select
											value={rentPeriod}
											onChange={(e) => setRentPeriod(e.target.value)}
											className={`w-full p-3 rounded-lg border ${
												darkMode
													? "bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 focus:outline-none"
													: "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:outline-none"
											}`}
										>
											<option value="day">Day</option>
											<option value="night">Night</option>
											<option value="week">Week</option>
											<option value="month">Month</option>
											<option value="quarter">Quarter (3 months)</option>
											<option value="year">Year</option>
										</select>
									</div>
								)}

								{/* Price Input */}
								<div>
									<label
										className={`block text-sm font-medium mb-1 ${
											darkMode ? "text-gray-300" : "text-gray-700"
										}`}
									>
										{priceType === "per_head"
											? "Price Per Person"
											: "Total Price"}
									</label>
									<input
										type="number"
										placeholder={`Enter ${
											priceType === "per_head" ? "per person" : "total"
										} price`}
										value={pricePerUnit}
										onChange={(e) => setPricePerUnit(e.target.value)}
										className={`w-full p-3 rounded-lg border ${
											darkMode
												? "bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 focus:outline-none"
												: "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:outline-none"
										}`}
									/>
								</div>

								{/* Utilities Included */}
								<div className="flex items-center gap-2">
									<input
										type="checkbox"
										checked={utilitiesIncluded}
										onChange={(e) => setUtilitiesIncluded(e.target.checked)}
										className={`form-checkbox ${
											darkMode ? "text-blue-400" : "text-blue-500"
										}`}
									/>
									<span>Utilities Included in Rent</span>
								</div>

								{utilitiesIncluded && (
									<div>
										<label
											className={`block text-sm font-medium mb-1 ${
												darkMode ? "text-gray-300" : "text-gray-700"
											}`}
										>
											Included Utilities
										</label>
										<div
											className={`space-y-2 rounded-lg p-2 border ${
												darkMode
													? "bg-gray-800 border-gray-700"
													: "bg-white border-gray-300"
											}`}
										>
											{["water", "electricity", "internet", "gas"].map(
												(utility) => (
													<div
														key={utility}
														className="flex items-center gap-2"
													>
														<input
															type="checkbox"
															checked={includedUtilities.includes(utility)}
															onChange={(e) => {
																if (e.target.checked) {
																	setIncludedUtilities([
																		...includedUtilities,
																		utility,
																	]);
																} else {
																	setIncludedUtilities(
																		includedUtilities.filter(
																			(u) => u !== utility
																		)
																	);
																}
															}}
															className={`form-checkbox ${
																darkMode ? "text-blue-400" : "text-blue-500"
															}`}
														/>
														<span className="capitalize">{utility}</span>
													</div>
												)
											)}
										</div>
									</div>
								)}

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
												? "bg-gray-800 border-gray-700"
												: "bg-white border-gray-300"
										}`}
									>
										{/* Existing amenities list */}

										{selectedAmenities.map((amenity) => (
											<div
												key={amenity.name}
												className="flex items-center gap-2"
											>
												{/* Checkbox to select/deselect the amenity */}
												<input
													type="checkbox"
													checked={true}
													onChange={() => {
														setSelectedAmenities(
															(prev) =>
																prev.filter((a) => a.name !== amenity.name) // Remove from list if unchecked
														);
													}}
													className={`form-checkbox ${
														darkMode ? "text-blue-400" : "text-blue-500"
													}`}
												/>

												{/* Amenity Name */}
												<span className="capitalize">{amenity.name}</span>

												{/* Fee Input */}
												<input
													type="number"
													placeholder="Fee"
													min="0"
													value={amenity.fee}
													onChange={(e) => {
														const newFee = parseInt(e.target.value, 10) || 0;
														setSelectedAmenities((prev) =>
															prev.map((a) =>
																a.name === amenity.name
																	? { ...a, fee: newFee }
																	: a
															)
														);
													}}
													className={`ml-2 p-1 w-20 rounded border ${
														darkMode
															? "bg-gray-700 border-gray-600"
															: "bg-white border-gray-300"
													}`}
												/>
											</div>
										))}

										{/* Add Custom Amenity Section */}
										<div className="mt-4">
											<label
												className={`block text-sm font-medium mb-1 ${
													darkMode ? "text-gray-300" : "text-gray-700"
												}`}
											>
												Add Custom Amenity
											</label>
											<div className="flex flex-wrap gap-2">
												<input
													type="text"
													placeholder="Amenity Name"
													value={customAmenity.name}
													onChange={(e) =>
														setCustomAmenity({
															...customAmenity,
															name: e.target.value,
														})
													}
													className={`flex-grow p-2 rounded border ${
														darkMode
															? "bg-gray-700 border-gray-600"
															: "bg-white border-gray-300"
													}`}
												/>
												<input
													type="number"
													placeholder="Fee"
													min="0"
													value={customAmenity.fee}
													onChange={(e) =>
														setCustomAmenity({
															...customAmenity,
															fee: parseFloat(e.target.value) || 0,
														})
													}
													className={`w-20 p-2 rounded border ${
														darkMode
															? "bg-gray-700 border-gray-600"
															: "bg-white border-gray-300"
													}`}
												/>
												<button
													onClick={handleAddCustomAmenity}
													className={`px-4 py-2 rounded ${
														darkMode
															? "bg-blue-600 text-white hover:bg-blue-500"
															: "bg-blue-500 text-white hover:bg-blue-600"
													}`}
												>
													Add
												</button>
											</div>
										</div>
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
								<div className={`rounded-lg h-45 overflow-hidden ${
									darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-800"
								}`}>
									<div>
										<label className={`block text-sm font-medium mb-1 ${
											darkMode ? "text-gray-300" : "text-gray-700"
										}`}>
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
										<label className={`block text-sm font-medium mb-1 ${
											darkMode ? "text-gray-300" : "text-gray-700"
										}`}>
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
										<label className={`block text-sm font-medium mb-1 ${
											darkMode ? "text-gray-300" : "text-gray-700"
										}`}>
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
									<MapPickerV2
										onAddressSelect={(selectedAddress) => {
											setAddress({
												houseNumber: selectedAddress.houseNumber,
												street: selectedAddress.street,
												city: selectedAddress.city,
												zip: selectedAddress.zip,
												lat: selectedAddress.lat,
												lng: selectedAddress.lng
											});
										}}
										initialLocation={{
											lat: parseFloat(address.lat) || 14.586207,
											lng: parseFloat(address.lng) || 120.986373
										}}
										className={`p-3 border rounded-lg ${
											darkMode
												? "bg-gray-700 text-gray-300 border-gray-600"
												: "bg-white text-gray-800 border-gray-300"
										}`}
									/>
								</div>
							</div>
						</div>

						{/* Fixed Footer */}
						<div
							className={`absolute bottom-0 left-0 right-0 p-6 ${
								darkMode
									? "border-gray-700 bg-gray-800"
									: "border-gray-200 bg-white"
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
										{/* Thumbnail Images */}
										{/* Main Image */}
										<div
											className={`h-60 sm:h-80 rounded-lg shadow-md mb-4 flex items-center justify-center overflow-hidden ${
												darkMode
													? "bg-gray-700 text-gray-300"
													: "bg-gray-200 text-gray-600"
											}`}
										>
											{existingImages.length + selectedImages.length > 0 ? (
												<img
													src={
														existingImages.length > 0
															? existingImages[0].link // First existing image
															: URL.createObjectURL(selectedImages[0]) // First uploaded image
													}
													alt="Main Preview"
													className="w-full h-full object-cover"
												/>
											) : (
												<span>Main Image</span>
											)}
										</div>

										{/* Thumbnail Images */}
										<div className="flex justify-between space-x-2 overflow-x-auto">
											{existingImages.slice(0, 4).map((image, index) => (
												<div
													key={`existing-${index}`}
													className={`h-16 w-20 sm:h-20 sm:w-24 rounded-md ${
														darkMode ? "bg-gray-600" : "bg-gray-300"
													} overflow-hidden relative`}
												>
													<img
														src={image.link}
														alt={`Existing ${index}`}
														className="w-full h-full object-cover"
													/>
													<button
														className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full p-1"
														onClick={() => handleRemoveExistingImages(index)}
													>
														<IoClose className="w-4 h-4" />
													</button>
												</div>
											))}

											{selectedImages
												.slice(0, 4 - existingImages.length)
												.map((image, index) => (
													<div
														key={`selected-${index}`}
														className={`h-16 w-20 sm:h-20 sm:w-24 rounded-md ${
															darkMode ? "bg-gray-600" : "bg-gray-300"
														} overflow-hidden relative`}
													>
														<img
															src={URL.createObjectURL(image)}
															alt={`Selected ${index}`}
															className="w-full h-full object-cover"
														/>
														<button
															className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full p-1"
															onClick={() => handleRemoveImage(index)}
														>
															<IoClose className="w-4 h-4" />
														</button>
													</div>
												))}

											{/* Placeholder divs to maintain layout if fewer than 4 images */}
											{Array.from({
												length: Math.max(
													4 - (existingImages.length + selectedImages.length),
													0
												),
											}).map((_, i) => (
												<div
													key={`placeholder-${i}`}
													className={`h-16 w-20 sm:h-20 sm:w-24 rounded-md ${
														darkMode ? "bg-gray-600" : "bg-gray-300"
													}`}
												></div>
											))}
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
											{title || "Placeholder Title"}
										</h2>
										<p
											className={`mt-2 ${
												darkMode ? "text-gray-400" : "text-gray-600"
											}`}
										>
											{address.street + ", " + address.city || "Ermita, Manila"}
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
											{priceType === "per_head"
												? `₱${pricePerUnit || "0"} / person / ${rentPeriod}`
												: `₱${pricePerUnit || "0"} total`}
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
												} capitalize`}
											>
												{selectedAmenities.length > 0 ? (
													selectedAmenities.map((amenity, index) => (
														<li key={index}>
															{amenity.name}{" "}
															{amenity.fee > 0 ? `(₱${amenity.fee})` : ""}
														</li>
													))
												) : (
													<li>No amenities selected</li>
												)}
                        {utilitiesIncluded && (
													<li>
														Utilities Included:{" "}
														{includedUtilities.join(", ") || "None selected"}
													</li>
												)}
											</ul>
										</div>
										<div>
											<h4
												className={`font-semibold mb-2 ${
													darkMode ? "text-gray-300" : "text-gray-800"
												}`}
											>
												Dorm Details
											</h4>
											<ul
												className={`space-y-1 ${
													darkMode ? "text-gray-400" : "text-gray-600"
												}`}
											>
												<li>Bedroom/s: {bedroomNumber}</li>
												<li>Bathroom/s: {bathroomNumber}</li>
												<li>Unit Size: {propertySize}</li>
												<li>Type: {type}</li>
                        <li>Vacant Spaces: {vacant}</li>
<li>Status: {vacancyStatus}</li>
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
