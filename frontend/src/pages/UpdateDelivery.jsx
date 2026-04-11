import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Box, 
  Save, 
  X, 
  Edit3,
  AlertCircle,
  Search as SearchIcon,
  MapPin
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import API from "../services/api";

// --- Leaflet Marker Icons ---
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const dropoffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// --- Map Logic ---
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => { 
    if (center && center[0] !== 0) map.setView(center, 14); 
  }, [center, map]);
  return null;
}

function LocationPicker({ onSelect, selectingMode }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const address = data.display_name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        onSelect(selectingMode, lat, lng, address);
      } catch { onSelect(selectingMode, lat, lng, "Address not found"); }
    },
  });
  return null;
}

const UpdateDelivery = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    receiver_name: "",
    receiver_phone: "",
    receiver_email: "",
    package_size: "",
    pickup_address: "",
    pickup_lat: 0,
    pickup_lng: 0,
    dropoff_address: "",
    dropoff_lat: 0,
    dropoff_lng: 0,
    vehicle_type: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectingMode, setSelectingMode] = useState('pickup');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState([6.9271, 79.8612]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await API.get(`/deliveries/${id}/track`);
        const order = res.data.order;

        if (!["available", "assigned"].includes(order.status)) {
          alert("This order is already in progress and cannot be edited.");
          navigate("/entrepreneur/my-deliveries");
          return;
        }

        setFormData({
          receiver_name: order.receiver_name,
          receiver_phone: order.receiver_phone,
          receiver_email: order.receiver_email,
          package_size: order.package_size,
          pickup_address: order.pickup_address,
          pickup_lat: order.pickup_lat,
          pickup_lng: order.pickup_lng,
          dropoff_address: order.dropoff_address,
          dropoff_lat: order.dropoff_lat,
          dropoff_lng: order.dropoff_lng,
          vehicle_type: order.vehicle_type
        });
        setMapCenter([order.pickup_lat, order.pickup_lng]);
        setLoading(false);
      } catch (err) {
        setError("Failed to load order details.");
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "receiver_phone") {
      const val = value.replace(/[^0-9]/g, "").slice(0, 10);
      setFormData({ ...formData, [name]: val });
      return;
    }

    if (name === "receiver_email") {
      let val = value.toLowerCase().replace(/[^a-z0-9@.]/g, "");
      if (val.length > 0 && /^[0-9]/.test(val)) {
        val = val.replace(/^[0-9]+/, "");
      }
      setFormData({ ...formData, [name]: val });
      return;
    }

    if (name === "receiver_name") {
      const val = value.replace(/[^a-zA-Z\s]/g, "");
      setFormData({ ...formData, [name]: val });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleMapSelect = (type, lat, lng, address) =>
    setFormData(prev => ({
      ...prev,
      [`${type}_lat`]: lat,
      [`${type}_lng`]: lng,
      [`${type}_address`]: address,
    }));

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
      const data = await res.json();
      if (data.length > 0) setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
    } catch (err) { console.error('Search error', err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // --- Strict Final Validation ---
    if (formData.receiver_phone.length !== 10) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    const emailRegex = /^[a-z][a-z0-9._]*@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(formData.receiver_email)) {
      alert("Please enter a valid email. (Note: Email cannot start with a number)");
      return;
    }

    setSaving(true);
    try {
      await API.put(`/deliveries/${id}`, formData);
      navigate(`/entrepreneur/track/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F1F5F9]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Loading Order...</p>
      </div>
    </div>
  );

  const inputCls = "w-full pl-12 pr-4 py-3.5 bg-[#F1F5F9] border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-8 lg:p-10 font-sans">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="relative">
          <Link to={`/entrepreneur/track/${id}`} className="group inline-flex items-center gap-2 text-[#1D4ED8] hover:text-blue-800 font-black text-[10px] uppercase tracking-widest mb-4 transition-colors">
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" /> Back to Tracking
          </Link>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-tight">Edit Shipment</h2>
          <p className="text-slate-400 text-[11px] md:text-xs font-bold uppercase tracking-widest mt-1">Adjust locations and details for order #{id.slice(-6).toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-8">

        {/* ════════════════ FORM SIDEBAR ════════════════ */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col h-fit">
          
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="flex items-center gap-3 bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              {/* Recipient Details */}
              <div className="space-y-4">
                 <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                    <User className="text-[#1D4ED8]" size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recipient Info</span>
                 </div>
                 
                 <div className="space-y-4">
                   <div className="relative">
                     <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                     <input 
                       type="text" name="receiver_name" value={formData.receiver_name} 
                       onChange={handleChange} placeholder="Recipient Name" required className={inputCls} />
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="relative">
                       <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                       <input 
                         type="text" name="receiver_phone" value={formData.receiver_phone} 
                         onChange={handleChange} placeholder="Phone Number" required className={inputCls} />
                     </div>
                     <div className="relative">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                       <input 
                         type="email" name="receiver_email" value={formData.receiver_email} 
                         onChange={handleChange} placeholder="Email Address" required className={inputCls} />
                     </div>
                   </div>
                 </div>
              </div>

              {/* Route Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                    <MapPin className="text-[#1D4ED8]" size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Route Selection</span>
                </div>

                <div className="flex p-1 bg-[#F1F5F9] rounded-xl gap-1">
                  <button type="button" onClick={() => setSelectingMode('pickup')}
                    className={`flex-1 py-3 rounded-lg text-xs font-black uppercase transition-all ${
                      selectingMode === 'pickup' ? 'bg-[#1D4ED8] text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'
                    }`}>
                    📍 Pickup
                  </button>
                  <button type="button" onClick={() => setSelectingMode('dropoff')}
                    className={`flex-1 py-3 rounded-lg text-xs font-black uppercase transition-all ${
                      selectingMode === 'dropoff' ? 'bg-[#06B6D4] text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'
                    }`}>
                    🏁 Dropoff
                  </button>
                </div>

                <div className="space-y-2">
                  <div className={`p-4 rounded-xl border transition-all ${selectingMode === 'pickup' ? 'bg-blue-50 border-[#1D4ED8]/30 ring-2 ring-[#1D4ED8]/15' : 'bg-[#F1F5F9] border-slate-200'}`}>
                    <span className="text-[9px] font-black text-[#1D4ED8] uppercase tracking-wider">Pickup Address</span>
                    <p className="text-xs text-slate-700 font-bold mt-1 truncate">{formData.pickup_address}</p>
                  </div>
                  <div className={`p-4 rounded-xl border transition-all ${selectingMode === 'dropoff' ? 'bg-cyan-50 border-[#06B6D4]/30 ring-2 ring-[#06B6D4]/15' : 'bg-[#F1F5F9] border-slate-200'}`}>
                    <span className="text-[9px] font-black text-[#06B6D4] uppercase tracking-wider">Dropoff Address</span>
                    <p className="text-xs text-slate-700 font-bold mt-1 truncate">{formData.dropoff_address}</p>
                  </div>
                </div>
              </div>

              {/* Package & Vehicle */}
              <div className="space-y-4">
                 <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                    <Box className="text-[#1D4ED8]" size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Package & Vehicle</span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle</label>
                     <select name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} className="w-full px-4 py-3.5 bg-[#F1F5F9] border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none">
                       <option value="bike">🏍 Motorbike</option>
                       <option value="tuktuk">🛺 Tuktuk</option>
                       <option value="van">🚐 Van</option>
                       <option value="truck">🚛 Truck</option>
                     </select>
                   </div>
                   <div className="space-y-1">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Size</label>
                     <select name="package_size" value={formData.package_size} onChange={handleChange} className="w-full px-4 py-3.5 bg-[#F1F5F9] border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none">
                       <option value="small">Small</option>
                       <option value="medium">Medium</option>
                       <option value="large">Large</option>
                     </select>
                   </div>
                 </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-slate-50 flex gap-4">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 py-5 bg-[#1D4ED8] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all active:scale-95 disabled:opacity-50"
                >
                  {saving ? "Saving Changes…" : "Confirm Updates"}
                </button>
                <button 
                  type="button" 
                  onClick={() => navigate(-1)}
                  className="px-8 flex items-center justify-center bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ════════════════ MAP SECTION ════════════════ */}
        <div className="bg-white p-2 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden min-h-[500px] lg:min-h-0 h-full">
          
          {/* Floating Search */}
          <div className="absolute top-8 left-8 right-8 lg:right-auto lg:w-[420px] z-[1000]">
            <form onSubmit={handleSearch}
              className="flex items-center bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/60 overflow-hidden">
              <span className="pl-4 text-slate-400 shrink-0"><SearchIcon size={18} /></span>
              <input
                placeholder="Search area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-3 outline-none text-sm font-medium bg-transparent text-slate-800 placeholder:text-slate-400"
              />
              <button type="submit"
                className="m-1.5 bg-[#1D4ED8] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors">
                Search
              </button>
            </form>
          </div>

          {/* Mode Indicators */}
          <div className="absolute top-28 left-8 z-[1000] flex flex-col gap-3">
            <div className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md border transition-all ${
              selectingMode === 'pickup' ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]/50' : 'bg-[#06B6D4] text-white border-[#06B6D4]/50'
            }`}>
              Mode: Setting {selectingMode}
            </div>
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/50 flex flex-col gap-2">
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Pickup Pin</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Dropoff Pin</span>
               </div>
            </div>
          </div>

          <MapContainer center={mapCenter} zoom={13} className="h-full w-full rounded-[2.8rem] overflow-hidden">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ChangeView center={mapCenter} />
            <LocationPicker onSelect={handleMapSelect} selectingMode={selectingMode} />

            <Marker position={[formData.pickup_lat, formData.pickup_lng]} icon={pickupIcon}>
              <Popup><strong>Pickup:</strong> {formData.pickup_address}</Popup>
            </Marker>
            <Marker position={[formData.dropoff_lat, formData.dropoff_lng]} icon={dropoffIcon}>
              <Popup><strong>Dropoff:</strong> {formData.dropoff_address}</Popup>
            </Marker>
          </MapContainer>

          <div className="absolute bottom-8 left-8 z-[1000]">
            <div className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest">Click map to move markers</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UpdateDelivery;