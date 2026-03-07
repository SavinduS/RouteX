import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import axios from "axios"; // Ensure axios is imported for manual calls if needed

// Leaflet and Routing Machine imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { createControlComponent } from "@react-leaflet/core";

// --- Leaflet Routing Machine Wrapper ---
const createRoutineMachineLayer = ({ waypoints }) => {
  const instance = L.Routing.control({
    waypoints: waypoints.map(wp => L.latLng(wp[0], wp[1])),
    lineOptions: {
      styles: [{ color: "#1B5E20", weight: 5, opacity: 0.8 }]
    },
    show: false,
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    createMarker: () => null,
    itineraryFormatter: {
      formatStep: () => "",
      formatInstruction: () => "",
      formatDistance: () => "",
      formatTime: () => ""
    }
  });

  instance.on('routesfound', function() {
    const container = document.querySelector('.leaflet-routing-container');
    if (container) {
      container.style.display = 'none';
    }
  });

  return instance;
};

const RoutingMachine = createControlComponent(createRoutineMachineLayer);

// --- Marker Icons Setup ---
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

const dropoffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

const driverIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854878.png', 
  iconSize: [40, 40], iconAnchor: [20, 20]
});

// Helper component to center map on coordinates
function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, map.getZoom());
  }, [coords]);
  return null;
}

const TrackOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  // Fetch tracking and order details
  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await API.get(`/deliveries/${id}/track`);
        setData(res.data);
      } catch (err) {
        console.error("Tracking error", err);
      }
    };
    fetchTracking();
    const interval = setInterval(fetchTracking, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [id]);

  // Handle Order Deletion (Cancel Request)
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to cancel and delete this delivery request?")) {
      try {
        await API.delete(`/deliveries/${id}`);
        alert("Order successfully cancelled.");
        navigate("/entrepreneur/my-deliveries"); // Redirect to list after deletion
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete order");
      }
    }
  };

  if (!data) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading Live Tracking...</p>;

  const { order, driverLocation } = data;

  // --- Map Routing Logic ---
  let routingWaypoints = [];
  if (driverLocation) {
    if (order.status === "assigned") {
      routingWaypoints = [[driverLocation.lat, driverLocation.lng], [order.pickup_lat, order.pickup_lng]];
    } else if (order.status === "picked_up" || order.status === "in_transit") {
      routingWaypoints = [[driverLocation.lat, driverLocation.lng], [order.dropoff_lat, order.dropoff_lng]];
    } else {
      routingWaypoints = [[order.pickup_lat, order.pickup_lng], [order.dropoff_lat, order.dropoff_lng]];
    }
  } else {
    routingWaypoints = [[order.pickup_lat, order.pickup_lng], [order.dropoff_lat, order.dropoff_lng]];
  }

  const centerPosition = driverLocation ? [driverLocation.lat, driverLocation.lng] : [order.pickup_lat, order.pickup_lng];

  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "auto", fontFamily: "'Segoe UI', sans-serif" }}>
      
      <Link to="/entrepreneur/my-deliveries" style={{ textDecoration: 'none', color: '#1B5E20', fontWeight: 'bold' }}>
        ← Back to Dashboard
      </Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
        <div>
          <h2 style={{ color: "#1B5E20", margin: 0 }}>Live Tracking</h2>
          <p style={{ margin: "5px 0", color: "#666" }}>Order Ref: <b>{order.order_id}</b></p>
        </div>
        <span style={{ 
          padding: '8px 20px', background: '#E8F5E9', color: '#2E7D32', borderRadius: '25px', 
          fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px', border: '1px solid #C8E6C9'
        }}>
          Current Status: {order.status.replace('_', ' ')}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '25px', marginTop: '20px' }}>
        
        {/* Left Side: Order Information & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Summary Card */}
          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
            <h4 style={{ marginTop: 0, color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Order Details</h4>
            <p style={{ fontSize: '14px' }}><b>Recipient:</b> {order.receiver_name}</p>
            <p style={{ fontSize: '14px' }}><b>Pickup:</b> {order.pickup_address}</p>
            <p style={{ fontSize: '14px' }}><b>Dropoff:</b> {order.dropoff_address}</p>
            <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#1B5E20' }}>Fare: {order.total_cost} LKR</p>
          </div>

          {/* Management Controls (Visible only if status is available) */}
          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", border: order.status === 'available' ? '1px solid #81C784' : '1px solid #eee' }}>
            <h4 style={{ marginTop: 0, color: '#333' }}>Order Management</h4>
            
            {order.status === "available" ? (
              <>
                <p style={{ fontSize: '13px', color: '#555' }}>Driver not assigned. You can still edit or cancel this request.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                  
                  {/* UPDATE BUTTON: Navigate to your Update/Edit page */}
                  <button 
                    onClick={() => navigate(`/entrepreneur/update-delivery/${order._id}`)}
                    style={{ background: '#1976D2', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Edit Order Details
                  </button>

                  {/* DELETE BUTTON: Delete/Cancel Request */}
                  <button 
                    onClick={handleDelete}
                    style={{ background: '#D32F2F', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Cancel Delivery Request
                  </button>

                </div>
              </>
            ) : (
              <p style={{ fontSize: '13px', color: '#888', fontStyle: 'italic' }}>
                Updates and deletions are disabled once the order is accepted by a driver.
              </p>
            )}
          </div>

          {/* Courier Card */}
          <div style={{ background: driverLocation ? "#E8F5E9" : "#F5F5F5", padding: "20px", borderRadius: "12px" }}>
            <h4 style={{ marginTop: 0 }}>Courier Status</h4>
            {driverLocation ? (
              <p style={{ fontSize: '14px', color: '#2E7D32', fontWeight: 'bold' }}>Driver is currently on the move.</p>
            ) : (
              <p style={{ fontSize: '14px', color: '#777' }}>Searching for nearby drivers...</p>
            )}
          </div>
        </div>

        {/* Right Side: Map Display */}
        <div style={{ height: "600px", borderRadius: "15px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", border: "1px solid #ddd" }}>
          <MapContainer center={centerPosition} zoom={14} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            <RoutingMachine waypoints={routingWaypoints} />

            <Marker position={[order.pickup_lat, order.pickup_lng]} icon={pickupIcon}>
              <Popup>Pickup Location</Popup>
            </Marker>

            <Marker position={[order.dropoff_lat, order.dropoff_lng]} icon={dropoffIcon}>
              <Popup>Delivery Destination</Popup>
            </Marker>

            {driverLocation && (
              <>
                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
                  <Popup>Current Courier Position</Popup>
                </Marker>
                <RecenterMap coords={[driverLocation.lat, driverLocation.lng]} />
              </>
            )}
          </MapContainer>
        </div>

      </div>
    </div>
  );
};

export default TrackOrder;