import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  MapPin,
  Package,
  Search,
  Filter,
  RefreshCcw,
  ChevronDown,
  ChevronUp
} from "lucide-react";

// Helper: Calculate distance between two lat/lng coordinates in kilometers (Haversine Formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const AvailableOrders = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const DRIVER_ID = user?.id || user?._id;

  const [availableOrders, setAvailableOrders] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);
  const [isOnline, setIsOnline] = useState(
    () => localStorage.getItem("driverOnline") === "true",
  );
  const [showFilters, setShowFilters] = useState(false); // Mobile filter toggle

  // Filter States
  const [searchCity, setSearchCity] = useState("");
  const [maxDistance, setMaxDistance] = useState(""); // empty means 'Any distance'

  const fetchAvailableOrders = async () => {
    try {
      const res = await api.get("/driver/orders/available?vehicle_type=bike");
      setAvailableOrders(res.data.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    if (isOnline) {
      fetchAvailableOrders();
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setDriverLocation({ lat: latitude, lng: longitude });
          },
          (err) => console.error("Geo error:", err)
        );
      }
    }
  }, [isOnline]);

  const handleAcceptOrder = async (order) => {
    if (!DRIVER_ID) {
      alert("Driver ID not found. Please re-login.");
      return;
    }
    try {
      await api.post("/driver/orders/accept", {
        order_id: order._id,
        driver_id: DRIVER_ID,
      });
      alert("Order accepted successfully!");
      setAvailableOrders(availableOrders.filter((o) => o._id !== order._id));
      navigate("/driver/dashboard");
    } catch (err) {
      console.error("Failed to accept order:", err);
      alert(err.response?.data?.message || "Failed to accept order");
    }
  };

  // --- Filtering Logic ---
  const filteredAvailableOrders = availableOrders
    .map((order) => {
      let distanceToPickup = null;
      if (driverLocation && order.pickup_lat && order.pickup_lng) {
        distanceToPickup = calculateDistance(
          driverLocation.lat,
          driverLocation.lng,
          order.pickup_lat,
          order.pickup_lng,
        );
      }
      return { ...order, distanceToPickup };
    })
    .filter((order) => {
      const searchLower = searchCity.toLowerCase();
      const matchesCity =
        !searchCity ||
        order.pickup_address.toLowerCase().includes(searchLower) ||
        order.dropoff_address.toLowerCase().includes(searchLower);

      let matchesDistance = true;
      if (maxDistance !== "" && order.distanceToPickup !== null) {
        matchesDistance = order.distanceToPickup <= parseFloat(maxDistance);
      }

      return matchesCity && matchesDistance;
    })
    .sort((a, b) => {
      if (a.distanceToPickup !== null && b.distanceToPickup !== null) {
        return a.distanceToPickup - b.distanceToPickup;
      }
      return 0;
    });

  return (
    <div className="p-3 md:p-6 bg-[#F1F5F9] min-h-screen font-sans">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-8 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 gap-4 text-center sm:text-left">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-slate-800 flex items-center justify-center sm:justify-start gap-3">
            <Package className="text-[#1D4ED8] w-6 h-6 md:w-8 md:h-8" /> Available Orders
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Browse and accept delivery requests near you</p>
        </div>
        <button
          onClick={fetchAvailableOrders}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1D4ED8] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg active:scale-95 text-sm md:text-base"
        >
          <RefreshCcw size={20} /> Refresh
        </button>
      </div>

      {!isOnline && (
        <div className="bg-white border-l-4 border-rose-500 p-4 md:p-6 rounded-xl shadow-sm mb-8 flex items-center gap-4">
          <div className="bg-rose-50 p-2 md:p-3 rounded-full shrink-0">
            <Filter className="text-rose-500 w-5 h-5 md:w-6 md:h-6" />
          </div>
          <p className="text-sm md:text-base text-slate-700 font-medium leading-relaxed">
            You are currently offline. Please go online from the{" "}
            <a href="/driver/dashboard" className="text-[#1D4ED8] font-bold hover:underline">
              Dashboard
            </a>{" "}
            to see and accept available orders.
          </p>
        </div>
      )}

      {isOnline && (
        <div className="flex flex-col md:grid md:grid-cols-4 gap-6 md:gap-8">
          
          {/* Mobile Filter Toggle */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 font-bold text-slate-700"
          >
            <span className="flex items-center gap-2">
              <Filter size={18} className="text-[#1D4ED8]" /> Filters
            </span>
            {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {/* Filters Column */}
          <div className={`
            ${showFilters ? 'block' : 'hidden'} 
            md:block md:col-span-1 space-y-6
          `}>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="hidden md:flex font-black text-slate-800 mb-5 items-center gap-2 uppercase tracking-wider text-sm">
                <Filter size={18} className="text-[#1D4ED8]" /> Filters
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">
                    Search Location
                  </label>
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-4 top-3 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="City or street..."
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">
                    Max Distance
                  </label>
                  <select
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all cursor-pointer appearance-none"
                    disabled={!driverLocation}
                  >
                    <option value="">Any distance</option>
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                    <option value="20">Within 20 km</option>
                    <option value="50">Within 50 km</option>
                  </select>
                  {!driverLocation && (
                    <p className="text-[10px] text-rose-500 mt-2 font-bold animate-pulse">
                      Waiting for GPS to enable distance filter...
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#1D4ED8] p-6 rounded-2xl shadow-blue-200 shadow-xl text-white">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Live Status</h3>
              <p className="text-2xl font-black">
                {filteredAvailableOrders.length}
              </p>
              <p className="text-xs font-medium opacity-80 mt-1">Orders match your criteria</p>
            </div>
          </div>

          {/* Orders List Column */}
          <div className="md:col-span-3">
            {filteredAvailableOrders.length === 0 ? (
              <div className="bg-white p-10 md:p-16 rounded-3xl shadow-sm text-center border border-slate-200">
                <div className="bg-slate-50 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package size={48} className="text-slate-200" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-3">No orders found</h3>
                <p className="text-sm md:text-base text-slate-500 max-w-sm mx-auto leading-relaxed">
                  {availableOrders.length > 0
                    ? "Try adjusting your filters or search location to see more results."
                    : "There are no available orders at the moment. We'll alert you when new ones arrive!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {filteredAvailableOrders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-[#1D4ED8]/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4 md:mb-6">
                      <div className="flex-1 pr-2">
                        <span className="text-[10px] font-black text-[#1D4ED8] bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-widest truncate block max-w-[150px]">
                          #{order.order_id}
                        </span>
                        <h3 className="font-black text-slate-900 mt-2 text-base md:text-lg leading-tight">
                          To {order.dropoff_address.split(',')[0]}
                        </h3>
                      </div>
                      {order.distanceToPickup !== null && (
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-[#06B6D4] bg-cyan-50 px-2.5 py-1 rounded-full">
                            {order.distanceToPickup.toFixed(1)} km
                          </span>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Away</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 mb-6 md:mb-8">
                      <div className="flex gap-3 md:gap-4">
                        <div className="flex flex-col items-center mt-1 shrink-0">
                          <div className="w-2.5 h-2.5 rounded-full border-2 border-[#06B6D4] bg-white"></div>
                          <div className="w-0.5 flex-1 bg-slate-100 my-1"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8]"></div>
                        </div>
                        <div className="flex-1 space-y-3 md:space-y-4 min-w-0">
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Pickup</p>
                            <p className="text-xs font-bold text-slate-700 leading-snug truncate">{order.pickup_address}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Drop-off</p>
                            <p className="text-xs font-bold text-slate-700 leading-snug truncate">{order.dropoff_address}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between pt-4 md:pt-5 border-t border-slate-50 gap-4">
                      <div className="text-center sm:text-left">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Total Earning</p>
                        <p className="text-xl md:text-2xl font-black text-slate-900">LKR {order.total_cost}</p>
                      </div>
                      <button
                        onClick={() => handleAcceptOrder(order)}
                        className="w-full sm:w-auto bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-sm hover:bg-[#1D4ED8] transition-all shadow-lg active:scale-95 group-hover:scale-105"
                      >
                        Accept Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableOrders;
