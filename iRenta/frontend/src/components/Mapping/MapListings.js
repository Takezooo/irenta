import { useState, useEffect } from "react";
import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fixed useMapLogic hook with better radius filtering
// Fixed useMapLogic hook with proper dependency tracking and data fetching
export const useMapLogic = ({ fetchListings, initialCenter, RADIUS = 3, CENTER }) => {
  const [listings, setListings] = useState([]);
  const [nearbyListings, setNearbyListings] = useState([]);
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  
  // Effect for initial location detection
  useEffect(() => {
    if (CENTER) {
      setMapCenter(CENTER);
      setIsLoaded(true);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapCenter(userLocation);
          setIsLoaded(true);
        },
        (error) => {
          console.error("Error getting location:", error);
          setMapCenter(initialCenter);
          setIsLoaded(true);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [CENTER, initialCenter]);

  // Effect to fetch listings whenever needed - with additional dependency on RADIUS
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching listings data...");
        const data = await fetchListings();
        if (Array.isArray(data)) {
          console.log("Sample listing data structure:", data[0]);
          setListings(data);
          console.log(`Fetched ${data.length} listings`);
          
          // Force a refresh of nearby listings whenever we get new data
          setLastFetchTime(Date.now());
        } else {
          console.error("Invalid data format received:", data);
          setListings([]);
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
        setListings([]);
      }
    };
    
    fetchData();
  }, [fetchListings]); // Only re-fetch when fetchListings function changes

  // Effect to filter nearby listings whenever center, radius or listings change
  useEffect(() => {
    if (!mapCenter || !listings.length) return;
    
    console.log(`Filtering ${listings.length} listings with radius: ${RADIUS}km from`, mapCenter);
    
    const filtered = listings.filter((listing) => {
      // Log the listing being processed
      console.log(`Processing listing: ${listing._id}`);
      
      if (!listing.address?.lat || !listing.address?.lng) {
        console.log(`Skipping listing ${listing._id} - Missing coordinates:`, {
          lat: listing.address?.lat,
          lng: listing.address?.lng
        });
        return false;
      }

      const distance = getDistanceFromLatLng(
        mapCenter.lat,
        mapCenter.lng,
        listing.address.lat,
        listing.address.lng
      );
      
      const isWithinRadius = distance <= RADIUS;
      console.log(`Listing ${listing._id} - Distance: ${distance.toFixed(2)}km, Within radius: ${isWithinRadius}`);
      return isWithinRadius;
    });

    console.log(`Found ${filtered.length} listings within ${RADIUS}km radius`);
    setNearbyListings(filtered);
  }, [listings, mapCenter, RADIUS, lastFetchTime]); // Added lastFetchTime to ensure refresh

  // Helper function to calculate distance between coordinates
  const getDistanceFromLatLng = (lat1, lng1, lat2, lng2) => {
    // Convert coordinates from degrees to radians
    const toRad = (value) => (value * Math.PI) / 180;
    
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    
    const lat1Rad = toRad(lat1);
    const lat2Rad = toRad(lat2);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLng/2) * Math.sin(dLng/2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  };

  // Function to manually update the center
  const updateCenter = (newCenter) => {
    setMapCenter(newCenter);
  };

  return { 
    listings, 
    nearbyListings, 
    mapCenter, 
    isLoaded,
    updateCenter
  };
};

// Center updater component
export const SetMapCenter = ({ center }) => {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);
  return null;
};

// Create a custom marker icon
const createCustomIcon = () => {
  return L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// MapListings component with radius visualization
export const MapListings = ({ isLoaded, mapCenter, nearbyListings, handleViewProperty, radius = 3 }) => {
  const customIcon = React.useMemo(() => createCustomIcon(), []);

  if (!isLoaded || !mapCenter) {
    return <div className="w-full h-full flex items-center justify-center">Loading map...</div>;
  }

  console.log('MapListings render:', {
    mapCenter,
    nearbyListingsCount: nearbyListings?.length,
    radius
  });

  // Calculate radius in meters for the circle
  const radiusInMeters = radius * 1000;

  const PHILIPPINES_BOUNDS = [
    [4.589991, 116.87], 
    [21.120031, 126.606],
  ];

  const defaultCenter = {lat: 14.5995, lng: 120.9842}; // Manila


  return (
    <MapContainer
      center={[mapCenter.lat, mapCenter.lng] || defaultCenter}
      zoom={14}
      minZoom={6}  // Adjusted min zoom
      maxBounds={PHILIPPINES_BOUNDS}
      maxBoundsViscosity={1.0}
      style={{ width: "100%", height: "100%" }}
      scrollWheelZoom={true}
      zoomControl={true}
    >
      <SetMapCenter center={mapCenter} />
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Radius Circle */}
      <Circle
        center={[mapCenter.lat, mapCenter.lng]}
        radius={radiusInMeters}
        pathOptions={{
          color: '#1e88e5',
          fillColor: '#1e88e5',
          fillOpacity: 0.15,
          weight: 1
        }}
      />

      {/* Center marker */}
      <Marker position={[mapCenter.lat, mapCenter.lng]} icon={customIcon}>
        <Popup>
          <div className="text-center">
            <strong>Current Center</strong>
            <div className="text-sm text-gray-600 mt-1">
              Showing listings within {radius}km
            </div>
          </div>
        </Popup>
      </Marker>

      {/* Property markers */}
      {Array.isArray(nearbyListings) && nearbyListings.map((listing) => {
        if (!listing.address?.lat || !listing.address?.lng) {
          console.log('Skipping listing without valid coordinates:', listing._id);
          return null;
        }
        
        console.log('Rendering marker for listing:', {
          id: listing._id,
          lat: listing.address.lat,
          lng: listing.address.lng
        });
        
        return (
          <Marker
            key={listing._id}
            position={[listing.address.lat, listing.address.lng]}
            icon={customIcon}
          >
            <Popup>
              <div className="text-center">
                <div className="font-bold mb-1">{listing.title}</div>
                <div className="mb-1">{listing.price} / night</div>
                <button
                  onClick={() => handleViewProperty(listing)}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                >
                  View Property
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};