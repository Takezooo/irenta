import React, { useState, useEffect } from "react";
import { GoogleMap, MarkerF, useLoadScript } from "@react-google-maps/api";

const PHILIPPINES_BOUNDS = {
  north: 21.120031, // Northernmost point
  south: 4.589991,  // Southernmost point
  west: 116.87,     // Westernmost point
  east: 126.606,    // Easternmost point
};

const LIBRARIES = ["places"]; // Static array for libraries

export const useMapLogic = ({ fetchListings, initialCenter, RADIUS = 3 }) => {
  const [listings, setListings] = useState([]);
  const [nearbyListings, setNearbyListings] = useState([]);
  const [mapCenter, setMapCenter] = useState(null); // Start with null to ensure location is fetched first
  const [locationFetched, setLocationFetched] = useState(false); // Track if location is fetched

  // Load the Google Maps API
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, // Use environment variable for API key
    libraries: LIBRARIES, // Pass static array
  });

  useEffect(() => {
    // Fetch user's location as the first step
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleLocationChange(position); // Update map center and filter nearby listings
        setLocationFetched(true); // Mark location as fetched
      },
      (error) => {
        console.error("Error getting location:", error);
        setMapCenter(initialCenter); // Fallback to initial center if location fails
        setLocationFetched(true); // Allow fetching listings even if location fails
      }
    );
  }, []);

  useEffect(() => {
    if (listings.length > 0 && mapCenter) {
      filterNearbyListings(mapCenter);
    }
  }, [listings, mapCenter, RADIUS]);

  useEffect(() => {
    // Fetch data only after location is determined
    if (locationFetched) {
      fetchData();
    }
  }, [locationFetched]);

  useEffect(() => {
    // Trigger filtering when listings or mapCenter changes
    if (listings.length > 0 && mapCenter) {
      filterNearbyListings(mapCenter);
    }
  }, [listings, mapCenter]);

  // Calculate distance between two coordinates
  const getDistanceFromLatLng = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Radius of Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Filter listings within a certain radius of the given location
  const filterNearbyListings = (location) => {
    const filtered = listings.filter((listing) => {
      if (!listing.address || !listing.address.lat || !listing.address.lng) {
        console.warn("Missing lat/lng for listing:", listing);
        return false;
      }

      const distance = getDistanceFromLatLng(
        location.lat,
        location.lng,
        listing.address.lat,
        listing.address.lng
      );

      return distance <= RADIUS;
    });

    setNearbyListings(filtered);
  };

  // Fetch listings and filter based on the map center
  const fetchData = async () => {
    try {
      const data = await fetchListings();
      setListings(data); // Trigger filtering through useEffect
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  // Handle user location change
  const handleLocationChange = (position) => {
    const userLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    setMapCenter(userLocation); // Trigger filtering through useEffect
  };

  if (loadError) {
    console.error("Error loading Google Maps API:", loadError);
    return { listings: [], nearbyListings: [], mapCenter: initialCenter, isLoaded: false };
  }

  return { listings, nearbyListings, mapCenter, isLoaded };
};

export const MapListings = ({ isLoaded, mapCenter, nearbyListings, handleViewProperty }) => {
  if (!isLoaded || !mapCenter) {
    return <div>Loading map...</div>; // Ensure mapCenter is defined before rendering the map
  }

  return (
    <GoogleMap
      center={mapCenter}
      zoom={15}
      mapContainerStyle={{ width: "100%", height: "100%" }}
      options={{
        restriction: {
          latLngBounds: PHILIPPINES_BOUNDS, // Restrict to Philippines bounds
          strictBounds: true, // Prevent dragging outside
        },
        streetViewControl: false,
        mapTypeControl: false,
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
      {nearbyListings.map((listing) => (
        <MarkerF
          key={listing._id}
          position={{
            lat: listing.address.lat,
            lng: listing.address.lng,
          }}
          title={listing.title}
          onClick={() => handleViewProperty(listing)}
        />
      ))}
    </GoogleMap>
  );
};
