import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { fetchLeaseById } from "../../global/api/Leases";
import { fetchSpecificList } from "../../global/api/Listings";
import { getCurrentTenant } from "../../global/api/Tenants";

const PropertyDetails = () => {
  const { darkMode } = useContext(ThemeContext);
  const [property, setProperty] = useState([]);
  const [lease, setLease] = useState([]);

  useEffect(() => {
    const loadPropertyData = async () => {
      try {
        // Get current tenant data
        const tenantData = await getCurrentTenant();
        // Get lease details
        const leaseData = await fetchLeaseById(tenantData.leaseId?._id);
        setLease(leaseData);
        const propertyData = await fetchSpecificList(
          tenantData.propertyId?._id
        );
        setProperty(propertyData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };
    loadPropertyData();
  }, []);

  return (
    <div
      className={`rounded-lg ${
        darkMode ? "bg-gray-800" : "bg-white"
      } p-6 shadow`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Property Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Property Information</h3>
          <div
            className={`rounded-lg p-4 ${
              darkMode ? "bg-gray-700" : "bg-gray-50"
            }`}
          >
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Property Name</p>
                <p className="font-medium">{property?.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">
                  {property?.address?.houseNumber} {property?.address?.street}
                </p>
                <p className="font-medium">{property?.address?.city}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lease Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Lease Information</h3>
          <div
            className={`rounded-lg p-4 ${
              darkMode ? "bg-gray-700" : "bg-gray-50"
            }`}
          >
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Lease Period</p>
                <p className="font-medium">
                  {new Date(
                    lease?.contractDetails?.startDate
                  ).toLocaleDateString()}{" "}
                  -
                  {new Date(
                    lease?.contractDetails?.endDate
                  ).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Rent</p>
                <p className="font-medium">
                  ₱{lease?.contractDetails?.rentAmount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Landlord Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Landlord Contact</h3>
          <div
            className={`rounded-lg p-4 ${
              darkMode ? "bg-gray-700" : "bg-gray-50"
            }`}
          >
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">
                  {lease?.landlord?.info.firstName}{" "}
                  {lease?.landlord?.info.firstName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">
                  {lease?.landlord?.info.phoneNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">
                  {lease?.landlord?.credentials.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Included Amenities</h3>
          <div
            className={`rounded-lg p-4 ${
              darkMode ? "bg-gray-700" : "bg-gray-50"
            }`}
          >
            <div className="grid grid-cols-2 gap-2">
              {(property?.amenities || []).map((amenity, index) => (
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
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
