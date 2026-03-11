// src/components/MapComponent.jsx
import React, { useEffect, useState, useRef } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import axios from "axios";

// --- GET API KEYS FROM .ENV ---
// If using Vite:
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;
const ORS_KEY = import.meta.env.VITE_ORS_API_KEY;

// If using Create React App (uncomment below and delete the Vite ones above):
// const MAPTILER_KEY = process.env.REACT_APP_MAPTILER_API_KEY;
// const ORS_KEY = process.env.REACT_APP_ORS_API_KEY;

const MapComponent = ({ driverLocation, selectedOrder }) => {
  const mapRef = useRef(null);
  const [routeData, setRouteData] = useState(null);

  // Determine Destination based on Order Status
  let destination = null;
  let destinationAddress = "";

  if (selectedOrder) {
    if (selectedOrder.status === "assigned") {
      destination = {
        lat: selectedOrder.pickup_lat,
        lng: selectedOrder.pickup_lng,
      };
      destinationAddress = "Pickup: " + selectedOrder.pickup_address;
    } else if (["picked_up", "in_transit"].includes(selectedOrder.status)) {
      destination = {
        lat: selectedOrder.dropoff_lat,
        lng: selectedOrder.dropoff_lng,
      };
      destinationAddress = "Drop-off: " + selectedOrder.dropoff_address;
    }
  }

  // Fetch Route from OpenRouteService when locations change
  useEffect(() => {
    if (!driverLocation || !destination) {
      setRouteData(null);
      // Just center on driver if no destination
      if (driverLocation && mapRef.current) {
        mapRef.current.flyTo({
          center: [driverLocation.lng, driverLocation.lat],
          zoom: 14,
          duration: 1000,
        });
      }
      return;
    }

    const fetchRoute = async () => {
      try {
        // ORS expects coordinates in [longitude, latitude] format
        const start = `${driverLocation.lng},${driverLocation.lat}`;
        const end = `${destination.lng},${destination.lat}`;

        const response = await axios.get(
          `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_KEY}&start=${start}&end=${end}`,
        );

        const feature = response.data.features[0];
        setRouteData(feature);

        // Adjust map bounds to perfectly fit the entire route
        if (mapRef.current && feature.bbox) {
          const [minLng, minLat, maxLng, maxLat] = feature.bbox;
          mapRef.current.fitBounds(
            [
              [minLng, minLat],
              [maxLng, maxLat],
            ],
            { padding: 50, duration: 1000 },
          );
        }
      } catch (error) {
        console.error("Failed to fetch route from ORS:", error);
      }
    };

    fetchRoute();
  }, [driverLocation, destination]);

  return (
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden border shadow-sm relative">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: driverLocation?.lng || 79.8612, // Default: Colombo
          latitude: driverLocation?.lat || 6.9271,
          zoom: 13,
        }}
        // Using MapTiler street style
        mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Draw Navigation Line (Real Roads via ORS) */}
        {routeData && (
          <Source id="route-source" type="geojson" data={routeData}>
            <Layer
              id="route-layer"
              type="line"
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
              paint={{
                "line-color": "#3b82f6", // Tailwind blue-500
                "line-width": 5,
              }}
            />
          </Source>
        )}

        {/* Driver Marker */}
        {driverLocation && (
          <Marker
            longitude={driverLocation.lng}
            latitude={driverLocation.lat}
            anchor="bottom"
          >
            <div className="flex flex-col items-center cursor-pointer group">
              <div className="bg-black text-white text-xs px-2 py-1 rounded shadow-md mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                You are here
              </div>
              <img
                src="https://cdn-icons-png.flaticon.com/512/3206/3206203.png"
                alt="Driver"
                className="w-10 h-10 drop-shadow-md"
              />
            </div>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker
            longitude={destination.lng}
            latitude={destination.lat}
            anchor="bottom"
          >
            <div className="flex flex-col items-center cursor-pointer group">
              <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-md mb-1 opacity-100 whitespace-nowrap">
                {destinationAddress}
              </div>
              <img
                src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
                alt="Destination"
                className="w-10 h-10 drop-shadow-md"
              />
            </div>
          </Marker>
        )}
      </Map>
    </div>
  );
};

export default MapComponent;
