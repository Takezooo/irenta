import React, { useState, useEffect, useContext } from "react";
import Topbar from "../components/global/Topbar";
import { AiOutlineClose, AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useNavigate } from "react-router-dom"; // Import React Router hook
import RequestOcularVisit from "../components/Listing/RequestOcularVisit";
import { Footer } from "../components/global/Footer";
import { AuthContext } from "../global/contexts/AuthContext";
import { ThemeContext } from "../contexts/ThemeContext"; // Import ThemeContext
import { useProperty } from "../global/contexts/PropertyContext";
import { ChatDropdownContext } from "../global/contexts/ChatDropdownContext";
import LoadingScreen from "../components/global/Loading";
import { GetToken } from "../global/utils/Token";
import { getOrCreateChat } from "../global/api/Chats";
import { scheduleOcularVisit, checkVisitRequest } from "../global/api/Ocular";
import { fetchUserData, fetchOwnerData, toggleLike } from "../global/api/Users";
import { createReservation } from "../global/api/Reservations";
import { GoogleMap, MarkerF, useLoadScript } from "@react-google-maps/api";
// import RenderPanorama from "../components/Panorama/Panorama"
import RenderImage from "../components/Panorama/RenderImage";
import { MapContainer, TileLayer } from 'react-leaflet';

const LIBRARIES = ["places"]; // Static array for libraries

export const ViewListing = () => {
	const [showOcularPopup, setShowOcularPopup] = useState(false);
	const [location, setLocation] = useState("Bacoor");
	const [ownerData, setOwnerData] = useState([]);
	// const [hasRequestedVisit, setHasRequestedVisit] = useState(false);
	const { selectedProperty } = useProperty();
	const { setChatRoomOpen, setSelectedChatId, setSelectedUserId } =
		useContext(ChatDropdownContext);
	const { user } = useContext(AuthContext);
	const { darkMode } = useContext(ThemeContext); // Use ThemeContext
	const navigate = useNavigate();
	const authToken = GetToken();
	const [likedListings, setLikedListings] = useState([]);
	const [propertyImages, setProperyImages] = useState([]);

	const { isLoaded, loadError } = useLoadScript({
		googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, // Use environment variable for API key
		libraries: LIBRARIES, // Pass static array
	});
	// Fetch user's liked listings on page load
	useEffect(() => {
		if (user) {
			const fetchUserLikes = async () => {
				try {
					const updatedUser = await fetchUserData(user?.id, authToken); // Fetch user's liked listings from backend
					setLikedListings(updatedUser.likedListings || []);
				} catch (error) {
					console.error("Error fetching liked listings:", error);
				}
			};
			fetchUserLikes();
		} else {
			setLikedListings([]);
		}
	}, [user, authToken]);

	useEffect(() => {
		const fetchPropOwnerData = async () => {
			if (!selectedProperty?.userId) {
				return;
			}
			try {
				const owner = await fetchOwnerData(selectedProperty?.userId);
				console.log(owner);
				setOwnerData(owner);
				setProperyImages(selectedProperty?.images);
			} catch (error) {
				console.error("Error fetching property owner data:", error);
			}
		};
		fetchPropOwnerData();
	}, [selectedProperty]);

	// Check if the seeker has requested a visit for this listing
	useEffect(() => {
		const checkSeekerVisitRequest = async () => {
			if (selectedProperty?._id && user) {
				try {
					const result = await checkVisitRequest(selectedProperty._id, user.id);
				} catch (error) {
					console.error("Error checking visit request status:", error);
				}
			}
		};
		checkSeekerVisitRequest();
	}, [selectedProperty, user]);

	const handleLikeToggle = async (listings) => {
		if (!user) {
			navigate("/login");
			return;
		}
		try {
			await toggleLike(listings); // Call API to toggle like
			const updatedUser = await fetchUserData(user?.id, authToken); // Fetch updated liked listings
			if (updatedUser?.likedListings) {
				setLikedListings(updatedUser.likedListings); // Update local state
			} else {
				console.warn("Liked listings not found in updated user data");
			}
		} catch (error) {
			console.error("Error toggling like:", error);
		}
	};

	const handleClose = () => {
		navigate(-1 || "/"); // Go back to the previous page if no history
	};

	const handleChatClick = async (ownerId, listingId) => {
		try {
			const chat = await getOrCreateChat(ownerId, listingId);

			if (chat) {
				setSelectedChatId(chat._id); // Set the selected chat in ChatDropdown
				const otherParticipant = chat.participants.find(
					(p) => p._id !== user?.id
				);
				setSelectedUserId(otherParticipant?._id || null);
				setChatRoomOpen(true); // Open the chat room
			}
		} catch (error) {
			console.error("Error handling chat click:", error);
		}
	};

	const handleRequestVisit = async (selectedDate, selectedTime) => {
		const propertyId = selectedProperty?._id;

		if (!propertyId || !selectedDate || !selectedTime) {
			alert("Please select a date and time for the visit.");
			return;
		}

		try {
			await scheduleOcularVisit(propertyId, selectedDate, selectedTime);
			alert("Request visit scheduled!");
		} catch (err) {
			console.error(
				"Failed to request visit:",
				err.response?.data?.message || err.message
			);
		}
	};

	const handleReserveListing = async () => {
		navigate("/request-reservation");
	};

	// useEffect(() => {
	//   setHasRequestedVisit(hasRequestedVisit); // Rebind state directly to force evaluation
	// }, [hasRequestedVisit]);

	const handleOpenPopup = () => {
		if (!user) {
			navigate("/login");
		}
		setShowOcularPopup(true); // Open the popup
	};

	const closePopup = () => {
		setShowOcularPopup(false);
	};

	const handleViewProfilePage = (profileId) => {
		if (!profileId) {
			console.error("User ID is missing!");
			return;
		}
		navigate(`/profile/${profileId}`); // Navigate to the clicked user's profile
	};

  const capitalizeFirstLetter = (item) => {
    return item.charAt(0).toUpperCase() + item.slice(1)
  }

	if (!isLoaded) return <LoadingScreen />;

	return (
		<div
			className={`min-h-screen font-sans ${
				darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
			}`}
		>
			<Topbar />

			<div
				className={`px-4 mt-16 sm:px-6 lg:px-12 xl:px-36 py-8 ${
					darkMode ? "bg-gray-900" : "bg-gray-100"
				}`}
			>
				{/* Close Button */}
				<button
					onClick={handleClose}
					className={`fixed right-10 rounded-full p-2 transition ${
						darkMode
							? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
							: "bg-gray-200 text-gray-400 hover:bg-gray-400 hover:text-gray-600"
					}`}
				>
					<AiOutlineClose className="w-6 h-6" />
				</button>

				<div className="flex flex-col items-center gap-6">
					{/* Image Gallery */}
					<RenderImage propertyImages={propertyImages} darkMode={darkMode} />
					{/* Property Details */}
					<div className="flex flex-col lg:flex-row gap-6 w-full lg:w-3/4">
						{/* Details Section */}
						<div
							className={`flex flex-col lg:flex-row gap-6 w-full ${
								darkMode ? "bg-gray-900" : "bg-gray-100"
							}`}
						>
							<div
								className={`w-full rounded-lg shadow-md p-4 ${
									darkMode
										? "bg-gray-800 text-gray-200"
										: "bg-white text-gray-800"
								}`}
							>
								{/* Details Section */}
								<div className="w-full flex flex-col">
									<div
										className={`border-b pb-4 mb-4 ${
											darkMode ? "border-gray-700" : "border-gray-300"
										}`}
									>
										<h2
											className={`text-xl sm:text-2xl font-bold ${
												darkMode ? "text-blue-400" : "text-blue-600"
											}`}
										>
											{selectedProperty?.title}
										</h2>
										<p
											className={`mt-2 ${
												darkMode ? "text-gray-400" : "text-gray-600"
											}`}
										>
											{selectedProperty?.address?.houseNumber}{" "}
											{selectedProperty?.address?.street}{" "}
											{selectedProperty?.address?.city}
										</p>
									</div>

									<div
										className={`border-b pb-4 mb-2 ${
											darkMode ? "border-gray-700" : "border-gray-300"
										}`}
									>
										<h3 className="text-lg sm:text-2xl font-semibold mb-4">
											₱ {selectedProperty?.price} / head / month
										</h3>
										<div className="w-full flex justify-between flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
											<div className="space-x-2">
												<button
													disabled={user && user.userType === "Owner"}
													onClick={handleOpenPopup}
													className={`${
														user && user.userType === "Owner"
															? "bg-gray-300 px-4 py-2 rounded-full cursor-not-allowed opacity-50"
															: "bg-blue-500 text-white   hover:bg-blue-600 px-4 py-2 rounded-full"
													}`}
												>
													Request Visit
												</button>
												<button
													disabled={user && user.userType === "Owner"}
													onClick={handleReserveListing}
													className={`${
														user && user.userType === "Owner"
															? "bg-gray-300 px-4 py-2 rounded-full cursor-not-allowed opacity-50"
															: "bg-blue-500 text-white   hover:bg-blue-600 px-4 py-2 rounded-full"
													}`}
												>
													Book Now
												</button>
											</div>
											<button
												onClick={() => handleLikeToggle(selectedProperty?._id)}
												className="flex items-center gap-1"
											>
												{likedListings.includes(selectedProperty?._id) ? (
													<>
														<AiFillHeart size={20} className="text-red-500" />
														<p>Liked</p>
													</>
												) : (
													<>
														<AiOutlineHeart size={20} />
														<p>Like</p>
													</>
												)}
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

									{/*  Amenities and Inclusions; Payment Terms */}
									<div
										className={`mt-2 grid grid-cols-1 sm:grid-cols-2 gap-6 border rounded-lg p-4 ${
											darkMode ? "border-gray-700" : "border-gray-300"
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
											{(selectedProperty?.amenities || []).map(
												(amenity, index) => (
													<div key={index} className="flex items-center">
														<svg
															className="w-4 h-4 mr-2 text-green-500"
															fill="none"
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path d="M5 13l4 4L19 7"></path>
														</svg>
														<span>
															{amenity.name}: ₱{amenity.fee}.00
														</span>
													</div>
												)
											)}
											{(selectedProperty?.includedUtilities || []).map(
												(utils, index) => (
													<div key={index} className="flex items-center">
														<svg
															className="w-4 h-4 mr-2 text-green-500"
															fill="none"
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path d="M5 13l4 4L19 7"></path>
														</svg>
														<span>
															{capitalizeFirstLetter(utils)}
														</span>
													</div>
												)
											)}
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
												<li>Bedroom/s: {selectedProperty?.bedroomNumber}</li>
												<li>Bathroom/s: {selectedProperty?.bathroomNumber}</li>
												<li>Unit Size: {selectedProperty?.propertySize}</li>
												<li>Type: {selectedProperty?.type}</li>
												<li>
													Available Space: {selectedProperty?.vacantUnits}
												</li>
												<li>
													Vacancy Status: {selectedProperty?.vacancyStatus}
												</li>
											</ul>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Nearby Establishments */}
						<div className="w-full lg:w-1/3 flex flex-col gap-6">
							{/* <div
                className={`rounded-lg shadow-md p-4 ${
                  darkMode
                    ? "bg-gray-800 text-gray-300"
                    : "bg-white text-gray-800"
                }`}
              >
                <h2 className="text-lg font-semibold mb-4">
                  Nearby Establishments
                </h2>
                <ul
                  className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  <li>Jollibee</li>
                  <li>Simbahan</li>
                  <li>SM</li>
                </ul>
              </div> */}

							{/* Property Owner */}
							<div
								className={`rounded-lg shadow-md border p-6 ${
									darkMode
										? "bg-gray-800 text-gray-300 border-gray-700"
										: "bg-white text-gray-800 border-gray-300"
								}`}
							>
								<div className="flex flex-col items-center">
									<div
										className={`h-24 w-24 rounded-full flex items-center justify-center overflow-hidden mb-4 ${
											darkMode ? "bg-gray-700" : "bg-gray-200"
										}`}
									>
										<img
											src={
												ownerData?.info?.profile?.link ||
												"https://via.placeholder.com/150"
											}
											onClick={() =>
												handleViewProfilePage(selectedProperty?.userId)
											}
											alt="Profile"
											className="h-full w-full object-cover"
										/>
									</div>
									<h3 className="text-lg font-bold">
										{ownerData?.info?.firstName}{" "}
										{ownerData?.info?.lastName || "Owner"}
									</h3>
									<p
										className={`${
											darkMode ? "text-gray-400" : "text-gray-500"
										} mt-1`}
									>
										Property Owner
									</p>
								</div>
								<button
									className={`mt-6 w-full font-medium py-2 rounded-md shadow-md ${
										darkMode
											? "bg-blue-500 hover:bg-blue-600 text-white"
											: "bg-blue-500 hover:bg-blue-600 text-white"
									}`}
									onClick={() =>
										handleChatClick(
											selectedProperty.userId,
											selectedProperty._id
										)
									}
								>
									Send a message
								</button>
							</div>
						</div>
					</div>

					{/* Pinned Location */}
					<div
						className={`w-full lg:w-3/4 rounded-lg shadow-md p-4 ${
							darkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-800"
						}`}
					>
						<h2 className="text-lg font-semibold mb-4">Pinned Location</h2>
						<div className="w-full h-64 sm:h-80 lg:h-96 rounded overflow-hidden">
							{selectedProperty?.address?.lng && selectedProperty?.address?.lat && (
								<MapContainer
								center={{
									lat: 14.582815,
									lng: 120.983952,
								}}
								zoom={16}
								zoomControl={false}
								doubleClickZoom={false} 
								scrollWheelZoom={false}
								className="w-full h-full z-0" // ✅ ensure it fills the container
								>
								<TileLayer
									attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
									url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
								/>
								</MapContainer>
							)}
						</div>
					</div>

					{/* Reviews Section */}
					<div
						className={`w-full lg:w-3/4 rounded-lg shadow-md p-4 ${
							darkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-800"
						}`}
					>
						<h2 className="text-lg font-semibold mb-4">Reviews</h2>
						<div className="text-blue-500 text-xl font-bold">
							8.9/10 Excellent
						</div>
						<blockquote
							className={`italic mt-2 ${
								darkMode ? "text-gray-400" : "text-gray-600"
							}`}
						>
							“Love this website! User-friendly interface and detailed listings
							made my dorm search stress-free.”
						</blockquote>
					</div>
				</div>
			</div>

			{showOcularPopup && (
				<RequestOcularVisit
					propertyDetails={selectedProperty}
					onClose={closePopup}
					onRequestVisit={handleRequestVisit}
				/>
			)}

			<Footer />
		</div>
	);
};

export default ViewListing;
