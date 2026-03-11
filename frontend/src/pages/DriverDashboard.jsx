import React, { useState, useEffect } from "react";
import api from "../services/api";
import { io } from "socket.io-client";
import MapComponent from "../components/MapComponent";
import {
  MapPin,
  Package,
  CheckCircle,
  Navigation,
  Search,
  Filter,
} from "lucide-react";

// --- Configuration ---
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

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

const DriverDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const DRIVER_ID = user?.id || user?._id;

  // Persistence State
  const [isOnline, setIsOnline] = useState(
    () => localStorage.getItem("driverOnline") === "true",
  );
  const [activeOrders, setActiveOrders] = useState(() => {
    const saved = localStorage.getItem("activeOrders");
    return saved ? JSON.parse(saved) : [];
  });

  const [availableOrders, setAvailableOrders] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [socket, setSocket] = useState(null);

  // Filter States
  const [searchCity, setSearchCity] = useState("");
  const [maxDistance, setMaxDistance] = useState(""); // empty means 'Any distance'

  // 1. API Actions
  const fetchAvailableOrders = async () => {
    try {
      const res = await api.get("/driver/orders/available?vehicle_type=bike");
      setAvailableOrders(res.data.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  // 2. Initialize Socket.io Connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  // 3. Persist State & Manage GeoWatcher based on Online Status
  useEffect(() => {
    if (!DRIVER_ID) return;

    localStorage.setItem("driverOnline", isOnline);
    localStorage.setItem("activeOrders", JSON.stringify(activeOrders));

    let watchId;
    if (isOnline) {
      socket?.emit("driver_go_online", { driver_id: DRIVER_ID });
      fetchAvailableOrders();

      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setDriverLocation({ lat: latitude, lng: longitude });

            socket?.emit("driver_live_location", {
              driver_id: DRIVER_ID,
              lat: latitude,
              lng: longitude,
              active_order_ids: activeOrders.map((o) => o._id),
              driver_status: activeOrders.length > 0 ? "busy" : "online",
            });
          },
          (err) => console.error("Geo error:", err),
          { enableHighAccuracy: true, maximumAge: 0 },
        );
      }
    } else {
      socket?.emit("driver_go_offline", { driver_id: DRIVER_ID });
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isOnline, activeOrders, socket, DRIVER_ID]);

  // Order Actions
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

      const acceptedOrder = { ...order, status: "assigned" };
      setActiveOrders([...activeOrders, acceptedOrder]);
      setAvailableOrders(availableOrders.filter((o) => o._id !== order._id));
      setSelectedOrderId(order._id);
    } catch (err) {
      console.error("Failed to accept order:", err);
      alert(err.response?.data?.message || "Failed to accept order");
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.post("/driver/orders/status", {
        order_id: orderId,
        status: newStatus,
      });

      if (newStatus === "delivered") {
        const updatedList = activeOrders.filter((o) => o._id !== orderId);
        setActiveOrders(updatedList);
        if (selectedOrderId === orderId) setSelectedOrderId(null);
      } else {
        setActiveOrders(
          activeOrders.map((o) =>
            o._id === orderId ? { ...o, status: newStatus } : o,
          ),
        );
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (!user) {
    return (
      <div className="p-10 text-center">
        Please log in to access the dashboard.
      </div>
    );
  }

  const selectedOrder = activeOrders.find((o) => o._id === selectedOrderId);

  // --- Filtering Logic ---
  const filteredAvailableOrders = availableOrders
    .map((order) => {
      // Calculate distance to pickup if driver location is known
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
      // 1. City / Address Match
      const searchLower = searchCity.toLowerCase();
      const matchesCity =
        !searchCity ||
        order.pickup_address.toLowerCase().includes(searchLower) ||
        order.dropoff_address.toLowerCase().includes(searchLower);

      // 2. Distance Match
      let matchesDistance = true;
      if (maxDistance !== "" && order.distanceToPickup !== null) {
        matchesDistance = order.distanceToPickup <= parseFloat(maxDistance);
      }

      return matchesCity && matchesDistance;
    })
    .sort((a, b) => {
      // Sort by closest pickup automatically if driver location is available
      if (a.distanceToPickup !== null && b.distanceToPickup !== null) {
        return a.distanceToPickup - b.distanceToPickup;
      }
      return 0;
    });

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Driver Dashboard</h1>
          <p className="text-sm text-gray-500">
            Status:{" "}
            {isOnline ? (
              <span className="text-green-600 font-semibold">Online</span>
            ) : (
              <span className="text-red-500 font-semibold">Offline</span>
            )}
          </p>
        </div>

        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`px-6 py-3 rounded-full font-bold text-white transition-all ${
            isOnline
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {isOnline ? "Go Offline" : "Go Online (Start Shift)"}
        </button>
      </div>

      {/* Main Grid */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-1/3 flex flex-col gap-4 overflow-hidden">
          {/* Active Orders Section */}
          <div className="bg-white p-4 rounded-lg shadow-md border-t-4 border-blue-500 overflow-y-auto max-h-[40%]">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Package className="text-blue-500" /> My Active Orders
            </h2>
            {activeOrders.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No active orders right now.
              </p>
            ) : (
              activeOrders.map((order) => (
                <div
                  key={order._id}
                  className={`p-3 mb-3 border rounded-lg cursor-pointer transition-all ${
                    selectedOrderId === order._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedOrderId(order._id)}
                >
                  <p className="font-bold">{order.order_id}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="font-semibold text-gray-800">Route:</span>{" "}
                    {order.pickup_address} → {order.dropoff_address}
                  </p>

                  <div className="mt-3 flex gap-2">
                    {order.status === "assigned" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(order._id, "picked_up");
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-2 rounded w-full flex justify-center items-center gap-1 font-semibold"
                      >
                        <MapPin size={14} /> Mark Picked Up
                      </button>
                    )}
                    {["picked_up", "in_transit"].includes(order.status) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(order._id, "delivered");
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded w-full flex justify-center items-center gap-1 font-semibold"
                      >
                        <CheckCircle size={14} /> Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Available Orders Section */}
          <div className="bg-white p-4 rounded-lg shadow-md border-t-4 border-green-500 flex-1 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-3 shrink-0">
              <h2 className="text-lg font-bold flex items-center gap-2">
                Available Orders
              </h2>
              <button
                onClick={fetchAvailableOrders}
                className="text-blue-600 text-sm hover:underline font-semibold"
              >
                Refresh
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-2 mb-4 shrink-0 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-2.5 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search city or street..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <select
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm focus:outline-none focus:border-blue-500 bg-white"
                  disabled={!driverLocation}
                >
                  <option value="">Any distance</option>
                  <option value="5">Within 5 km</option>
                  <option value="10">Within 10 km</option>
                  <option value="20">Within 20 km</option>
                  <option value="50">Within 50 km</option>
                </select>
              </div>
              {!driverLocation && isOnline && (
                <p className="text-xs text-orange-500 mt-1">
                  Waiting for GPS to enable distance filter...
                </p>
              )}
            </div>

            {/* Scrollable Order List */}
            <div className="overflow-y-auto flex-1 pr-1">
              {!isOnline ? (
                <p className="text-gray-500 text-sm text-center mt-4">
                  Go online to see available orders.
                </p>
              ) : filteredAvailableOrders.length === 0 ? (
                <p className="text-gray-500 text-sm text-center mt-4">
                  {availableOrders.length > 0
                    ? "No orders match your filters."
                    : "Waiting for new orders..."}
                </p>
              ) : (
                filteredAvailableOrders.map((order) => (
                  <div
                    key={order._id}
                    className="p-3 mb-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-gray-800">
                        {order.order_id}
                      </p>
                      {order.distanceToPickup !== null && (
                        <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {order.distanceToPickup.toFixed(1)} km away
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 mb-1">
                      <b>From:</b> {order.pickup_address}
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      <b>To:</b> {order.dropoff_address}
                    </p>
                    <p className="text-sm font-semibold text-green-600 mb-3">
                      Est. Earning: LKR {order.total_cost}
                    </p>

                    <button
                      onClick={() => handleAcceptOrder(order)}
                      className="bg-black text-white font-semibold text-sm px-4 py-2 rounded-lg w-full hover:bg-gray-800 transition-colors"
                    >
                      Accept Order
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Map Component */}
        <div className="w-2/3 bg-white p-4 rounded-lg shadow-md flex flex-col relative">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Navigation className="text-blue-600" />
            Live Navigation{" "}
            {selectedOrder &&
              `- ${selectedOrder.status === "assigned" ? "To Pickup" : "To Drop-off"}`}
          </h2>

          <div className="flex-1 w-full relative z-0">
            <MapComponent
              driverLocation={driverLocation}
              selectedOrder={selectedOrder}
            />
          </div>

          {!selectedOrder && activeOrders.length > 0 && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center pointer-events-none">
              <p className="bg-black text-white px-6 py-3 rounded-full shadow-lg font-semibold pointer-events-auto">
                Select an active order to view navigation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
