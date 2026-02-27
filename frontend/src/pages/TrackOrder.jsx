import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";

// Leaflet පාවිච්චි කිරීමට අවශ්‍ය imports
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- Leaflet Default Icon Fix ---
// React වලදී default markers පෙන්වීමට ඇති ගැටලුව විසඳීමට මෙය අවශ්‍ය වේ
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Custom Markers (Pickup, Dropoff, Driver) ---
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

const dropoffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

const driverIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854878.png', // Delivery Bike Icon එකක්
  iconSize: [40, 40], iconAnchor: [20, 20]
});

// Map එක Driver ඉන්න තැනට auto focus කරන component එක
function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, map.getZoom());
  }, [coords]);
  return null;
}

const TrackOrder = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);

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
    const interval = setInterval(fetchTracking, 10000); // තත්පර 10කට වරක් update වේ
    return () => clearInterval(interval);
  }, [id]);

  if (!data) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading Live Tracking...</p>;

  const { order, driverLocation } = data;

  // Map එක මුලින්ම පෙන්විය යුතු තැන (Driver නැත්නම් Pickup එක පෙන්වයි)
  const centerPosition = driverLocation 
    ? [driverLocation.lat, driverLocation.lng] 
    : [order.pickup_lat, order.pickup_lng];

  return (
    <div style={{ padding: "30px", maxWidth: "1100px", margin: "auto", fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      
      {/* Header */}
      <Link to="/entrepreneur/my-deliveries" style={{ textDecoration: 'none', color: '#1B5E20', fontWeight: 'bold' }}>
        ← Back to Deliveries
      </Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
        <div>
          <h2 style={{ color: "#1B5E20", margin: 0 }}>Order Tracking</h2>
          <p style={{ margin: "5px 0", color: "#666" }}>Order ID: <b>{order.order_id || order._id}</b></p>
        </div>
        <span style={{ 
          padding: '8px 20px', 
          background: '#E8F5E9', 
          color: '#2E7D32', 
          borderRadius: '25px', 
          fontWeight: 'bold',
          textTransform: 'uppercase',
          fontSize: '13px',
          border: '1px solid #C8E6C9'
        }}>
          {order.status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '25px', marginTop: '20px' }}>
        
        {/* විස්තර ඇතුළත් වම් පස කොටස */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Summary Box */}
          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <h4 style={{ marginTop: 0, color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Delivery Details</h4>
            <p style={{ fontSize: '14px' }}><b>To:</b> {order.receiver_name}</p>
            <p style={{ fontSize: '14px' }}><b>Contact:</b> {order.receiver_phone}</p>
            <p style={{ fontSize: '14px' }}><b>Pickup:</b> {order.pickup_address}</p>
            <p style={{ fontSize: '14px' }}><b>Dropoff:</b> {order.dropoff_address}</p>
            <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#1B5E20' }}>Cost: LKR {order.total_cost.toLocaleString()}</p>
          </div>

          {/* Courier Status Box */}
          <div style={{ background: "#E8F5E9", padding: "20px", borderRadius: "12px", border: '1px solid #C8E6C9' }}>
            <h4 style={{ marginTop: 0, color: '#2E7D32' }}>Courier Status</h4>
            {driverLocation ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: driverLocation.driver_status === 'online' ? '#4CAF50' : '#F44336' }}></div>
                   <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{driverLocation.driver_status}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#555', marginTop: '10px' }}>
                  Last Updated: {new Date(driverLocation.recorded_at).toLocaleTimeString()}
                </p>
              </>
            ) : (
              <p style={{ fontSize: '14px', color: '#666' }}>Waiting for driver to start live tracking...</p>
            )}
          </div>
        </div>

        {/* --- LIVE MAP කොටස --- */}
        <div style={{ height: "550px", borderRadius: "15px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.15)", border: "1px solid #ddd" }}>
          <MapContainer center={centerPosition} zoom={13} style={{ height: "100%", width: "100%" }}>
            
            {/* Map Style (OpenStreetMap) */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Pickup සහ Dropoff අතර ඉර (Polyline) */}
            <Polyline 
              positions={[
                [order.pickup_lat, order.pickup_lng], 
                [order.dropoff_lat, order.dropoff_lng]
              ]} 
              color="#1B5E20" 
              weight={3} 
              opacity={0.6} 
              dashArray="10, 10" 
            />

            {/* Pickup Marker */}
            <Marker position={[order.pickup_lat, order.pickup_lng]} icon={pickupIcon}>
              <Popup><b>Pickup Point</b><br/>{order.pickup_address}</Popup>
            </Marker>

            {/* Dropoff Marker */}
            <Marker position={[order.dropoff_lat, order.dropoff_lng]} icon={dropoffIcon}>
              <Popup><b>Dropoff Destination</b><br/>{order.dropoff_address}</Popup>
            </Marker>

            {/* Driver Marker (Driver online නම් පමණක් පෙන්වයි) */}
            {driverLocation && (
              <>
                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
                  <Popup>Courier is here!</Popup>
                </Marker>
                {/* Driver ගමන් කරන විට Map එක පස්සෙන් එන්න මෙන්න මේ component එක උදව් වේ */}
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