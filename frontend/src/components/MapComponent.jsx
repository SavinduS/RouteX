// src/components/MapComponent.jsx
import React, { useEffect, useState, useRef } from "react";
import Map, { Marker, Source, Layer, NavigationControl, FullscreenControl } from "react-map-gl/maplibre";
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
          duration: 1500,
          essential: true
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
            { padding: 80, duration: 1500 },
          );
        }
      } catch (error) {
        console.error("Failed to fetch route from ORS:", error);
      }
    };

    fetchRoute();
  }, [driverLocation, destination]);

  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-slate-200 shadow-lg relative">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: driverLocation?.lng || 79.8612, // Default: Colombo
          latitude: driverLocation?.lat || 6.9271,
          zoom: 13,
        }}
        // Using MapTiler Voyager style for a professional, clean look
        mapStyle={`https://api.maptiler.com/maps/voyager/style.json?key=${MAPTILER_KEY}`}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />

        {/* Draw Navigation Line (Real Roads via ORS) */}
        {routeData && (
          <Source id="route-source" type="geojson" data={routeData}>
            {/* Outline for the route line to make it pop */}
            <Layer
              id="route-layer-outline"
              type="line"
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
              paint={{
                "line-color": "#1e40af", // Darker blue for outline
                "line-width": 8,
                "line-opacity": 0.3,
              }}
            />
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
              <div className="bg-slate-800 text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-lg mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Your Location
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-25"></div>
                <div className="relative bg-white p-1 rounded-full shadow-xl border-2 border-blue-500">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3206/3206203.png"
                    alt="Driver"
                    className="w-8 h-8"
                  />
                </div>
              </div>
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
              <div className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg mb-1 whitespace-nowrap">
                {destinationAddress.split(": ")[0]}
              </div>
              <div className="bg-white p-1 rounded-full shadow-xl border-2 border-red-500">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
                  alt="Destination"
                  className="w-8 h-8"
                />
              </div>
            </div>
          </Marker>
        )}
      </Map>
    </div>
  );
};

export default MapComponent;
