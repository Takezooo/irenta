import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineClose } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import MapPickerV2 from "../Mapping/MapPickerV2.js";
import { GetToken } from "../../global/utils/Token.js";
import { ThemeContext } from "../../contexts/ThemeContext";

const API_LINK = "https://irenta-production.up.railway.app/api";

const AddListing = () => {
	const { darkMode } = useContext(ThemeContext);
	const storedToken = GetToken();
	const [selectedImages, setSelectedImages] = useState([]);
	const [fileName] = useState("No file chosen");
	const [errorMessage, setErrorMessage] = useState("");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [price, setPrice] = useState("");
	const [type, setType] = useState("");
	const [bedroomNumber, setBedroomNumber] = useState("");
	const [bathroomNumber, setBathroomNumber] = useState("");
	const [propertySize, setPropertySize] = useState("");
	const [address, setAddress] = useState({
		houseNumber: "",
		street: "",
		city: "",
		zip: "",
		lng: null,
		lat: null,
	});
	console.log(address)
	const [visitAvailability, setVisitAvailability] = useState({
		startTime: "",
		endTime: "",
	});
	const [amenities, setAmenities] = useState([
		{ name: "Pool", fee: 0, selected: false },
		{ name: "Gym", fee: 0, selected: false },
		{ name: "Parking", fee: 0, selected: false },
		{ name: "Laundry", fee: 0, selected: false },
	]);
	const [customAmenity, setCustomAmenity] = useState({
		name: "",
		fee: 0,
	});
	const [vacant, setVacant] = useState(0);
	const [vacancyStatus, setVacancyStatus] = useState("Vacant");
	useEffect(() => {
		// Automatically set vacancyStatus based on vacant count
		setVacancyStatus(vacant > 0 ? "Vacant" : "Occupied");
	}, [vacant]);
	const [utilitiesIncluded, setUtilitiesIncluded] = useState(false);
	const [includedUtilities, setIncludedUtilities] = useState([]);
	const [priceType, setPriceType] = useState("per_head");
	const [rentPeriod, setRentPeriod] = useState("month");
	const [pricePerUnit, setPricePerUnit] = useState("");
	const handleAddCustomAmenity = () => {
		if (customAmenity.name.trim() === "") {
			alert("Please enter a name for the custom amenity.");
			return;
		}

		if (
			amenities.some((amenity) => amenity.name === customAmenity.name.trim())
		) {
			alert("This amenity already exists.");
			return;
		}

		setAmenities((prevAmenities) => [
			...prevAmenities,
			{
				name: customAmenity.name.trim(),
				fee: parseFloat(customAmenity.fee) || 0,
				selected: true,
			},
		]);

		setCustomAmenity({ name: "", fee: 0 });
	};

	const handleAmenityChange = (amenityName, isSelected) => {
		setAmenities((prevAmenities) =>
			prevAmenities.map((amenity) =>
				amenity.name === amenityName
					? { ...amenity, selected: isSelected }
					: amenity
			)
		);
	};

	const handleAmenityFeeChange = (amenityName, fee) => {
		const parsedFee = parseFloat(fee);
		if (isNaN(parsedFee)) {
			return;
		}

		setAmenities((prevAmenities) =>
			prevAmenities.map((amenity) =>
				amenity.name === amenityName
					? { ...amenity, fee: Math.max(0, parsedFee) }
					: amenity
			)
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
					plusName: "",
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
					if (types.includes("plus_code")) {
						addressData.plusName = component.long_name;
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

		if (!title || !address.houseNumber || !address.street || !address.city) {
			alert("Please fill out all required fields.");
			return;
		}

		if (vacant < 0) {
			alert("Vacant spaces cannot be negative.");
			return;
		}

		const selectedAmenities = amenities
			.filter((amenity) => amenity.selected)
			.map((amenity) => ({
				name: amenity.name,
				fee: amenity.fee,
			}));

		try {
			const formData = new FormData();
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
					vacantUnits: vacant,
					utilitiesIncluded,
					includedUtilities,
					vacancyStatus,
					price: pricePerUnit,
					priceType,
					rentPeriod: priceType === "per_head" ? rentPeriod : undefined,
				})
			);

			selectedImages.forEach((file) => {
				formData.append("files", file);
			});

			const response = await axios.post(`${API_LINK}/listings`, formData, {
				headers: {
					Authorization: `Bearer ${storedToken}`,
					"Content-Type": "multipart/form-data",
				},
			});

			if (response.status === 201) {
				alert("Listing created successfully!");
				navigate("/owner-dashboard");
			}
		} catch (error) {
			console.error("Error creating listing:", error);
			alert("An error occurred while creating the listing.");
		}
	};

	const navigate = useNavigate();
	const handleFileChange = (event) => {
		const files = Array.from(event.target.files);
		const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

		const invalidFiles = files.filter(
			(file) => !allowedTypes.includes(file.type)
		);
		const newFiles = files.filter(
			(file) =>
				allowedTypes.includes(file.type) &&
				file.type.startsWith("image/") &&
				!selectedImages.includes(file)
		);

		if (invalidFiles.length > 0) {
			setErrorMessage(
				`Invalid file type detected. Only PNG, JPG, and JPEG files are allowed. Invalid files: ${invalidFiles
					.map((file) => file.name)
					.join(", ")}`
			);
			event.target.value = "";
			return;
		}

		if (selectedImages.length + newFiles.length > 10) {
			setErrorMessage("You can only upload up to 10 images.");
			return;
		}

		setErrorMessage("");
		setSelectedImages((prevImages) => [...prevImages, ...newFiles]);
	};

	const handleRemoveImage = (index) => {
		setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
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
						<h2 className="text-lg font-bold">Add a Listing</h2>
					</div>

					<div className="flex-grow overflow-y-auto p-6 space-y-6">
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
								Photos • {selectedImages.length} / 10 • You can add up to 10
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
									{selectedImages.length > 0
										? `${selectedImages.length} file(s) selected`
										: "No file chosen"}
								</span>
							</div>
							{errorMessage && (
								<p className="text-red-500 text-sm mt-2">{errorMessage}</p>
							)}
							<div>
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
													<IoClose className="w-6 h-6" />
												</button>
											</div>
										))}
									</div>
								)}
							</div>

							<div className="space-y-4">
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
										onChange={(e) => setTitle(e.target.value)}
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
										Rental Type
									</label>
									<select
										onChange={(e) => setType(e.target.value)}
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
										onChange={(e) => setVacant(parseInt(e.target.value) || 0)}
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
										placeholder="Enter number of bedrooms"
										onChange={(e) => setBedroomNumber(e.target.value)}
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
										Number of Bathrooms
									</label>
									<input
										type="number"
										placeholder="Enter number of bathrooms"
										onChange={(e) => setBathroomNumber(e.target.value)}
										className={`w-full p-3 rounded-lg border ${
											darkMode
												? "bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 focus:outline-none"
												: "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:outline-none"
										}`}
									/>
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

								{/* Price Input (renamed from price) */}
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

								<div>
									<label
										className={`block text-sm font-medium mb-1 ${
											darkMode ? "text-gray-300" : "text-gray-700"
										}`}
									>
										Amenities
									</label>
									<div
										className={`space-y-2 rounded-lg p-2 border ${
											darkMode
												? "bg-gray-800 border-gray-700"
												: "bg-white border-gray-300"
										}`}
									>
										{amenities.map((amenity) => (
											<div
												key={amenity.name}
												className="flex items-center gap-2"
											>
												<input
													type="checkbox"
													checked={amenity.selected}
													onChange={(e) =>
														handleAmenityChange(amenity.name, e.target.checked)
													}
													className={`form-checkbox ${
														darkMode ? "text-blue-400" : "text-blue-500"
													}`}
												/>
												<span className="capitalize">{amenity.name}</span>
												<input
													type="number"
													placeholder="Fee"
													min="0"
													value={amenity.fee}
													onChange={(e) =>
														handleAmenityFeeChange(amenity.name, e.target.value)
													}
													className={`ml-2 p-1 w-20 rounded border ${
														darkMode
															? "bg-gray-700 border-gray-600"
															: "bg-white border-gray-300"
													}`}
												/>
											</div>
										))}

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
										placeholder="Enter property size in square feet"
										onChange={(e) => setPropertySize(e.target.value)}
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
										Visit Availability
									</label>
									<div className="grid grid-cols-2 gap-4">
										<input
											type="time"
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
										placeholder="Enter a description of the rental"
										onChange={(e) => setDescription(e.target.value)}
										className={`w-full p-3 rounded-lg border ${
											darkMode
												? "bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 focus:outline-none"
												: "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:outline-none"
										}`}
									></textarea>
								</div>

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
									<MapPickerV2
										onAddressSelect={setAddress}
										className={` p-3 border rounded-lg ${
											darkMode
												? "bg-gray-700 text-gray-300 border-gray-600"
												: "bg-white text-gray-800 border-gray-300"
										}`}
										// onLocationChange={handleLocationChange}
									/>
								</div>
							</div>
						</div>

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
								Add Listing
							</button>
						</div>
					</div>
				</div>

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
								<div className="w-full xl:w-1/2">
									<div className="relative">
										<div
											className={`h-60 sm:h-80 rounded-lg shadow-md mb-4 flex items-center justify-center ${
												darkMode
													? "bg-gray-700 text-gray-300"
													: "bg-gray-200 text-gray-600"
											}`}
										>
											{selectedImages.length > 0 ? (
												<img
													src={URL.createObjectURL(selectedImages[0])}
													alt="Main Preview"
													className="w-full h-full object-cover rounded-lg"
												/>
											) : (
												<span>Main Image</span>
											)}
										</div>
										<div className="flex justify-between space-x-2 overflow-x-auto">
											{selectedImages.map((image, index) => (
												<div
													key={index}
													className={`h-16 w-20 sm:h-20 sm:w-24 rounded-md overflow-hidden ${
														darkMode ? "bg-gray-600" : "bg-gray-300"
													}`}
												>
													<img
														src={URL.createObjectURL(image)}
														alt={`Thumbnail ${index}`}
														className="w-full h-full object-cover"
													/>
												</div>
											))}
											{selectedImages.length < 4 &&
												Array.from({ length: 4 - selectedImages.length }).map(
													(_, index) => (
														<div
															key={`empty-${index}`}
															className={`h-16 w-20 sm:h-20 sm:w-24 rounded-md ${
																darkMode ? "bg-gray-600" : "bg-gray-300"
															}`}
														></div>
													)
												)}
										</div>
									</div>
								</div>

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
												{amenities
													.filter((amenity) => amenity.selected)
													.map((amenity, index) => (
														<li key={index}>
															{amenity.name}{" "}
															{amenity.fee > 0 ? `(₱${amenity.fee})` : ""}
														</li>
													))}
												{amenities.filter((amenity) => amenity.selected)
													.length === 0 && <li>No amenities selected</li>}
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

export default AddListing;
