import React, { useState, useEffect, useContext } from "react";
import { fetchLeaseById, updateLease, sendLeaseToSeeker } from "../../../global/api/Leases.js";
import { fetchTermsTemplates } from "../../../global/api/Terms.js";
import { fetchUserData } from "../../../global/api/Users.js";
import { fetchOwnerListings } from "../../../global/api/Listings.js";
import { AuthContext } from "../../../global/contexts/AuthContext.js";
import { ThemeContext } from "../../../contexts/ThemeContext.js";
import { GetToken } from "../../../global/utils/Token.js";
import { toast } from "react-toastify";
import { fetchSeekersWithReservations } from '../../../global/api/Reservations.js';

const EditLease = ({ leaseId, onLeaseUpdated, seekerId, onBack }) => {
	const passedSeekerId = seekerId || "";
	const { user } = useContext(AuthContext);
	const { darkMode } = useContext(ThemeContext);
	const storedToken = GetToken();
	const [listings, setListings] = useState([]);
	const [usePlaceholderTenant, setUsePlaceholderTenant] = useState(false);
	const [preloadedTerms, setPreloadedTerms] = useState([]);
	const [amenities, setAmenities] = useState([]);
	const [utilities, setUtilities] = useState([]);
	const [otherFees, setOtherFees] = useState([]);
	const [userProfile, setUserProfile] = useState({
		info: {
			firstName: "",
			lastName: "",
			profile: { link: "" },
		},
	});
	const [originalLease, setOriginalLease] = useState(null);
	const today = new Date().toISOString().split("T")[0];
	const [seekers, setSeekers] = useState([]);

	const [formData, setFormData] = useState({
		property: {
			propertyId: "",
			name: "",
			address: { houseNumber: "", street: "", city: "", zip: "" },
		},
		tenant: passedSeekerId?._id || null,
		tenantPlaceholder: {
			name: "",
			email: "",
			phoneNumber: "",
			emergencyContact: { name: "", phoneNumber: "" },
		},
		landlord: user?.id || null,
		landlordName: `${user?.info?.firstName || ""} ${
			user?.info?.lastName || ""
		}`,
		contractDetails: {
			startDate: "",
			endDate: "",
			moveInDate: "",
			moveOutDate: "",
			paymentFrequency: "Monthly",
			depositAmount: "",
			termsAndConditionsId: "",
			rulesAndRegulations: "",
			rentBreakdown: {
				baseRent: "",
				utilities: "",
				amenities: "",
				otherFees: [],
			},
			gracePeriod: "",
			latePaymentPolicy: "",
			noticePeriod: "",
			renewalTerms: "",
		},
		leaseType: "Fixed-Term",
	});

	const capitalizeFirstLetter = (string) => {
		if (!string) return "";
		return string.charAt(0).toUpperCase() + string.slice(1);
	};

	useEffect(() => {
		const fetchListings = async () => {
			try {
				const data = await fetchOwnerListings();
				setListings(data);
			} catch (err) {
				console.error("Failed to fetch listings:", err);
			}
		};

		fetchListings();
	}, []);

	useEffect(() => {
		const fetchLease = async () => {
			try {
				const fetchedLease = await fetchLeaseById(leaseId);
				if (
					fetchedLease.status !== "Draft" &&
					fetchedLease.status !== "Ready"
				) {
					toast.error(
						"Only leases with status 'Draft' or 'Ready' can be edited."
					);
				} else {
					setOriginalLease(JSON.parse(JSON.stringify(fetchedLease)));
					setFormData(fetchedLease);
					
					// Initialize amenities, utilities and otherFees from the lease
					// Make sure amenities have the selected property for UI
					const formattedAmenities = (fetchedLease.amenities || []).map(amenity => ({
						...amenity,
						selected: true,
					}));
					
					// Make sure utilities have the selected property for UI
					const formattedUtilities = (fetchedLease.utilities || []).map(utility => ({
						...utility,
						selected: true,
					}));
					
					setAmenities(formattedAmenities);
					setUtilities(formattedUtilities);
					setOtherFees(
						fetchedLease.contractDetails?.rentBreakdown?.otherFees || []
					);
					setUsePlaceholderTenant(
						!fetchedLease.tenant && !!fetchedLease.tenantPlaceholder?.name
					);
				}
			} catch (err) {
				console.error("Failed to fetch lease:", err);
				toast.error("Failed to fetch lease data.");
			}
		};

		const fetchUser = async () => {
			if (user?.id) {
				try {
					const user_data = await fetchUserData(user.id, storedToken);
					setUserProfile(user_data);
				} catch (err) {
					console.error("Failed to fetch user data:", err);
				}
			}
		};

		const fetchPreloadedTerms = async () => {
			try {
				const terms = await fetchTermsTemplates(user._id);
				setPreloadedTerms(terms);
			} catch (err) {
				console.error("Failed to fetch terms and conditions:", err);
			}
		};

		const fetchSeekers = async () => {
			try {
				const data = await fetchSeekersWithReservations();
				setSeekers(data);
			} catch (err) {
				console.error('Failed to fetch seekers with reservations:', err);
			}
		};

		fetchLease();
		fetchUser();
		fetchPreloadedTerms();
		fetchSeekers();
	}, [leaseId, user, storedToken]);

	useEffect(() => {
		const totalAmenitiesCost = amenities
			.filter((amenity) => amenity.selected)
			.reduce((sum, amenity) => sum + (amenity.amount || 0), 0);
		setFormData((prev) => ({
			...prev,
			contractDetails: {
				...prev.contractDetails,
				rentBreakdown: {
					...prev.contractDetails.rentBreakdown,
					amenities: totalAmenitiesCost,
				},
			},
		}));
	}, [amenities]);

	useEffect(() => {
		const totalUtilitiesCost = utilities
			.filter((util) => util.selected)
			.reduce((sum, util) => sum + (util.amount || 0), 0);
		setFormData((prev) => ({
			...prev,
			contractDetails: {
				...prev.contractDetails,
				rentBreakdown: {
					...prev.contractDetails.rentBreakdown,
					utilities: totalUtilitiesCost,
				},
			},
		}));
	}, [utilities]);

	const handleChange = (e) => {
		const { name, value } = e.target;

		if (name.includes(".")) {
			const keys = name.split(".");
			setFormData((prev) => {
				let updatedData = { ...prev };
				let nestedData = updatedData;

				keys.forEach((key, index) => {
					if (index === keys.length - 1) {
						nestedData[key] = value;
					} else {
						if (!nestedData[key]) nestedData[key] = {};
						nestedData = nestedData[key];
					}
				});

				return updatedData;
			});
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	const calculateTotalRent = () => {
		const { baseRent, utilities, amenities } =
			formData.contractDetails.rentBreakdown;
		const baseTotal = [baseRent, utilities, amenities].reduce(
			(acc, val) => acc + (parseFloat(val) || 0),
			0
		);
		const otherFeesTotal = otherFees.reduce(
			(sum, fee) => sum + (parseFloat(fee.amount) || 0),
			0
		);
		return baseTotal + otherFeesTotal;
	};

	const handleAddOtherFee = () => {
		const updatedFees = [...otherFees, { name: "", amount: 0 }];
		setOtherFees(updatedFees);
		setFormData((prev) => ({
			...prev,
			contractDetails: {
				...prev.contractDetails,
				rentBreakdown: {
					...prev.contractDetails.rentBreakdown,
					otherFees: updatedFees,
				},
			},
		}));
	};

	const handleOtherFeeChange = (index, field, value) => {
		const updatedFees = [...otherFees];
		updatedFees[index][field] = value;
		setOtherFees(updatedFees);
		setFormData((prev) => ({
			...prev,
			contractDetails: {
				...prev.contractDetails,
				rentBreakdown: {
					...prev.contractDetails.rentBreakdown,
					otherFees: updatedFees,
				},
			},
		}));
	};

	const handleRemoveOtherFee = (index) => {
		const updatedFees = [...otherFees];
		updatedFees.splice(index, 1);
		setOtherFees(updatedFees);
		setFormData((prev) => ({
			...prev,
			contractDetails: {
				...prev.contractDetails,
				rentBreakdown: {
					...prev.contractDetails.rentBreakdown,
					otherFees: updatedFees,
				},
			},
		}));
	};

	const handleRemoveUtility = (index) => {
		const updatedUtilities = [...utilities];
		updatedUtilities.splice(index, 1);
		setUtilities(updatedUtilities);
	};

	const handleRemoveAmenity = (index) => {
		const updatedAmenities = [...amenities];
		updatedAmenities.splice(index, 1);
		setAmenities(updatedAmenities);
	};

	const handleListingSelect = async (e) => {
		const selectedListingId = e.target.value;
		const selectedListing = listings.find(
			(listing) => listing._id === selectedListingId
		);
		
		if (selectedListing) {
			// Get amenities from listing and merge with existing ones
			const listingAmenities = Array.isArray(selectedListing.amenities)
				? selectedListing.amenities.map(amenity => ({
						...amenity,
						selected: true
				  }))
				: [];
			
			// Get utilities from listing and merge with existing ones
			const listingUtilities = Array.isArray(selectedListing.includedUtilities)
				? selectedListing.includedUtilities.map((name) => ({
						name: capitalizeFirstLetter(name),
						selected: true,
						amount: 0,
				  }))
				: [];

			setFormData((prev) => ({
				...prev,
				property: {
					propertyId: selectedListing._id,
					name: selectedListing.title,
					address: selectedListing.address || {
						houseNumber: "",
						street: "",
						city: "",
						zip: "",
					},
				},
			}));

			// Merge existing amenities with listing amenities, avoiding duplicates
			const mergedAmenities = [...amenities];
			listingAmenities.forEach(newAmenity => {
				if (!mergedAmenities.some(a => a.name === newAmenity.name)) {
					mergedAmenities.push(newAmenity);
				}
			});
			setAmenities(mergedAmenities);

			// Merge existing utilities with listing utilities, avoiding duplicates
			const mergedUtilities = [...utilities];
			listingUtilities.forEach(newUtility => {
				if (!mergedUtilities.some(u => u.name === newUtility.name)) {
					mergedUtilities.push(newUtility);
				}
			});
			setUtilities(mergedUtilities);
		} else {
			setFormData((prev) => ({
				...prev,
				property: {
					propertyId: "",
					name: "",
					address: { houseNumber: "", street: "", city: "", zip: "" },
				},
			}));
		}
	};

	const hasChanges = () => {
		if (!originalLease) return false;
		
		const currentLease = {
			...formData,
			amenities,
			utilities,
			contractDetails: {
				...formData.contractDetails,
				rentBreakdown: {
					...formData.contractDetails.rentBreakdown,
					otherFees: otherFees,
				},
			},
		};

		return JSON.stringify(currentLease) !== JSON.stringify(originalLease);
	};

	const validateIfReady = (formData) => {
		// Check if all required fields are filled
		const requiredFields = [
			formData.property?.propertyId,
			formData.contractDetails?.startDate,
			formData.contractDetails?.endDate,
			formData.contractDetails?.moveInDate,
			formData.contractDetails?.moveOutDate,
			formData.contractDetails?.depositAmount,
			formData.contractDetails?.rentBreakdown?.baseRent,
			formData.contractDetails?.gracePeriod,
			formData.contractDetails?.latePaymentPolicy,
			formData.contractDetails?.noticePeriod,
			formData.contractDetails?.renewalTerms
		];

		// Check if either tenant or tenantPlaceholder is filled
		const hasTenant = formData.tenant || (formData.tenantPlaceholder?.name && formData.tenantPlaceholder?.email);

		return requiredFields.every(field => field) && hasTenant;
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		
		try {
			// Check if all required fields are filled
			const isReady = validateIfReady(formData);
			
			// Update the lease with the new status
			const updatedLeaseData = {
				...formData,
				status: isReady ? "Ready" : "Draft"
			};

			const updatedLease = await updateLease(leaseId, updatedLeaseData);
			
			if (updatedLease) {
				toast.success("Lease updated successfully!");
				if (onLeaseUpdated) {
					onLeaseUpdated(updatedLease);
				}
			}
		} catch (error) {
			console.error("Error updating lease:", error);
			toast.error("Failed to update lease. Please try again.");
		}
	};

	const handleSendToSeeker = async () => {
		try {
			await sendLeaseToSeeker(leaseId);
			// Update the lease status to "Sent"
			const updatedLeaseData = {
				...formData,
				status: "Sent"
			};
			await updateLease(leaseId, updatedLeaseData);
			if (onLeaseUpdated) {
				onLeaseUpdated(updatedLeaseData);
			}
		} catch (error) {
			console.error("Error sending lease to seeker:", error);
			toast.error("Failed to send lease to seeker. Please try again.");
		}
	};

	if (!formData) {
		return (
			<div className={`${darkMode ? "text-white" : "text-black"}`}>
				Loading...
			</div>
		);
	}

	return (
		<div className={`flex-grow ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
			<div className={`shadow-md rounded-lg p-8 max-w-full mx-auto ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
				<div className="mb-4">
					<button
						type="button"
						className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
						onClick={onBack ? onBack : () => window.history.back()}
					>
						← Back
					</button>
				</div>
				<h1
					className={`text-3xl font-bold text-center mb-6 ${
						darkMode ? "text-blue-400" : "text-blue-600"
					}`}
				>
					Edit Lease
				</h1>
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Property Details Section */}
					<div>
						<h2
							className={`text-xl font-semibold ${
								darkMode ? "text-white" : "text-black"
							}`}
						>
							Property Details
						</h2>
						<div>
							<label
								className={`block text-sm font-medium ${
									darkMode ? "text-gray-300" : "text-gray-700"
								}`}
							>
								Select Property
							</label>
							<select
								name="propertyId"
								value={formData.property.propertyId}
								onChange={handleListingSelect}
								className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
									darkMode
										? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
										: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
								}`}
							>
								<option value="">Select a property</option>
								{listings.map((listing) => (
									<option key={listing._id} value={listing._id}>
										{listing.title} - {listing.address.city}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Tenant Details Section */}
					<hr className="border-t border-dotted border-gray-300 dark:border-gray-600" />
					<div>
						<h2
							className={`text-xl font-semibold mt-6 ${
								darkMode ? "text-white" : "text-black"
							}`}
						>
							Tenant Details
						</h2>
						<div>
							<label
								className={`block text-sm font-medium ${
									darkMode ? "text-gray-300" : "text-gray-700"
								}`}
							>
								Tenant Details
							</label>
							<div className="flex items-center mb-2">
								<input
									type="checkbox"
									id="usePlaceholderTenant"
									checked={usePlaceholderTenant}
									onChange={() => setUsePlaceholderTenant((prev) => !prev)}
									className="mt-1 mr-2"
								/>
								<label htmlFor="usePlaceholderTenant" className="text-sm">
									Use Placeholder Tenant Details
								</label>
							</div>
							{usePlaceholderTenant ? (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label
											className={`block text-sm font-medium ${
												darkMode ? "text-gray-300" : "text-gray-700"
											}`}
										>
											Placeholder Name
										</label>
										<input
											type="text"
											name="tenantPlaceholder.name"
											value={formData.tenantPlaceholder.name}
											onChange={handleChange}
											className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
												darkMode
													? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
													: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
											}`}
										/>
									</div>
									<div>
										<label
											className={`block text-sm font-medium ${
												darkMode ? "text-gray-300" : "text-gray-700"
											}`}
										>
											Placeholder Email
										</label>
										<input
											type="email"
											name="tenantPlaceholder.email"
											value={formData.tenantPlaceholder.email}
											onChange={handleChange}
											className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
												darkMode
													? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
													: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
											}`}
										/>
									</div>
									<div>
										<label
											className={`block text-sm font-medium ${
												darkMode ? "text-gray-300" : "text-gray-700"
											}`}
										>
											Placeholder Phone
										</label>
										<input
											type="text"
											name="tenantPlaceholder.phoneNumber"
											value={
												formData.tenantPlaceholder.phoneNumber
											}
											onChange={handleChange}
											className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
												darkMode
													? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
													: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
											}`}
										/>
									</div>
									<div>
										<label
											className={`block text-sm font-medium ${
												darkMode ? "text-gray-300" : "text-gray-700"
											}`}
										>
											Emergency Contact Name
										</label>
										<input
											type="text"
											name="tenantPlaceholder.emergencyContact.name"
											value={formData.tenantPlaceholder.emergencyContact.name}
											onChange={handleChange}
											className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
												darkMode
													? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
													: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
											}`}
										/>
									</div>
									<div>
										<label
											className={`block text-sm font-medium ${
												darkMode ? "text-gray-300" : "text-gray-700"
											}`}
										>
											Emergency Contact Phone
										</label>
										<input
											type="text"
											name="tenantPlaceholder.emergencyContact.phoneNumber"
											value={
												formData.tenantPlaceholder.emergencyContact.phoneNumber
											}
											onChange={handleChange}
											className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
												darkMode
													? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
													: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
											}`}
										/>
									</div>
								</div>
							) : (
								<div>
									<label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Select Tenant</label>
									<select
										name="tenant"
										value={formData.tenant || ''}
										onChange={handleChange}
										className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' : 'bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500'}`}
									>
										<option value="">Select a tenant</option>
										{seekers.map(seeker => (
											<option key={seeker._id} value={seeker._id}>
												{seeker.firstName} {seeker.lastName}
											</option>
										))}
									</select>
								</div>
							)}
						</div>
					</div>

					{/* Lease Details Section */}
					<hr className="border-t border-dotted border-gray-300 dark:border-gray-600" />
					<div>
						<h2
							className={`text-xl font-semibold mt-6 ${
								darkMode ? "text-white" : "text-black"
							}`}
						>
							Lease Details
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							<div>
								<label
									className={`block text-sm font-medium ${
										darkMode ? "text-gray-300" : "text-gray-700"
									}`}
								>
									Lease Start Date
								</label>
								<input
									type="date"
									name="contractDetails.startDate"
									value={formData.contractDetails.startDate}
									onChange={handleChange}
									min={today}
									className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
										darkMode
											? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
											: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
									}`}
								/>
							</div>
							<div>
								<label
									className={`block text-sm font-medium ${
										darkMode ? "text-gray-300" : "text-gray-700"
									}`}
								>
									Lease End Date
								</label>
								<input
									type="date"
									name="contractDetails.endDate"
									value={formData.contractDetails.endDate}
									onChange={handleChange}
									min={formData.contractDetails.startDate || today}
									className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
										darkMode
											? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
											: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
									}`}
								/>
							</div>
							<div>
								<label
									className={`block text-sm font-medium ${
										darkMode ? "text-gray-300" : "text-gray-700"
									}`}
								>
									Lease Type
								</label>
								<select
									name="leaseType"
									value={formData.leaseType}
									onChange={handleChange}
									className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
										darkMode
											? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
											: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
									}`}
								>
									<option value="Fixed-Term">Fixed-Term</option>
									<option value="Month-to-Month">Month-to-Month</option>
								</select>
							</div>
							<div>
								<label
									className={`block text-sm font-medium ${
										darkMode ? "text-gray-300" : "text-gray-700"
									}`}
								>
									Move-in Date
								</label>
								<input
									type="date"
									name="contractDetails.moveInDate"
									value={formData.contractDetails.moveInDate}
									onChange={handleChange}
									min={today}
									className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
										darkMode
											? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
											: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
									}`}
								/>
							</div>
							<div>
								<label
									className={`block text-sm font-medium ${
										darkMode ? "text-gray-300" : "text-gray-700"
									}`}
								>
									Move-out Date
								</label>
								<input
									type="date"
									name="contractDetails.moveOutDate"
									value={formData.contractDetails.moveOutDate}
									onChange={handleChange}
									min={formData.contractDetails.moveInDate || today}
									className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
										darkMode
											? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
											: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
									}`}
								/>
							</div>
						</div>
					</div>

					{/* Financial Details Section */}
					<hr className="border-t border-dotted border-gray-300 dark:border-gray-600" />
					<div>
						<h2
							className={`text-xl font-semibold mt-6 ${
								darkMode ? "text-white" : "text-black"
							}`}
						>
							Financial Details
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label
									className={`block text-sm font-medium ${
										darkMode ? "text-gray-300" : "text-gray-700"
									}`}
								>
									Base Rent
								</label>
								<input
									type="number"
									name="contractDetails.rentBreakdown.baseRent"
									value={formData.contractDetails.rentBreakdown.baseRent}
									onChange={handleChange}
									min="0"
									className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
										darkMode
											? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
											: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
									}`}
								/>
							</div>
							<div>
								<label
									className={`block text-sm font-medium ${
										darkMode ? "text-gray-300" : "text-gray-700"
									}`}
								>
									Deposit Amount
								</label>
								<input
									type="number"
									name="contractDetails.depositAmount"
									value={formData.contractDetails.depositAmount}
									onChange={handleChange}
									min="0"
									className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
										darkMode
											? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
											: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
									}`}
								/>
							</div>
							<div className="col-span-2">
								<h3
									className={`text-lg font-medium ${
										darkMode ? "text-white" : "text-black"
									}`}
								>
									Utilities
								</h3>
								{utilities.map((util, index) => (
									<div key={index} className="flex items-center space-x-2 mb-2">
										<input
											type="checkbox"
											checked={util.selected}
											onChange={(e) => {
												const newUtilities = [...utilities];
												newUtilities[index].selected = e.target.checked;
												setUtilities(newUtilities);
											}}
											className="mt-1"
										/>
										<input
											type="text"
											placeholder="Utility name"
											value={util.name || ""}
											onChange={(e) => {
												const newUtilities = [...utilities];
												newUtilities[index].name = e.target.value;
												setUtilities(newUtilities);
											}}
											className={`mt-1 block w-1/3 border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
												darkMode
													? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
													: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
											}`}
										/>
										{util.selected && (
											<input
												type="number"
												value={util.amount}
												onChange={(e) => {
													const newUtilities = [...utilities];
													newUtilities[index].amount =
														parseFloat(e.target.value) || 0;
													setUtilities(newUtilities);
												}}
												min="0"
												className={`mt-1 block w-1/4 border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
													darkMode
														? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
														: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
												}`}
											/>
										)}
										<button
											type="button"
											onClick={() => handleRemoveUtility(index)}
											className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
										>
											Remove
										</button>
									</div>
								))}
								<button
									type="button"
									onClick={() =>
										setUtilities([
											...utilities,
											{ name: "", amount: 0, selected: true },
										])
									}
									className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
								>
									Add Utility
								</button>
							</div>
							<div className="col-span-2">
								<h3
									className={`text-lg font-medium ${
										darkMode ? "text-white" : "text-black"
									}`}
								>
									Amenities
								</h3>
								{amenities.map((amenity, index) => (
									<div key={index} className="flex items-center space-x-2 mb-2">
										<input
											type="checkbox"
											checked={amenity.selected}
											onChange={(e) => {
												const newAmenities = [...amenities];
												newAmenities[index].selected = e.target.checked;
												setAmenities(newAmenities);
											}}
											className="mt-1"
										/>
										<input
											type="text"
											placeholder="Amenity name"
											value={amenity.name || ""}
											onChange={(e) => {
												const newAmenities = [...amenities];
												newAmenities[index].name = e.target.value;
												setAmenities(newAmenities);
											}}
											className={`mt-1 block w-1/3 border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
												darkMode
													? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
													: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
											}`}
										/>
										{amenity.selected && (
											<input
												type="number"
												value={amenity.amount}
												onChange={(e) => {
													const newAmenities = [...amenities];
													newAmenities[index].amount =
														parseFloat(e.target.value) || 0;
													setAmenities(newAmenities);
												}}
												min="0"
												className={`mt-1 block w-1/4 border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
													darkMode
														? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
														: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
												}`}
											/>
										)}
										<button
											type="button"
											onClick={() => handleRemoveAmenity(index)}
											className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
										>
											Remove
										</button>
									</div>
								))}
								<button
									type="button"
									onClick={() =>
										setAmenities([
											...amenities,
											{ name: "", amount: 0, selected: true },
										])
									}
									className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
								>
									Add Amenity
								</button>
							</div>
							<div className="col-span-2">
								<h3
									className={`text-lg font-medium ${
										darkMode ? "text-white" : "text-black"
									}`}
								>
									Other Fees
								</h3>
								{otherFees.map((fee, index) => (
									<div key={index} className="flex items-center space-x-2 mb-2">
										<input
											type="text"
											placeholder="Fee name"
											value={fee.name}
											onChange={(e) =>
												handleOtherFeeChange(index, "name", e.target.value)
												}
											className={`mt-1 block w-1/3 border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
												darkMode
													? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
													: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
											}`}
										/>
										<input
											type="number"
											placeholder="Amount"
											value={fee.amount}
											onChange={(e) =>
												handleOtherFeeChange(index, "amount", e.target.value)
											}
											min="0"
											className={`mt-1 block w-1/4 border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
												darkMode
													? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
													: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
											}`}
										/>
										<button
											type="button"
											onClick={() => handleRemoveOtherFee(index)}
											className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
										>
											Remove
										</button>
									</div>
								))}
								<button
									type="button"
									onClick={handleAddOtherFee}
									className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
								>
									Add Other Fee
								</button>
							</div>
							<div className="col-span-2">
								<label
									className={`block text-sm font-medium ${
										darkMode ? "text-gray-300" : "text-gray-700"
									}`}
								>
									Rent Breakdown
								</label>
								<div className="mt-1 space-y-1">
									<p>
										Base Rent:{" "}
										{formData.contractDetails.rentBreakdown.baseRent || 0}
									</p>
									<p>
										Utilities:{" "}
										{formData.contractDetails.rentBreakdown.utilities || 0}
									</p>
									<p>
										Amenities:{" "}
										{formData.contractDetails.rentBreakdown.amenities || 0}
									</p>
									{otherFees.map((fee, index) => (
										<p key={index}>
											{fee.name}: {fee.amount}
										</p>
									))}
								</div>
								<label
									className={`block text-sm font-medium mt-2 ${
										darkMode ? "text-gray-300" : "text-gray-700"
									}`}
								>
									Total Rent
								</label>
								<input
									type="text"
									value={calculateTotalRent()}
									readOnly
									className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
										darkMode
											? "bg-gray-700 border-gray-600 text-white"
											: "bg-white border-gray-300 text-black"
									}`}
								/>
							</div>
						</div>
					</div>

					{/* Payment Policies Section */}
					<hr className="border-t border-dotted border-gray-300 dark:border-gray-600" />
					<div>
						<h2
							className={`text-xl font-semibold mt-6 ${
								darkMode ? "text-white" : "text-black"
							}`}
						>
							Payment Policies
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label
									className={`block text-sm font-medium ${
										darkMode ? "text-gray-300" : "text-gray-700"
									}`}
								>
									Payment Frequency
								</label>
								<select
									name="contractDetails.paymentFrequency"
									value={formData.contractDetails.paymentFrequency}
									onChange={handleChange}
									className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
										darkMode
											? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
											: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
									}`}
								>
									<option value="">Select Frequency Terms</option>
									<option value="Monthly">Monthly</option>
									<option value="Quarterly">Quarterly</option>
									<option value="Yearly">Yearly</option>
								</select>
							</div>
							<div>
								<label
									className={`block text-sm font-medium ${
										darkMode ? "text-gray-300" : "text-gray-700"
									}`}
								>
									Grace Period (days)
								</label>
								<input
									type="number"
									name="contractDetails.gracePeriod"
									value={formData.contractDetails.gracePeriod}
									onChange={handleChange}
									min="0"
									className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
										darkMode
											? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
											: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
									}`}
								/>
							</div>
							<div className="col-span-2">
								<label
									className={`block text-sm font-medium ${
										darkMode ? "text-gray-300" : "text-gray-700"
									}`}
								>
									Late Payment Policy
								</label>
								<textarea
									name="contractDetails.latePaymentPolicy"
									value={formData.contractDetails.latePaymentPolicy}
									onChange={handleChange}
									className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
										darkMode
											? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
											: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
									}`}
								/>
							</div>
						</div>
					</div>

					{/* Legal and Policy Details Section */}
					<hr className="border-t border-dotted border-gray-300 dark:border-gray-600" />
					<div>
						<h2
							className={`text-xl font-semibold mt-6 ${
								darkMode ? "text-white" : "text-black"
							}`}
						>
							Legal and Policy Details
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label
									className={`block text-sm font-medium ${
										darkMode ? "text-gray-300" : "text-gray-700"
									}`}
								>
									Notice Period (days)
								</label>
								<input
									type="number"
									name="contractDetails.noticePeriod"
									value={formData.contractDetails.noticePeriod}
									onChange={handleChange}
									min="0"
									className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
										darkMode
											? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
											: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
									}`}
								/>
							</div>
							<div>
								<label
									className={`block text-sm font-medium ${
										darkMode ? "text-gray-300" : "text-gray-700"
									}`}
								>
									Renewal Terms
								</label>
								<select
									name="contractDetails.renewalTerms"
									value={formData.contractDetails.renewalTerms}
									onChange={handleChange}
									className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
										darkMode
											? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
											: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
									}`}
								>
									<option value="">Select Renewal Terms</option>
									<option value="Automatic">Automatic</option>
									<option value="Manual">Manual</option>
									<option value="No Renewal">No Renewal</option>
								</select>
							</div>
							<div>
								<label
									className={`block text-sm font-medium ${
										darkMode ? "text-gray-300" : "text-gray-700"
									}`}
								>
									Terms and Conditions
								</label>
								<select
									name="contractDetails.termsAndConditionsId"
									value={formData.contractDetails.termsAndConditionsId}
									onChange={handleChange}
									className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
										darkMode
											? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
											: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
									}`}
								>
									<option value="">Select Preloaded Terms</option>
									{preloadedTerms.map((term) => (
										<option key={term._id} value={term._id}>
											{term.title}
										</option>
									))}
								</select>
							</div>
							<div className="col-span-2">
								<label
									className={`block text-sm font-medium ${
										darkMode ? "text-gray-300" : "text-gray-700"
									}`}
								>
									Rules and Regulations
								</label>
								<textarea
									name="contractDetails.rulesAndRegulations"
									value={formData.contractDetails.rulesAndRegulations}
									onChange={handleChange}
									rows="4"
									className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${
										darkMode
											? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
											: "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"
									}`}
								/>
							</div>
						</div>
					</div>

					{/* Submit Button */}
					<div className="mt-6 flex justify-end space-x-4">
						<button
							type="submit"
							className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600`}
						>
							Update Lease
						</button>
						
						{formData.status === "Ready" && (
							<button
								type="button"
								onClick={handleSendToSeeker}
								className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600`}
							>
								Send to Seeker
							</button>
						)}
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditLease;