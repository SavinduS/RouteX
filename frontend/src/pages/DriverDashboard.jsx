import React, { useState, useEffect } from "react";
import api from "../services/api";
import { io } from "socket.io-client";
import MapComponent from "../components/MapComponent";
import {
  MapPin,
  Package,
  CheckCircle,
  Navigation,
  PowerOff,
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

  const handleToggleOnline = () => {
    if (isOnline && activeOrders.length > 0) {
      alert("Please complete all active orders before going offline.");
      return;
    }
    setIsOnline(!isOnline);
  };

  if (!user) {
    return (
      <div className="p-10 text-center">
        Please log in to access the dashboard.
      </div>
    );
  }

  const selectedOrder = activeOrders.find((o) => o._id === selectedOrderId);
  const hasActiveOrders = activeOrders.length > 0;

  return (
    <div className="flex flex-col h-screen bg-[#F1F5F9] p-4 font-sans text-slate-800">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-4 border border-slate-200 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-[#1D4ED8]">Driver Dashboard</h1>
          <p className="text-sm font-medium text-slate-500">
            Status:{" "}
            {isOnline ? (
              <span className="text-[#06B6D4] font-bold">Online & Active</span>
            ) : (
              <span className="text-slate-400 font-semibold">Offline</span>
            )}
          </p>
        </div>

        <button
          onClick={handleToggleOnline}
          className={`px-8 py-3 rounded-full font-bold text-white transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 ${
            !isOnline
              ? "bg-[#06B6D4] hover:bg-cyan-600"
              : hasActiveOrders
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-rose-500 hover:bg-rose-600"
          }`}
        >
          <PowerOff size={18} />
          {!isOnline ? "Go Online (Start Shift)" : "Go Offline"}
        </button>
      </div>

      {/* Conditional UI based on Online Status */}
      {!isOnline ? (
        /* --- OFFLINE STATE UI --- */
        <div className="flex flex-1 items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="text-center p-8 max-w-md">
            <div className="w-32 h-32 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-6">
              <PowerOff size={64} className="text-slate-300" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">
              You are offline
            </h2>
            <p className="text-slate-500 mb-8">
              Your location is hidden and you won't receive new orders. Start your shift to begin earning.
            </p>
            <button
              onClick={handleToggleOnline}
              className="bg-[#1D4ED8] hover:bg-blue-800 text-white font-black py-4 px-10 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto text-lg"
            >
              <PowerOff size={24} />
              Tap to Start Shift
            </button>
          </div>
        </div>
      ) : (
        /* --- ONLINE STATE UI (Map & Orders) --- */
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-1/3 flex flex-col gap-4 overflow-hidden">
            {/* Active Orders Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-[#1D4ED8] flex-1 overflow-y-auto border-x border-b border-slate-200">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                <Package className="text-[#1D4ED8]" /> My Active Orders
              </h2>
              {activeOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <Package size={48} className="text-slate-200 mb-2" />
                  <p className="text-slate-400 text-sm font-medium">
                    No active orders right now.
                  </p>
                  <a
                    href="/driver/available-orders"
                    className="mt-4 bg-[#06B6D4] text-white font-bold px-6 py-2 rounded-lg hover:bg-cyan-600 transition-colors shadow-sm"
                  >
                    Find New Orders
                  </a>
                </div>
              ) : (
                activeOrders.map((order) => (
                  <div
                    key={order._id}
                    className={`p-4 mb-4 border-2 rounded-xl cursor-pointer transition-all shadow-sm ${
                      selectedOrderId === order._id
                        ? "border-[#1D4ED8] bg-blue-50/50"
                        : "border-slate-50 bg-white hover:border-slate-200"
                    }`}
                    onClick={() => setSelectedOrderId(order._id)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-black text-slate-900">#{order.order_id}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1D4ED8] text-white font-bold uppercase">
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <span className="font-bold text-slate-800">Route:</span>{" "}
                      {order.pickup_address} → {order.dropoff_address}
                    </p>

                    <div className="mt-4 flex gap-2">
                      {order.status === "assigned" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(order._id, "picked_up");
                          }}
                          className="bg-[#06B6D4] hover:bg-cyan-600 text-white text-xs px-4 py-2.5 rounded-lg w-full flex justify-center items-center gap-2 font-bold shadow-sm transition-all active:scale-95"
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
                          className="bg-[#1D4ED8] hover:bg-blue-800 text-white text-xs px-4 py-2.5 rounded-lg w-full flex justify-center items-center gap-2 font-bold shadow-sm transition-all active:scale-95"
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
          <div className="w-2/3 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col relative">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-slate-800">
              <Navigation className="text-[#1D4ED8]" />
              Live Navigation{" "}
              {selectedOrder &&
                `- ${selectedOrder.status === "assigned" ? "To Pickup" : "To Drop-off"}`}
            </h2>

            <div className="flex-1 w-full relative z-0 rounded-lg overflow-hidden border border-slate-100">
              <MapComponent
                driverLocation={driverLocation}
                selectedOrder={selectedOrder}
              />
            </div>

            {!selectedOrder && activeOrders.length > 0 && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center pointer-events-none">
                <p className="bg-[#1D4ED8] text-white px-8 py-3 rounded-full shadow-2xl font-bold pointer-events-auto scale-110">
                  Select an active order to view navigation
                </p>
              </div>
            )}

            {!selectedOrder && activeOrders.length === 0 && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center pointer-events-none">
                <p className="bg-slate-800/90 text-white px-8 py-3 rounded-full shadow-2xl font-bold pointer-events-auto">
                  Accept an order to start routing
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
