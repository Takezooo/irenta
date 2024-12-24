import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, MarkerF, useLoadScript } from "@react-google-maps/api";

const LIBRARIES = ["places"]; // Static array for libraries

const MapPicker = ({ center, zoom, onLocationChange }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, // Use environment variable for API key
    libraries: LIBRARIES, // Pass static array
  });

  const [selectedLocation, setSelectedLocation] = useState(center);
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (isLoaded && autocompleteRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
        fields: ["formatted_address", "geometry"],
      });

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
      const response = await fetch(`/api/map/geocode?lat=${location.lat}&lng=${location.lng}`);
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
        className="w-full p-2.5 mb-2.5"
      />
      {suggestions.length > 0 && (
        <ul style={{ listStyleType: "none", padding: "0" }}>
          {suggestions.map((s, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(s)}
              style={{
                cursor: "pointer",
                padding: "5px",
                borderBottom: "1px solid #ddd",
              }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "400px" }}
        center={selectedLocation}
        zoom={zoom}
        onClick={handleMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {selectedLocation && <MarkerF position={selectedLocation} />}
      </GoogleMap>
    </div>
  );
};

MapPicker.defaultProps = {
  center: { lat: 14.5995, lng: 120.9842 },
  zoom: 15,
};

export default MapPicker;
