import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { fetchLeaseById } from "../../global/api/Leases";
import { fetchSpecificList } from "../../global/api/Listings";
import { getCurrentTenant } from "../../global/api/Tenants";

const PropertyDetails = () => {
  const { darkMode } = useContext(ThemeContext);
  const [property, setProperty] = useState([]);
  const [lease, setLease] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPropertyData = async () => {
      try {
        setLoading(true);
        setError(null);
        const tenantData = await getCurrentTenant();
        if (!tenantData) {
          throw new Error("No tenant data found");
        }
        const leaseData = await fetchLeaseById(tenantData.leaseId?._id);
        if (!leaseData) {
          throw new Error("No lease data found");
        }
        setLease(leaseData);
        const propertyData = await fetchSpecificList(tenantData.propertyId?._id);
        if (!propertyData) {
          throw new Error("No property data found");
        }
        setProperty(propertyData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError(error.message || "Failed to load property details");
      } finally {
        setLoading(false);
      }
    };
    loadPropertyData();
  }, []);

  const InfoCard = ({ title, children, className = "" }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );

  const InfoItem = ({ label, value, isCurrency }) => (
    <div className="mb-4 last:mb-0">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="font-medium text-gray-900 dark:text-gray-100">
        {isCurrency ? '₱' : ''}{value || "N/A"}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Details</h3>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Information */}
        <InfoCard title="Property Information">
          <div className="space-y-4">
            <InfoItem 
              label="Property Name" 
              value={property?.title} 
            />
            <InfoItem 
              label="Property Type" 
              value={property?.type} 
            />
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Address</p>
              <div className="space-y-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {property?.address?.houseNumber} {property?.address?.street}
                </p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {property?.address?.city}
                </p>
              </div>
            </div>
          </div>
        </InfoCard>

        {/* Lease Information */}
        <InfoCard title="Lease Information">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem 
                label="Total Rent Fee" 
                value={lease?.contractDetails?.rentBreakdown?.baseRent}
                isCurrency={true}
              />
              <InfoItem 
                label="Deposit Amount" 
                value={lease?.contractDetails?.depositAmount}
                isCurrency={true}
              />
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <InfoItem 
                label="Lease Period" 
                value={`${new Date(lease?.contractDetails?.startDate).toLocaleDateString()} - ${new Date(lease?.contractDetails?.endDate).toLocaleDateString()}`}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem 
                label="Payment Frequency" 
                value={lease?.contractDetails?.paymentFrequency}
              />
              <InfoItem 
                label="Lease Type" 
                value={lease?.leaseType}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem 
                label="Grace Period" 
                value={`${lease?.contractDetails?.gracePeriod || 0} days`}
              />
              <InfoItem 
                label="Notice Period" 
                value={`${lease?.contractDetails?.noticePeriod || 0} days`}
              />
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <InfoItem 
                label="Lease Status" 
                value={lease?.status}
              />
            </div>
          </div>
        </InfoCard>

        {/* Landlord Information */}
        <InfoCard title="Landlord Contact" className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <InfoItem 
              label="Name" 
              value={`${lease?.landlord?.info?.firstName} ${lease?.landlord?.info?.lastName || ""}`}
            />
            <InfoItem 
              label="Phone" 
              value={lease?.landlord?.info?.phoneNumber}
            />
            <InfoItem 
              label="Email" 
              value={lease?.landlord?.credentials?.email}
            />
          </div>
        </InfoCard>
      </div>
    </div>
  );
};

export default PropertyDetails;
