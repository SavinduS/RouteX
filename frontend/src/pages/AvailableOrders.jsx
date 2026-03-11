import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  MapPin,
  Package,
  Search,
  Filter,
  RefreshCcw,
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-green-600" /> Available Orders
        </h1>
        <button
          onClick={fetchAvailableOrders}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCcw size={18} /> Refresh
        </button>
      </div>

      {!isOnline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
          <p className="text-yellow-700">
            You are currently offline. Please go online from the{" "}
            <a href="/driver/dashboard" className="font-bold underline">
              Dashboard
            </a>{" "}
            to see and accept available orders.
          </p>
        </div>
      )}

      {isOnline && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters Column */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Filter size={18} /> Filters
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                    Search Location
                  </label>
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-2.5 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="City or street..."
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                    Max Distance
                  </label>
                  <select
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-500 bg-white"
                    disabled={!driverLocation}
                  >
                    <option value="">Any distance</option>
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                    <option value="20">Within 20 km</option>
                    <option value="50">Within 50 km</option>
                  </select>
                  {!driverLocation && (
                    <p className="text-[10px] text-orange-500 mt-1">
                      Waiting for GPS to enable distance filter...
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h3 className="text-sm font-bold text-blue-800 mb-1">Status</h3>
              <p className="text-xs text-blue-600">
                Found {filteredAvailableOrders.length} orders near you.
              </p>
            </div>
          </div>

          {/* Orders List Column */}
          <div className="md:col-span-3">
            {filteredAvailableOrders.length === 0 ? (
              <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-100">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">No orders found</h3>
                <p className="text-gray-500">
                  {availableOrders.length > 0
                    ? "Try adjusting your filters to see more results."
                    : "There are no available orders at the moment. Please check back soon!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredAvailableOrders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">
                          #{order.order_id}
                        </span>
                        <h3 className="font-bold text-gray-800 mt-1">
                          Delivery to {order.dropoff_address.split(',')[0]}
                        </h3>
                      </div>
                      {order.distanceToPickup !== null && (
                        <div className="text-right">
                          <span className="text-xs font-bold text-green-600">
                            {order.distanceToPickup.toFixed(1)} km
                          </span>
                          <p className="text-[10px] text-gray-400">away</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 mb-5">
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <div className="w-0.5 h-6 bg-gray-100"></div>
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-xs text-gray-600 leading-tight">
                            <span className="font-semibold text-gray-800">Pickup:</span> {order.pickup_address}
                          </p>
                          <p className="text-xs text-gray-600 leading-tight">
                            <span className="font-semibold text-gray-800">Dropoff:</span> {order.dropoff_address}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Earnings</p>
                        <p className="text-lg font-bold text-gray-900">LKR {order.total_cost}</p>
                      </div>
                      <button
                        onClick={() => handleAcceptOrder(order)}
                        className="bg-black text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors shadow-sm"
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
