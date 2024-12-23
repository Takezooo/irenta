import React, { useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const MapPicker = ({ center, zoom, onLocationChange }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBS7WA6XjHZjI84t1zkM5bL0iUFdZd3cag", // Set this in your `.env`
  });

  const [selectedLocation, setSelectedLocation] = useState(center);

  if (loadError) return <div>Error loading map</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  const handleMapClick = (event) => {
    const location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setSelectedLocation(location);
    onLocationChange(location);
  };

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "400px" }}
      center={selectedLocation}
      zoom={zoom}
      onClick={handleMapClick}
    >
      <Marker position={selectedLocation} />
    </GoogleMap>
  );
};

MapPicker.defaultProps = {
  center: { lat: 14.5995, lng: 120.9842 }, // Default to Manila, Philippines
  zoom: 12,
};

export default MapPicker;
