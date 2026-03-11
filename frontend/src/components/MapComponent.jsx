// src/components/MapComponent.jsx
import React, { useEffect, useState, useRef } from "react";
import Map, { Marker, Source, Layer, NavigationControl, FullscreenControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import axios from "axios";
import { Navigation, MapPin } from "lucide-react";

// --- GET API KEYS FROM .ENV ---
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;
const ORS_KEY = import.meta.env.VITE_ORS_API_KEY;

// Color Theme
const PRIMARY = "#1D4ED8";
const ACCENT = "#06B6D4";

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
        const start = `${driverLocation.lng},${driverLocation.lat}`;
        const end = `${destination.lng},${destination.lat}`;

        const response = await axios.get(
          `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_KEY}&start=${start}&end=${end}`,
        );

        const feature = response.data.features[0];
        setRouteData(feature);

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
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden relative">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: driverLocation?.lng || 79.8612,
          latitude: driverLocation?.lat || 6.9271,
          zoom: 13,
        }}
        mapStyle={`https://api.maptiler.com/maps/voyager/style.json?key=${MAPTILER_KEY}`}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />

        {routeData && (
          <Source id="route-source" type="geojson" data={routeData}>
            <Layer
              id="route-layer-outline"
              type="line"
              layout={{ "line-join": "round", "line-cap": "round" }}
              paint={{
                "line-color": PRIMARY,
                "line-width": 8,
                "line-opacity": 0.2,
              }}
            />
            <Layer
              id="route-layer"
              type="line"
              layout={{ "line-join": "round", "line-cap": "round" }}
              paint={{
                "line-color": PRIMARY,
                "line-width": 5,
              }}
            />
          </Source>
        )}

        {/* Driver Marker - ACCENT Color */}
        {driverLocation && (
          <Marker
            longitude={driverLocation.lng}
            latitude={driverLocation.lat}
            anchor="center"
          >
            <div className="flex flex-col items-center cursor-pointer group">
              <div className="bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded shadow-xl mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 uppercase tracking-widest">
                You
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-[#06B6D4] rounded-full animate-ping opacity-30 scale-150"></div>
                <div className="relative bg-white p-1 rounded-full shadow-2xl border-2 border-white flex items-center justify-center">
                  <div className="bg-[#06B6D4] p-1.5 rounded-full shadow-inner flex items-center justify-center ring-2 ring-cyan-100">
                    <Navigation 
                      size={14} 
                      className="text-white fill-white" 
                      style={{ transform: "rotate(45deg)" }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </Marker>
        )}

        {/* Destination Marker - PRIMARY Color */}
        {destination && (
          <Marker
            longitude={destination.lng}
            latitude={destination.lat}
            anchor="bottom"
          >
            <div className="flex flex-col items-center cursor-pointer group">
              <div className="bg-[#1D4ED8] text-white text-[10px] font-black px-3 py-1.5 rounded shadow-lg mb-1 whitespace-nowrap z-10 uppercase tracking-widest">
                {destinationAddress.split(": ")[0]}
              </div>
              <div className="relative flex items-center justify-center">
                 <div className="absolute bottom-0 w-1 h-1 bg-black/20 rounded-full blur-[1px] transform scale-x-150"></div>
                 <div className="bg-white p-1.5 rounded-full shadow-xl border-2 border-[#1D4ED8] relative transition-transform hover:scale-110">
                    <MapPin size={20} className="text-[#1D4ED8] fill-blue-50" />
                 </div>
              </div>
            </div>
          </Marker>
        )}
      </Map>
    </div>
  );
};

export default MapComponent;
