import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import { createDelivery } from '../services/deliveryService';

// --- Leaflet Markers Icons ---
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

// --- Map Logic Components ---
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
      } catch (err) { onSelect(selectingMode, lat, lng, "Address not found"); }
    },
  });
  return null;
}

const CreateDelivery = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectingMode, setSelectingMode] = useState('pickup');
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState([6.9271, 79.8612]);

  // ඔබ මුලින් ලබාදුන් සියලුම Fields මෙහි අඩංගුයි
  const [formData, setFormData] = useState({
    user_id: "65d4f1a2e4b0d3c1a2f1b1a1", // Current Entrepreneur ID
    receiver_name: '',
    receiver_phone: '',
    receiver_email: '',
    pickup_address: '',
    pickup_lat: 6.9271,
    pickup_lng: 79.8612,
    dropoff_address: '',
    dropoff_lat: 6.9134,
    dropoff_lng: 79.856,
    distance_km: 0, // Backend එකෙන් verify කරනු ලබයි
    total_cost: 0,   // Backend එකෙන් verify කරනු ලබයි
    vehicle_type: 'bike',
    package_size: 'small',
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMapSelect = (type, lat, lng, address) => {
    setFormData(prev => ({
      ...prev,
      [`${type}_lat`]: lat,
      [`${type}_lng`]: lng,
      [`${type}_address`]: address
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
      const data = await res.json();
      if (data.length > 0) setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
    } catch (err) { console.error("Search error", err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pickup_address || !formData.dropoff_address) {
        setError("Please select both Pickup and Dropoff locations on the map.");
        return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || "YOUR_JWT_TOKEN";
      await createDelivery(formData, token);
      alert("Delivery Request Created Successfully!");
      navigate('/entrepreneur/my-deliveries');
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 overflow-hidden font-sans">
      
      {/* Form Sidebar */}
      <div className="w-full lg:w-[480px] p-8 overflow-y-auto border-r border-gray-200 bg-white shadow-2xl z-20">
        <header className="mb-8">
            <h2 className="text-3xl font-extrabold text-green-900 leading-tight">New Delivery Request</h2>
            <p className="text-gray-500 mt-2">Fill in the recipient details and select locations on the map.</p>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Recipient Section */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block border-b pb-1">Recipient Information</label>
            <input name="receiver_name" placeholder="Recipient's Name" required value={formData.receiver_name} onChange={handleInputChange} 
                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" />
            
            <div className="grid grid-cols-2 gap-4">
                <input name="receiver_phone" placeholder="Phone Number" required value={formData.receiver_phone} onChange={handleInputChange} 
                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all" />
                <input name="receiver_email" type="email" placeholder="Email Address" required value={formData.receiver_email} onChange={handleInputChange} 
                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all" />
            </div>
          </div>

          {/* Location Selection Section */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block border-b pb-1">Route Selection</label>
            <div className="flex p-1 bg-gray-100 rounded-xl">
              <button type="button" onClick={() => setSelectingMode('pickup')} 
                      className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${selectingMode === 'pickup' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-200'}`}>
                1. Set Pickup
              </button>
              <button type="button" onClick={() => setSelectingMode('dropoff')} 
                      className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${selectingMode === 'dropoff' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-200'}`}>
                2. Set Dropoff
              </button>
            </div>

            <div className="space-y-2">
                <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                    <span className="text-[10px] font-black text-green-600 uppercase">Pickup Address</span>
                    <p className="text-xs text-gray-700 font-medium truncate">{formData.pickup_address || "Click map to select..."}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                    <span className="text-[10px] font-black text-red-600 uppercase">Dropoff Address</span>
                    <p className="text-xs text-gray-700 font-medium truncate">{formData.dropoff_address || "Click map to select..."}</p>
                </div>
            </div>
          </div>

          {/* Package Info Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase">Vehicle Type</label>
              <select name="vehicle_type" value={formData.vehicle_type} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-green-500 outline-none">
                <option value="bike">Motorbike</option>
                <option value="tuktuk">Tuktuk</option>
                <option value="van">Van</option>
                <option value="truck">Truck</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase">Package Size</label>
              <select name="package_size" value={formData.package_size} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-green-500 outline-none">
                <option value="small">Small (Light)</option>
                <option value="medium">Medium</option>
                <option value="large">Large (Heavy)</option>
              </select>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full py-4 bg-green-800 hover:bg-green-900 text-white font-black rounded-2xl shadow-xl transform transition hover:-translate-y-1 active:scale-95 disabled:opacity-50">
              {loading ? "Verifying Route..." : "CONFIRM DELIVERY REQUEST"}
            </button>
            {error && <p className="text-red-500 text-sm text-center font-bold mt-4 bg-red-50 p-2 rounded-lg border border-red-100">⚠️ {error}</p>}
          </div>
        </form>
      </div>

      {/* Map Section */}
      <div className="flex-1 relative">
        
        {/* Floating Search Bar */}
        <div className="absolute top-8 left-8 right-8 lg:right-auto lg:w-[400px] z-[1000]">
          <form onSubmit={handleSearch} className="flex bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl border border-white/50">
            <input placeholder="Search area (e.g. Kandy, Colombo)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
                   className="flex-1 px-5 py-2.5 outline-none text-sm font-medium bg-transparent" />
            <button type="submit" className="bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors shadow-lg">
              Search
            </button>
          </form>
        </div>

        <MapContainer center={mapCenter} zoom={13} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
          <ChangeView center={mapCenter} />
          <LocationPicker onSelect={handleMapSelect} selectingMode={selectingMode} />

          <Marker position={[formData.pickup_lat, formData.pickup_lng]} icon={pickupIcon}>
            <Popup className="font-bold">Pickup: {formData.pickup_address}</Popup>
          </Marker>
          <Marker position={[formData.dropoff_lat, formData.dropoff_lng]} icon={dropoffIcon}>
            <Popup className="font-bold">Dropoff: {formData.dropoff_address}</Popup>
          </Marker>
        </MapContainer>

        {/* Legend Overlay */}
        <div className="absolute bottom-10 right-10 z-[1000] space-y-2">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-[11px] font-bold text-gray-600 uppercase">Pickup Location Selected</span>
            </div>
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-[11px] font-bold text-gray-600 uppercase">Dropoff Destination Selected</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDelivery;