import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Icon } from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useState } from "react";

export const MapPickerV2 = ({ onAddressSelect }) => {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');

  const PHILIPPINES_BOUNDS = [
    [4.589991, 116.87],     // Southwest corner (south, west)
    [21.120031, 126.606],   // Northeast corner (north, east)
  ];

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
        console.log("Clicked coordinates:", lat, lng);
        setPosition({ lat, lng });

        const { displayName, address } = await getAddressFromCoordinates(lat, lng);

        const addressObject = {
            houseNumber: address.house_number || '',
            street: address.road || address.pedestrian || address.path || '',
            city: address.city || address.town || address.village || '',
            zip: address.postcode || '',
            lat,
            lng,
            fullAddress: displayName,
          };
          
          
        //   setAddress(addr);
        setAddress(displayName); // or keep structured version if needed
        onAddressSelect && onAddressSelect(addressObject);
        
        console.log("Structured Address:", addressObject);
        console.log("Raw Address Object:", address);
      },
    });

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
    <MapContainer
      center={{ lat: 14.582815, lng: 120.983952 }}
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
      {position && (
        <Marker
          position={position}
          icon={customIcon}
        />
      )}
    </MapContainer>
  );
};

export default MapPickerV2;
