import React, { useState, useEffect, useContext } from "react";
import { createLease } from "../../../global/api/Leases.js";
import { fetchUserData } from "../../../global/api/Users.js";
import { fetchOwnerListings } from "../../../global/api/Listings.js";
import { fetchTermsTemplates } from "../../../global/api/Terms.js";
import { AuthContext } from "../../../global/contexts/AuthContext.js";
import { ThemeContext } from "../../../contexts/ThemeContext.js";
import { GetToken } from "../../../global/utils/Token.js";
import { toast } from "react-toastify";

const CreateLease = ({ seekerId }) => {
  const passedSeekerId = seekerId || "";
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const storedToken = GetToken();
  const [listings, setListings] = useState([]);
  const [errors, setErrors] = useState({});
  const [usePlaceholderTenant, setUsePlaceholderTenant] = useState(false);
  const [preloadedTerms, setPreloadedTerms] = useState([]);
  const [userProfile, setUserProfile] = useState({
    info: {
      firstName: "",
      lastName: "",
      profile: { link: "" },
    },
  });
  const [amenities, setAmenities] = useState([]);
  const [utilities, setUtilities] = useState([]);
  const today = new Date().toISOString().split("T")[0];

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
    landlordName: `${user?.info?.firstName || ""} ${user?.info?.lastName || ""}`,
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
        otherFees: "",
      },
      gracePeriod: "",
      latePaymentPolicy: "",
      noticePeriod: "",
      renewalTerms: "",
    },
    leaseType: "Fixed-Term",
  });

  useEffect(() => {
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

    fetchUser();
    fetchPreloadedTerms();
  }, [user, storedToken]);

  useEffect(() => {
    const totalAmenitiesCost = amenities
      .filter((amenity) => amenity.selected)
      .reduce((sum, amenity) => sum + (amenity.fee || 0), 0);
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
      .reduce((sum, util) => sum + (util.fee || 0), 0);
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
    const { baseRent, utilities, amenities, otherFees } = formData.contractDetails.rentBreakdown;
    const total = [baseRent, utilities, amenities].reduce(
      (acc, val) => acc + (parseFloat(val) || 0),
      0
    );
    const otherFeesTotal = otherFees
      ? otherFees.split(",").reduce((acc, fee) => {
          const parts = fee.split(":");
          if (parts.length === 2) {
            const name = parts[0].trim();
            const amount = parts[1].trim();
            if (name && amount) {
              return acc + (parseFloat(amount) || 0);
            }
          }
          return acc;
        }, 0)
      : 0;
    return total + otherFeesTotal;
  };

  const validateDates = () => {
    const { startDate, endDate, moveInDate, moveOutDate } = formData.contractDetails;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const moveStart = new Date(moveInDate);
    const moveEnd = new Date(moveOutDate);
    const todayDate = new Date();

    if (start < todayDate) {
      toast.error("The start date cannot be in the past.");
      return false;
    }

    if (moveStart < todayDate) {
      toast.error("The move-in date cannot be in the past.");
      return false;
    }

    const durationInDays = (end - start) / (1000 * 60 * 60 * 24);
    const moveDurationInDays = (moveEnd - moveStart) / (1000 * 60 * 60 * 24);
    if (durationInDays < 30) {
      toast.error("Lease terms must be at least 1 month.");
      return false;
    }
    if (moveDurationInDays < 30) {
      toast.error("Move-in to move-out period should be at least 1 month.");
      return false;
    }

    return true;
  };

  const validateIfSaveAndSend = () => {
    const newErrors = {};
    if (!formData.property.propertyId) newErrors.property = "Property is required.";
    if (!formData.property.address.zip) newErrors.zip = "ZIP code is required.";
    if (!formData.landlord) newErrors.landlord = "Landlord is required.";
    if (!formData.tenant && !formData.tenantPlaceholder.name && !formData.tenantPlaceholder.email && !formData.tenantPlaceholder.phoneNumber) {
      newErrors.tenant = "Please provide either a tenant or complete placeholder tenant details.";
    }
    if (!formData.contractDetails.startDate) newErrors.startDate = "Start date is required.";
    if (!formData.contractDetails.endDate) newErrors.endDate = "End date is required.";
    if (!formData.contractDetails.paymentFrequency) newErrors.paymentFrequency = "Payment frequency is required.";
    if (!formData.contractDetails.termsAndConditionsId) newErrors.termsAndConditionsId = "Please select terms and conditions.";
    if (!formData.contractDetails.rulesAndRegulations) newErrors.rulesAndRegulations = "Rules and Regulations is required.";
    if (formData.leaseType === "Fixed-Term") {
      if (!formData.contractDetails.moveInDate) newErrors.moveInDate = "Move-in date is required.";
      if (!formData.contractDetails.moveOutDate) newErrors.moveOutDate = "Move-out date is required.";
    }
    if (!formData.contractDetails.renewalTerms) newErrors.renewalTerms = "Renewal terms are required.";
    return newErrors;
  };

  const validateIfSaveAsDraft = () => {
    const newErrors = {};
    if (!formData.property.propertyId) newErrors.property = "Property is required.";
    if (formData.property.propertyId && !formData.property.address.zip) newErrors.zip = "ZIP code is required for the selected property.";
    if (!formData.landlord) newErrors.landlord = "Landlord is required.";
    if (!formData.tenant && !formData.tenantPlaceholder.name && !formData.tenantPlaceholder.email && !formData.tenantPlaceholder.phoneNumber) {
      newErrors.tenant = "Please provide either a tenant or complete placeholder tenant details.";
    }
    return newErrors;
  };

  const handleListingSelect = (e) => {
    const selectedListingId = e.target.value;
    const selectedListing = listings.find((listing) => listing._id === selectedListingId);
    if (selectedListing) {
      const amenities = Array.isArray(selectedListing.amenities) ? selectedListing.amenities : [];
      const utilities = Array.isArray(selectedListing.includedUtilities)
        ? selectedListing.includedUtilities.map(name => ({
            name: capitalizeFirstLetter(name),
            selected: true,
            fee: 0
          }))
        : [];
      setFormData((prev) => ({
        ...prev,
        property: {
          propertyId: selectedListing._id,
          name: selectedListing.title,
          address: selectedListing.address || { houseNumber: "", street: "", city: "", zip: "" },
        },
      }));
      setAmenities(amenities.map((amenity) => ({ ...amenity, selected: true })));
      setUtilities(utilities);
    } else {
      setFormData((prev) => ({
        ...prev,
        property: {
          propertyId: "",
          name: "",
          address: { houseNumber: "", street: "", city: "", zip: "" },
        },
      }));
      setAmenities([]);
      setUtilities([]);
    }
  };

  const handleSubmit = async (action, event) => {
    event.preventDefault();

    let validationErrors = {};
    if (action === "saveAndSend") {
      validationErrors = validateIfSaveAndSend();
    } else {
      validationErrors = validateIfSaveAsDraft();
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (action === "saveAndSend" && !validateDates()) {
      return;
    }

    setErrors({});

    const selectedTerms = preloadedTerms.find((term) => term._id === formData.contractDetails.termsAndConditionsId);

    const payload = {
      ...formData,
      landlord: user.id, // Ensure landlord is always set
      tenant: usePlaceholderTenant ? null : (formData.tenant || null),
      landlordName: `${userProfile.info.firstName} ${userProfile.info.lastName}`,
      contractDetails: {
        ...formData.contractDetails,
        customTermsAndConditions: selectedTerms ? selectedTerms.content : "",
      },
      action,
    };

    try {
      const lease = await createLease(payload);
      toast.success(action === "saveAndSend" ? "Lease marked ready to send!" : "Lease saved as draft!");
      handleClearForm();
    } catch (err) {
      console.error("Error creating lease:", err.response?.data || err.message);
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).map((e) => e.message).join(", ");
        toast.error(`Validation errors: ${errorMessages}`);
      } else {
        toast.error(`Failed to create lease: ${err.response?.data?.message || "Unknown error"}`);
      }
    }
  };

  const handleClearForm = () => {
    setFormData({
      property: {
        propertyId: "",
        name: "",
        address: { houseNumber: "", street: "", city: "", zip: "" },
      },
      tenant: null,
      tenantPlaceholder: {
        name: "",
        email: "",
        phoneNumber: "",
        emergencyContact: { name: "", phoneNumber: "" },
      },
      landlord: user.id,
      landlordName: "",
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
          otherFees: "",
        },
        gracePeriod: "",
        latePaymentPolicy: "",
        noticePeriod: "",
        renewalTerms: "",
      },
      leaseType: "Fixed-Term",
    });
    setAmenities([]);
    setUtilities([]);
  };

  return (
    <div className={`flex-grow ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <div className={`shadow-md rounded-lg p-8 max-w-full mx-auto ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
        <h1 className={`text-3xl font-bold text-center mb-6 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>Create Lease</h1>
        <form onSubmit={(e) => handleSubmit("saveAndSend", e)} className="space-y-6">
          {/* Property Details Section */}
          <div>
            <h2 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-black"}`}>Property Details</h2>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Select Property</label>
              <select
                name="propertyId"
                value={formData.property.propertyId}
                onChange={handleListingSelect}
                className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
              >
                <option value="">Select a property</option>
                {listings.map((listing) => (
                  <option key={listing._id} value={listing._id}>
                    {listing.title} - {listing.address.city}
                  </option>
                ))}
              </select>
              {errors.property && <p className="text-red-500 text-sm mt-1">{errors.property}</p>}
              {errors.zip && <p className="text-red-500 text-sm mt-1">{errors.zip}</p>}
            </div>
          </div>

          {/* Tenant Details Section */}
          <hr className="border-t border-dotted border-gray-300 dark:border-gray-600" />
          <div>
            <h2 className={`text-xl font-semibold mt-6 ${darkMode ? "text-white" : "text-black"}`}>Tenant Details</h2>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Tenant Details</label>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="usePlaceholderTenant"
                  checked={usePlaceholderTenant}
                  onChange={() => setUsePlaceholderTenant((prev) => !prev)}
                  className="mt-1 mr-2"
                />
                <label htmlFor="usePlaceholderTenant" className="text-sm">Use Placeholder Tenant Details</label>
              </div>
              {usePlaceholderTenant ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Placeholder Name</label>
                    <input
                      type="text"
                      name="tenantPlaceholder.name"
                      value={formData.tenantPlaceholder.name}
                      onChange={handleChange}
                      className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Placeholder Email</label>
                    <input
                      type="email"
                      name="tenantPlaceholder.email"
                      value={formData.tenantPlaceholder.email}
                      onChange={handleChange}
                      className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Placeholder Phone</label>
                    <input
                      type="text"
                      name="tenantPlaceholder.phoneNumber"
                      value={formData.tenantPlaceholder.phoneNumber}
                      onChange={handleChange}
                      className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Emergency Contact Name</label>
                    <input
                      type="text"
                      name="tenantPlaceholder.emergencyContact.name"
                      value={formData.tenantPlaceholder.emergencyContact.name}
                      onChange={handleChange}
                      className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Emergency Contact Phone</label>
                    <input
                      type="text"
                      name="tenantPlaceholder.emergencyContact.phoneNumber"
                      value={formData.tenantPlaceholder.emergencyContact.phoneNumber}
                      onChange={handleChange}
                      className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    name="tenant"
                    value={formData.tenant || ""}
                    onChange={handleChange}
                    placeholder={passedSeekerId?._id || "Enter Tenant ID or use placeholder"}
                    className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                  />
                </div>
              )}
              {errors.tenant && <p className="text-red-500 text-sm mt-1">{errors.tenant}</p>}
            </div>
          </div>

          {/* Lease Details Section */}
          <hr className="border-t border-dotted border-gray-300 dark:border-gray-600" />
          <div>
            <h2 className={`text-xl font-semibold mt-6 ${darkMode ? "text-white" : "text-black"}`}>Lease Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Lease Start Date</label>
                <input
                  type="date"
                  name="contractDetails.startDate"
                  value={formData.contractDetails.startDate}
                  onChange={handleChange}
                  min={today}
                  className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                />
                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Lease End Date</label>
                <input
                  type="date"
                  name="contractDetails.endDate"
                  value={formData.contractDetails.endDate}
                  onChange={handleChange}
                  min={formData.contractDetails.startDate || today}
                  className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                />
                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Lease Type</label>
                <select
                  name="leaseType"
                  value={formData.leaseType}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                >
                  <option value="Fixed-Term">Fixed-Term</option>
                  <option value="Month-to-Month">Month-to-Month</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Move-in Date</label>
                <input
                  type="date"
                  name="contractDetails.moveInDate"
                  value={formData.contractDetails.moveInDate}
                  onChange={handleChange}
                  min={today}
                  className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                />
                {errors.moveInDate && <p className="text-red-500 text-sm mt-1">{errors.moveInDate}</p>}
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Move-out Date</label>
                <input
                  type="date"
                  name="contractDetails.moveOutDate"
                  value={formData.contractDetails.moveOutDate}
                  onChange={handleChange}
                  min={formData.contractDetails.moveInDate || today}
                  className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                />
                {errors.moveOutDate && <p className="text-red-500 text-sm mt-1">{errors.moveOutDate}</p>}
              </div>
            </div>
          </div>

          {/* Financial Details Section */}
          <hr className="border-t border-dotted border-gray-300 dark:border-gray-600" />
          <div>
            <h2 className={`text-xl font-semibold mt-6 ${darkMode ? "text-white" : "text-black"}`}>Financial Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Base Rent</label>
                <input
                  type="number"
                  name="contractDetails.rentBreakdown.baseRent"
                  value={formData.contractDetails.rentBreakdown.baseRent}
                  onChange={handleChange}
                  min="0"
                  className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Deposit Amount</label>
                <input
                  type="number"
                  name="contractDetails.depositAmount"
                  value={formData.contractDetails.depositAmount}
                  onChange={handleChange}
                  min="0"
                  className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                />
              </div>
              <div className="col-span-2">
                <h3 className={`text-lg font-medium ${darkMode ? "text-white" : "text-black"}`}>Utilities</h3>
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
                      className={`mt-1 block w-1/3 border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                    />
                    {util.selected && (
                      <input
                        type="number"
                        value={util.fee}
                        onChange={(e) => {
                          const newUtilities = [...utilities];
                          newUtilities[index].fee = parseFloat(e.target.value) || 0;
                          setUtilities(newUtilities);
                        }}
                        min="0"
                        className={`mt-1 block w-1/4 border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                      />
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setUtilities([...utilities, { name: "", fee: 0, selected: true }])}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add More Utilities
                </button>
              </div>
              <div className="col-span-2">
                <h3 className={`text-lg font-medium ${darkMode ? "text-white" : "text-black"}`}>Amenities</h3>
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
                      className={`mt-1 block w-1/3 border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                    />
                    {amenity.selected && (
                      <input
                        type="number"
                        value={amenity.fee}
                        onChange={(e) => {
                          const newAmenities = [...amenities];
                          newAmenities[index].fee = parseFloat(e.target.value) || 0;
                          setAmenities(newAmenities);
                        }}
                        min="0"
                        className={`mt-1 block w-1/4 border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                      />
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setAmenities([...amenities, { name: "", fee: 0, selected: true }])}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add More Amenities
                </button>
              </div>
              <div className="col-span-2">
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Other Fees (format: Name:Amount, Name:Amount)</label>
                <textarea
                  name="contractDetails.rentBreakdown.otherFees"
                  value={formData.contractDetails.rentBreakdown.otherFees || ""}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                />
              </div>
              <div className="col-span-2">
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Rent Breakdown</label>
                <div className="mt-1 space-y-1">
                  <p>Base Rent: {formData.contractDetails.rentBreakdown.baseRent || 0}</p>
                  <p>Utilities: {formData.contractDetails.rentBreakdown.utilities || 0}</p>
                  <p>Amenities: {formData.contractDetails.rentBreakdown.amenities || 0}</p>
                  {formData.contractDetails.rentBreakdown.otherFees && (
                    <div>
                      {formData.contractDetails.rentBreakdown.otherFees.split(",").map((fee, index) => {
                        const parts = fee.split(":");
                        const name = parts[0] ? parts[0].trim() : "";
                        const amount = parts[1] ? parts[1].trim() : "";
                        return name && amount ? <p key={index}>{name}: {amount}</p> : null;
                      })}
                    </div>
                  )}
                </div>
                <label className={`block text-sm font-medium mt-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Total Rent</label>
                <input
                  type="text"
                  value={calculateTotalRent()}
                  readOnly
                  className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"}`}
                />
              </div>
            </div>
          </div>

          {/* Payment Policies Section */}
          <hr className="border-t border-dotted border-gray-300 dark:border-gray-600" />
          <div>
            <h2 className={`text-xl font-semibold mt-6 ${darkMode ? "text-white" : "text-black"}`}>Payment Policies</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Payment Frequency</label>
                <select
                  name="contractDetails.paymentFrequency"
                  value={formData.contractDetails.paymentFrequency}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                >
                  <option value="">Select Frequency Terms</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Grace Period (days)</label>
                <input
                  type="number"
                  name="contractDetails.gracePeriod"
                  value={formData.contractDetails.gracePeriod}
                  onChange={handleChange}
                  min="0"
                  className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                />
              </div>
              <div className="col-span-2">
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Late Payment Policy</label>
                <textarea
                  name="contractDetails.latePaymentPolicy"
                  value={formData.contractDetails.latePaymentPolicy}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                />
              </div>
            </div>
          </div>

          {/* Legal and Policy Details Section */}
          <hr className="border-t border-dotted border-gray-300 dark:border-gray-600" />
          <div>
            <h2 className={`text-xl font-semibold mt-6 ${darkMode ? "text-white" : "text-black"}`}>Legal and Policy Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Notice Period (days)</label>
                <input
                  type="number"
                  name="contractDetails.noticePeriod"
                  value={formData.contractDetails.noticePeriod}
                  onChange={handleChange}
                  min="0"
                  className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Renewal Terms</label>
                <select
                  name="contractDetails.renewalTerms"
                  value={formData.contractDetails.renewalTerms}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                >
                  <option value="">Select Renewal Terms</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                  <option value="No Renewal">No Renewal</option>
                </select>
                {errors.renewalTerms && <p className="text-red-500 text-sm mt-1">{errors.renewalTerms}</p>}
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Terms and Conditions</label>
                <select
                  name="contractDetails.termsAndConditionsId"
                  value={formData.contractDetails.termsAndConditionsId}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                >
                  <option value="">Select Preloaded Terms</option>
                  {preloadedTerms.map((term) => (
                    <option key={term._id} value={term._id}>
                      {term.title}
                    </option>
                  ))}
                </select>
                {errors.termsAndConditionsId && <p className="text-red-500 text-sm mt-1">{errors.termsAndConditionsId}</p>}
              </div>
              <div className="col-span-2">
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Rules and Regulations</label>
                <textarea
                  name="contractDetails.rulesAndRegulations"
                  value={formData.contractDetails.rulesAndRegulations}
                  onChange={handleChange}
                  rows="4"
                  className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm px-4 py-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" : "bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500"}`}
                />
                {errors.rulesAndRegulations && <p className="text-red-500 text-sm mt-1">{errors.rulesAndRegulations}</p>}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="mt-6">
            <button
              type="button"
              onClick={(e) => handleSubmit("saveAsDraft", e)}
              className="w-full px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded hover:bg-gray-600"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              onClick={(e) => handleSubmit("saveAndSend", e)}
              className={`w-full mt-4 px-4 py-2 rounded text-sm font-medium ${darkMode ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-blue-500 text-white hover:bg-blue-600"}`}
            >
              Save and Mark Ready to Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLease;