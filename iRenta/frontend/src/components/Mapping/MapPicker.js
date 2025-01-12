import React, { useState, useEffect, useRef, useContext } from "react";
import { GoogleMap, MarkerF, useLoadScript } from "@react-google-maps/api";
import { ThemeContext } from "../../contexts/ThemeContext";
const LIBRARIES = ["places"]; // Static array for libraries

const PHILIPPINES_BOUNDS = {
  north: 21.120031, // Northernmost point
  south: 4.589991,  // Southernmost point
  west: 116.87,     // Westernmost point
  east: 126.606,    // Easternmost point
};

const MapPicker = ({ center, zoom, onLocationChange }) => {
  const { darkMode } = useContext(ThemeContext);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, // Use environment variable for API key
    libraries: LIBRARIES, // Pass static array
  });

  console.log(window.google);

  const [selectedLocation, setSelectedLocation] = useState(center);
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (isLoaded && autocompleteRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        autocompleteRef.current,
        {
          fields: ["formatted_address", "geometry"],
          componentRestrictions: { country: "PH" }, 
        }
      );

      autocomplete.addListener("place_changed", async () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const newLocation = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          setSelectedLocation(newLocation);
          onLocationChange(newLocation);
          setAddress(place.formatted_address);
        } else {
          console.error("Autocomplete did not return geometry.");
        }
      });
    }
  }, [isLoaded, onLocationChange]);

  const handleMapClick = async (event) => {
    const location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };

    setSelectedLocation(location);

    try {
      const response = await fetch(
        `/api/map/geocode?lat=${location.lat}&lng=${location.lng}`
      );
      const data = await response.json();
      if (data.results && data.results[0]) {
        const formattedAddress = data.results[0].formatted_address;
        setAddress(formattedAddress);
        onLocationChange({ ...location, address: formattedAddress });
      } else {
        onLocationChange(location);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      onLocationChange(location);
    }
  };

  const handleAddressInputChange = async (e) => {
    const input = e.target.value;
    setAddress(input);

    if (input.length > 2) {
      try {
        const response = await fetch(`/api/map/autocomplete?input=${input}`);
        const data = await response.json();
        if (data.predictions) {
          setSuggestions(data.predictions.map((p) => p.description));
        }
      } catch (error) {
        console.error("Error fetching autocomplete suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setAddress(suggestion);
    setSuggestions([]);
  };

  if (loadError) return <div>Error loading map: {loadError.message}</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div>
      <input
        ref={autocompleteRef}
        type="text"
        placeholder="Search for an address"
        value={address}
        onChange={handleAddressInputChange}
        className={`w-full p-3 rounded-lg border ${
          darkMode
            ? "bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 focus:outline-none"
            : "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:outline-none"
        }`}
      />
      <div
        style={{
          width: "100%",
          height: "400px",
          marginBottom: "80px", // Add desired padding bottom here
          paddingTop: "50px",
        }}
      >
        <GoogleMap
          center={selectedLocation}
          onClick={handleMapClick}
          zoom={15}
          mapContainerStyle={{ width: "100%", height: "100%" }} // The map container uses the full parent div dimensions
          options={{
            mapId: "7faff3f15533dffa", 
            gestureHandling: "greedy",
            fullscreenControl: false, // Disable fullscreen control
            streetViewControl: false,
            mapTypeControl: false,
            restriction: {
              latLngBounds: PHILIPPINES_BOUNDS, // Restrict to Philippines bounds
              strictBounds: true, // Prevent dragging outside
            },
            styles: [
              {
                featureType: "poi",
                stylers: [{ visibility: "off" }],
              },
              {
                featureType: "road",
                elementType: "labels.icon",
                stylers: [{ visibility: "off" }],
              },
              {
                featureType: "transit",
                elementType: "labels.icon",
                stylers: [{ visibility: "off" }],
              },
            ],
          }}
        >
          {selectedLocation && <MarkerF position={selectedLocation} />}
        </GoogleMap>
      </div>
    </div>
  );
};

MapPicker.defaultProps = {
  center: { lat: 14.5995, lng: 120.9842 },
  zoom: 15,
};

export default MapPicker;
