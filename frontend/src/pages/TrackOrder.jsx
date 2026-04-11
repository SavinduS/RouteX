import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowRight,
  MapPin, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Navigation,
  AlertTriangle,
  Trash2,
  Edit3,
  ExternalLink,
  Phone,
  User,
  CreditCard
} from "lucide-react";
import API from "../services/api";

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
      styles: [{ color: "#1D4ED8", weight: 6, opacity: 0.7 }]
    },
    show: false,
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    createMarker: () => null,
  });

  // Hide the itinerary container
  instance.on('routesfound', function() {
    const container = document.querySelector('.leaflet-routing-container');
    if (container) container.style.display = 'none';
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
  iconSize: [45, 45], iconAnchor: [22, 22]
});

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await API.get(`/deliveries/${id}/track`);
        setData(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Tracking error", err);
        setLoading(false);
      }
    };
    fetchTracking();
    const interval = setInterval(fetchTracking, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to cancel and delete this delivery request?")) {
      try {
        await API.delete(`/deliveries/${id}`);
        navigate("/entrepreneur/my-deliveries");
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete order");
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F1F5F9]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Connecting to satellites...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="p-20 text-center font-bold text-slate-400 uppercase tracking-widest">
      Order data not available
    </div>
  );

  const { order, driverLocation } = data;

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

  const statusColors = {
    available: "bg-amber-100 text-amber-700 border-amber-200",
    assigned: "bg-blue-100 text-blue-700 border-blue-200",
    picked_up: "bg-violet-100 text-violet-700 border-violet-200",
    in_transit: "bg-cyan-100 text-cyan-700 border-cyan-200",
    delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-8 lg:p-10 font-sans">
      
      {/* ── Top Navigation ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link to="/entrepreneur/my-deliveries" className="group inline-flex items-center gap-2 text-[#1D4ED8] hover:text-blue-800 font-black text-[10px] uppercase tracking-widest mb-4 transition-colors">
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" /> Back to History
          </Link>
          <h1 className="text-2xl md:text-4xl font-black text-[#1D4ED8] tracking-tighter uppercase flex items-center gap-3 italic">
            <Navigation className="text-[#1D4ED8]" size={32} /> Live Shipment Tracking
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-base mt-1">
            Order Reference: <span className="text-slate-900 font-black">#{order.order_id}</span>
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <span className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border-2 shadow-sm flex items-center gap-2 ${statusColors[order.status] || "bg-white text-slate-600 border-slate-200"}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {order.status.replace('_', ' ')}
          </span>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8">
        
        {/* ── Sidebar: Info & Actions ── */}
        <div className="space-y-6 flex flex-col">
          
          {/* Summary Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Package size={20} />
              </div>
              <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg">Order Details</h3>
            </div>

            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="p-2 bg-slate-50 text-slate-400 rounded-lg h-fit"><User size={16} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient</p>
                  <p className="text-sm font-bold text-slate-800">{order.receiver_name}</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="p-2 bg-slate-50 text-slate-400 rounded-lg h-fit"><MapPin size={16} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pickup</p>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">{order.pickup_address}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-2 bg-slate-50 text-slate-400 rounded-lg h-fit"><ArrowRight size={16} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination</p>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">{order.dropoff_address}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CreditCard size={16} /></div>
                  <span className="text-sm font-black text-slate-900">{order.total_cost.toLocaleString()} LKR</span>
                </div>
                <span className="text-[10px] font-black text-emerald-500 uppercase">Paid</span>
              </div>
            </div>
          </motion.div>

          {/* Courier Status */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className={`p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-5 ${driverLocation ? "bg-blue-600 text-white" : "bg-white text-slate-400"}`}
          >
            <div className={`p-4 rounded-2xl ${driverLocation ? "bg-white/20 text-white" : "bg-slate-50 text-slate-300"}`}>
              <Truck size={32} />
            </div>
            <div>
              <h4 className={`text-lg font-black uppercase tracking-tighter ${driverLocation ? "text-white" : "text-slate-900"}`}>Courier Info</h4>
              {order.driver_id ? (
                <>
                  <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${driverLocation ? "text-blue-100" : "text-slate-500"}`}>
                    {order.driver_id.full_name || "Driver Assigned"}
                  </p>
                  <p className={`text-sm font-black mt-0.5 ${driverLocation ? "text-white" : "text-blue-600"}`}>
                    {order.driver_id.phone_number || "No phone number"}
                  </p>
                </>
              ) : (
                <p className={`text-xs font-medium ${driverLocation ? "text-blue-100" : "text-slate-400"}`}>
                  Searching for a driver...
                </p>
              )}
              {driverLocation && (
                <div className="mt-2 flex items-center gap-2">
                  <Phone size={12} className="text-blue-200" />
                  <span className="text-[10px] font-black tracking-widest uppercase text-blue-200">Contact Active</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Management Controls */}
          <AnimatePresence>
            {["available", "assigned"].includes(order.status) && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                    <AlertTriangle size={20} />
                  </div>
                  <h3 className="font-black text-amber-900 uppercase tracking-tighter text-lg">Manage Order</h3>
                </div>
                
                <p className="text-xs text-amber-700 font-medium leading-relaxed mb-6">
                  {order.status === "available" 
                    ? "This order hasn't been picked up. You can modify or cancel it without any penalties."
                    : "A driver has been assigned. You can still modify or cancel before pickup."}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => navigate(`/entrepreneur/update-delivery/${order._id}`)}
                    className="flex items-center justify-center gap-2 bg-white text-amber-600 px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-amber-100 transition-all active:scale-95"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
                  >
                    <Trash2 size={14} /> Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!driverLocation && order.status !== "available" && (
             <div className="bg-slate-800 text-white p-6 rounded-[2rem] flex items-center gap-4">
                <Clock className="text-blue-400 animate-pulse" size={24} />
                <p className="text-xs font-bold leading-relaxed">
                  Waiting for driver to share live location data. System is polling...
                </p>
             </div>
          )}
        </div>

        {/* ── Main Section: Map ── */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-2 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden min-h-[500px] lg:min-h-0"
        >
          <div className="absolute top-8 left-8 z-[1000] flex flex-col gap-2">
             <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/50 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Pickup</span>
             </div>
             <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/50 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Dropoff</span>
             </div>
          </div>

          <MapContainer center={centerPosition} zoom={14} className="h-full w-full rounded-[2.8rem] overflow-hidden">
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
        </motion.div>

      </div>
    </div>
  );
};

export default TrackOrder;