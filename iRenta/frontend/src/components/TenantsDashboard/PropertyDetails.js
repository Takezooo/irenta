import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';

const PropertyDetails = () => {
  const { darkMode } = useContext(ThemeContext);

  // Mock property data - replace with actual data from API
  const property = {
    name: "Sunshine Apartments",
    address: "123 Main Street, Manila",
    unit: "Unit 4B",
    leaseStart: "2024-01-01",
    leaseEnd: "2024-12-31",
    rent: 1500,
    landlord: {
      name: "John Doe",
      phone: "+63 912 345 6789",
      email: "john@example.com"
    },
    amenities: [
      "Fully Furnished",
      "Air Conditioning",
      "Internet",
      "Cable TV",
      "Water",
      "Electricity"
    ]
  };

  return (
    <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 shadow`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Property Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Property Information</h3>
          <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Property Name</p>
                <p className="font-medium">{property.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{property.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Unit</p>
                <p className="font-medium">{property.unit}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lease Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Lease Information</h3>
          <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Lease Period</p>
                <p className="font-medium">
                  {new Date(property.leaseStart).toLocaleDateString()} - 
                  {new Date(property.leaseEnd).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Rent</p>
                <p className="font-medium">₱{property.rent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Landlord Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Landlord Contact</h3>
          <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{property.landlord.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{property.landlord.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{property.landlord.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Included Amenities</h3>
          <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="grid grid-cols-2 gap-2">
              {property.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" strokeLinecap="round" 
                       strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
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
