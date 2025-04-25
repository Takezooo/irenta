import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useState, useEffect, useCallback } from "react";

export const MapPickerV2 = ({ onAddressSelect, initialLocation }) => {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const PHILIPPINES_BOUNDS = [
    [4.589991, 116.87],     // Southwest corner (south, west)
    [21.120031, 126.606],   // Northeast corner (north, east)
  ];

  // Debounce function to limit API calls
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const searchAddress = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&countrycodes=ph&limit=5`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching address:", error);
    }
    setIsLoading(false);
  };

  // Debounced version of searchAddress
  const debouncedSearch = useCallback(debounce(searchAddress, 300), []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleResultClick = async (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setPosition({ lat, lng });
    setSearchResults([]);
    setSearchQuery(result.display_name);

    // Get detailed address information
    const addressDetails = await getAddressFromCoordinates(lat, lng);
    
    // Create address object
    const addressObject = {
      houseNumber: addressDetails.address.house_number || "N/A",
      street: addressDetails.address.road || addressDetails.address.pedestrian || addressDetails.address.path || "N/A",
      city: addressDetails.address.city || addressDetails.address.town || addressDetails.address.village || "N/A",
      zip: addressDetails.address.postcode || "",
      lat,
      lng,
      fullAddress: result.display_name,
    };

    onAddressSelect(addressObject);
  };

  const getAddressFromCoordinates = async (lat, lon) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );
    const data = await res.json();
    return {
      displayName: data.display_name,
      address: data.address,
    };
  };

  const MapClickHandler = () => {
    const map = useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        map.flyTo([lat, lng], map.getZoom());
        setPosition({ lat, lng });

        const { displayName, address } = await getAddressFromCoordinates(lat, lng);
        setSearchQuery(displayName);

        const addressObject = {
          houseNumber: address.house_number || "N/A",
          street: address.road || address.pedestrian || address.path || "N/A",
          city: address.city || address.town || address.village || "N/A",
          zip: address.postcode || "",
          lat,
          lng,
          fullAddress: displayName,
        };

        setAddress(displayName);
        onAddressSelect(addressObject);
      },
    });

    return null;
  };

  // Update map view when position changes
  const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
      if (position) {
        map.flyTo([position.lat, position.lng], map.getZoom());
      }
    }, [position, map]);
    return null;
  };

  const customIcon = new Icon({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],      // default size
    iconAnchor: [12, 41],    // tip of the marker = center-bottom
    shadowSize: [41, 41],
    shadowAnchor: [12, 41],
  });

  return (
    <div className="relative">
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search for an address..."
          className="w-full p-2 border rounded-md"
        />
        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-60 overflow-y-auto">
            {searchResults.map((result) => (
              <div
                key={result.place_id}
                onClick={() => handleResultClick(result)}
                className="p-2 hover:bg-gray-100 cursor-pointer border-b"
              >
                {result.display_name}
              </div>
            ))}
          </div>
        )}
        {isLoading && (
          <div className="absolute right-3 top-3">
            <span className="text-gray-400">Searching...</span>
          </div>
        )}
      </div>

      <MapContainer
        center={initialLocation || { lat: 14.582815, lng: 120.983952 }}
        zoom={15}
        minZoom={5}  
        maxBounds={PHILIPPINES_BOUNDS}
        maxBoundsViscosity={1.0}
        className="w-full h-72 z-0 mb-24 mt-7 rounded-sm"
      >
        <TileLayer
          attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />
        <MapUpdater />
        {position && (
          <Marker
            position={position}
            icon={customIcon}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapPickerV2;
