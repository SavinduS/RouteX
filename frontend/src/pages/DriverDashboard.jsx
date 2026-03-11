import React, { useState, useEffect } from "react";
import api from "../services/api";
import { io } from "socket.io-client";
import MapComponent from "../components/MapComponent";
import {
  MapPin,
  Package,
  CheckCircle,
  Navigation,
} from "lucide-react";

// --- Configuration ---
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

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

  const [driverLocation, setDriverLocation] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [socket, setSocket] = useState(null);

  // 1. Initialize Socket.io Connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  // 2. Persist State & Manage GeoWatcher based on Online Status
  useEffect(() => {
    if (!DRIVER_ID) return;

    localStorage.setItem("driverOnline", isOnline);
    localStorage.setItem("activeOrders", JSON.stringify(activeOrders));

    let watchId;
    if (isOnline) {
      socket?.emit("driver_go_online", { driver_id: DRIVER_ID });

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
          <div className="bg-white p-4 rounded-lg shadow-md border-t-4 border-blue-500 flex-1 overflow-y-auto">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Package className="text-blue-500" /> My Active Orders
            </h2>
            {activeOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Package size={48} className="text-gray-200 mb-2" />
                <p className="text-gray-500 text-sm">
                  No active orders right now.
                </p>
                <a 
                  href="/driver/available-orders" 
                  className="mt-4 text-blue-600 font-bold hover:underline"
                >
                  Find New Orders →
                </a>
              </div>
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
