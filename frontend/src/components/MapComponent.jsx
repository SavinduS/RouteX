// src/components/MapComponent.jsx
import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";

// Custom Map Icons
const driverIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3206/3206203.png",
  iconSize: [35, 35],
});

const destinationIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
});

// Helper component to auto-adjust map bounds to show driver and destination
const MapBounds = ({ driverLoc, destLoc }) => {
  const map = useMap();
  useEffect(() => {
    if (driverLoc && destLoc) {
      const bounds = L.latLngBounds([
        [driverLoc.lat, driverLoc.lng],
        [destLoc.lat, destLoc.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (driverLoc) {
      map.setView([driverLoc.lat, driverLoc.lng], 14);
    }
  }, [driverLoc, destLoc, map]);
  return null;
};

const MapComponent = ({ driverLocation, selectedOrder }) => {
  // Determine Destination based on Order Status
  let destination = null;
  let destinationAddress = "";

  if (selectedOrder) {
    if (selectedOrder.status === "assigned") {
      destination = {
        lat: selectedOrder.pickup_lat,
        lng: selectedOrder.pickup_lng,
      };
      destinationAddress = selectedOrder.pickup_address;
    } else if (["picked_up", "in_transit"].includes(selectedOrder.status)) {
      destination = {
        lat: selectedOrder.dropoff_lat,
        lng: selectedOrder.dropoff_lng,
      };
      destinationAddress = selectedOrder.dropoff_address;
    }
  }

  const defaultCenter = [6.9271, 79.8612]; // Default to Colombo (Change as needed)
  const center = driverLocation
    ? [driverLocation.lat, driverLocation.lng]
    : defaultCenter;

  return (
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden border shadow-sm">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {driverLocation && (
          <Marker
            position={[driverLocation.lat, driverLocation.lng]}
            icon={driverIcon}
          >
            <Popup>You are here</Popup>
          </Marker>
        )}

        {destination && (
          <Marker
            position={[destination.lat, destination.lng]}
            icon={destinationIcon}
          >
            <Popup>{destinationAddress}</Popup>
          </Marker>
        )}

        {/* Draw Navigation Line */}
        {driverLocation && destination && (
          <Polyline
            positions={[
              [driverLocation.lat, driverLocation.lng],
              [destination.lat, destination.lng],
            ]}
            color="blue"
            weight={4}
            dashArray="10, 10"
          />
        )}

        <MapBounds driverLoc={driverLocation} destLoc={destination} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
