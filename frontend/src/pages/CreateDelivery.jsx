import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import { createDelivery } from '../services/deliveryService';

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
  useEffect(() => { map.setView(center, 14); }, [center, map]);
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

// --- SVG Icons ---
const UserIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const PinIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const BoxIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />
  </svg>
);
const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
  </svg>
);

// --- Reusable Field wrapper ---
const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{label}</label>
    {children}
  </div>
);

// --- Shared input class ---
const inputCls =
  "w-full px-4 py-2.5 bg-[#F1F5F9] border border-slate-200 rounded-xl text-sm text-slate-800 " +
  "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/40 " +
  "focus:border-[#1D4ED8] transition-all";

// --- Section Header ---
const SectionHeader = ({ icon, label }) => (
  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
    <span className="text-[#1D4ED8]">{icon}</span>
    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
  </div>
);

// =============================================================================
const CreateDelivery = () => {
  const navigate = useNavigate();
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [selectingMode, setSelectingMode] = useState('pickup');
  const [searchQuery, setSearchQuery]   = useState('');
  const [mapCenter, setMapCenter]       = useState([6.9271, 79.8612]);

  const [formData, setFormData] = useState({
    user_id:          '65d4f1a2e4b0d3c1a2f1b1a1',
    receiver_name:    '',
    receiver_phone:   '',
    receiver_email:   '',
    pickup_address:   '',
    pickup_lat:       6.9271,
    pickup_lng:       79.8612,
    dropoff_address:  '',
    dropoff_lat:      6.9134,
    dropoff_lng:      79.856,
    distance_km:      0,
    total_cost:       0,
    vehicle_type:     'bike',
    package_size:     'small',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // --- Input Masking & Prevention ---
    if (name === "receiver_phone") {
      // Allow only numbers and limit to 10
      const val = value.replace(/[^0-9]/g, "").slice(0, 10);
      setFormData({ ...formData, [name]: val });
      return;
    }

    if (name === "receiver_email") {
      // Rule: Simple letters, numbers, @ and . only.
      // Special Rule: Cant type numbers front of email (first char)
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
    setError(null);

    // --- Strict Final Validation ---
    if (formData.receiver_phone.length !== 10) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    const emailRegex = /^[a-z][a-z0-9._]*@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(formData.receiver_email)) {
      setError("Please enter a valid email. (Note: Email cannot start with a number)");
      return;
    }

    if (!formData.pickup_address || !formData.dropoff_address) {
      setError('Please select both Pickup and Dropoff locations on the map.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || 'YOUR_JWT_TOKEN';
      await createDelivery(formData, token);
      alert('Delivery Request Created Successfully!');
      navigate('/entrepreneur/my-deliveries');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#F1F5F9] overflow-hidden">

      {/* ════════════════ SIDEBAR ════════════════ */}
      <div className="w-full lg:w-[460px] flex flex-col bg-white shadow-2xl z-20 overflow-hidden">

        {/* Header Banner */}
        <div className="relative bg-[#1D4ED8] px-8 py-7 shrink-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#06B6D4]/20 rounded-full pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[#06B6D4] text-xs font-bold uppercase tracking-widest mb-1">Entrepreneur Portal</p>
            <h2 className="text-2xl font-extrabold text-white tracking-tight leading-tight">New Delivery Request</h2>
            <p className="text-blue-200 text-sm mt-1">Fill in details and pin locations on the map.</p>
          </div>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-7">

            {/* ── Recipient ── */}
            <div className="space-y-4">
              <SectionHeader icon={<UserIcon />} label="Recipient Information" />

              <Field label="Full Name">
                <input name="receiver_name" placeholder="e.g. Kamal Perera" required
                  value={formData.receiver_name} onChange={handleInputChange} className={inputCls} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone">
                  <input name="receiver_phone" placeholder="07X XXX XXXX" required
                    value={formData.receiver_phone} onChange={handleInputChange} className={inputCls} />
                </Field>
                <Field label="Email">
                  <input name="receiver_email" type="email" placeholder="email@example.com" required
                    value={formData.receiver_email} onChange={handleInputChange} className={inputCls} />
                </Field>
              </div>
            </div>

            {/* ── Route ── */}
            <div className="space-y-4">
              <SectionHeader icon={<PinIcon />} label="Route Selection" />

              {/* Toggle Buttons */}
              <div className="flex p-1 bg-[#F1F5F9] rounded-xl gap-1">
                <button type="button" onClick={() => setSelectingMode('pickup')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    selectingMode === 'pickup'
                      ? 'bg-[#1D4ED8] text-white shadow-md'
                      : 'text-slate-500 hover:bg-slate-200'
                  }`}>
                  📍 Set Pickup
                </button>
                <button type="button" onClick={() => setSelectingMode('dropoff')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    selectingMode === 'dropoff'
                      ? 'bg-[#06B6D4] text-white shadow-md'
                      : 'text-slate-500 hover:bg-slate-200'
                  }`}>
                  🏁 Set Dropoff
                </button>
              </div>

              {/* Address Preview Cards */}
              <div className="space-y-2">
                <div className={`p-3 rounded-xl border transition-all ${
                  selectingMode === 'pickup'
                    ? 'bg-blue-50 border-[#1D4ED8]/30 ring-2 ring-[#1D4ED8]/15'
                    : 'bg-[#F1F5F9] border-slate-200'
                }`}>
                  <span className="text-[10px] font-black text-[#1D4ED8] uppercase tracking-wider">Pickup</span>
                  <p className="text-xs text-slate-700 font-medium mt-0.5 truncate">
                    {formData.pickup_address || 'Click map to select…'}
                  </p>
                </div>
                <div className={`p-3 rounded-xl border transition-all ${
                  selectingMode === 'dropoff'
                    ? 'bg-cyan-50 border-[#06B6D4]/30 ring-2 ring-[#06B6D4]/15'
                    : 'bg-[#F1F5F9] border-slate-200'
                }`}>
                  <span className="text-[10px] font-black text-[#06B6D4] uppercase tracking-wider">Dropoff</span>
                  <p className="text-xs text-slate-700 font-medium mt-0.5 truncate">
                    {formData.dropoff_address || 'Click map to select…'}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Package ── */}
            <div className="space-y-4">
              <SectionHeader icon={<BoxIcon />} label="Package Details" />

              <div className="grid grid-cols-2 gap-3">
                <Field label="Vehicle Type">
                  <select name="vehicle_type" value={formData.vehicle_type} onChange={handleInputChange} className={inputCls}>
                    <option value="bike">🏍 Motorbike</option>
                    <option value="tuktuk">🛺 Tuktuk</option>
                    <option value="van">🚐 Van</option>
                    <option value="truck">🚛 Truck</option>
                  </select>
                </Field>
                <Field label="Package Size">
                  <select name="package_size" value={formData.package_size} onChange={handleInputChange} className={inputCls}>
                    <option value="small">Small (Light)</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large (Heavy)</option>
                  </select>
                </Field>
              </div>
            </div>

            {/* ── Submit ── */}
            <div className="pb-2 space-y-3">
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-[#1D4ED8] hover:bg-[#1E40AF] active:scale-95 disabled:opacity-50
                           text-white font-black rounded-2xl shadow-lg shadow-[#1D4ED8]/25
                           transition-all text-sm tracking-wide">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying Route…
                  </span>
                ) : 'CONFIRM DELIVERY REQUEST'}
              </button>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
                  <span className="shrink-0">⚠️</span>
                  <span>{error}</span>
                </div>
              )}
            </div>

          </form>
        </div>
      </div>

      {/* ════════════════ MAP ════════════════ */}
      <div className="flex-1 relative">

        {/* Floating Search */}
        <div className="absolute top-6 left-6 right-6 lg:right-auto lg:w-[420px] z-[1000]">
          <form onSubmit={handleSearch}
            className="flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/60 overflow-hidden">
            <span className="pl-4 text-slate-400 shrink-0"><SearchIcon /></span>
            <input
              placeholder="Search area (e.g. Kandy, Colombo)…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-3 outline-none text-sm font-medium bg-transparent text-slate-800 placeholder:text-slate-400"
            />
            <button type="submit"
              className="m-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shrink-0">
              Search
            </button>
          </form>
        </div>

        {/* Active Mode Pill */}
        <div className="absolute top-24 left-6 z-[1000]">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-lg backdrop-blur-sm border ${
            selectingMode === 'pickup'
              ? 'bg-[#1D4ED8]/90 text-white border-[#1D4ED8]/50'
              : 'bg-[#06B6D4]/90 text-white border-[#06B6D4]/50'
          }`}>
            <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
            {selectingMode === 'pickup' ? 'Click map to set PICKUP' : 'Click map to set DROPOFF'}
          </div>
        </div>

        <MapContainer center={mapCenter} zoom={13} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <ChangeView center={mapCenter} />
          <LocationPicker onSelect={handleMapSelect} selectingMode={selectingMode} />

          <Marker position={[formData.pickup_lat, formData.pickup_lng]} icon={pickupIcon}>
            <Popup><strong>Pickup:</strong> {formData.pickup_address}</Popup>
          </Marker>
          <Marker position={[formData.dropoff_lat, formData.dropoff_lng]} icon={dropoffIcon}>
            <Popup><strong>Dropoff:</strong> {formData.dropoff_address}</Popup>
          </Marker>
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-8 right-8 z-[1000] space-y-2">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8] shrink-0" />
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Pickup Location</span>
          </div>
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#06B6D4] shrink-0" />
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Dropoff Destination</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateDelivery;