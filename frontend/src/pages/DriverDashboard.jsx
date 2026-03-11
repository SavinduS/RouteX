import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
    getAvailableOrders, 
    acceptOrder, 
    updateDriverLocation, 
    updateOrderStatus 
} from '../services/driverService';
import { 
    MapContainer, 
    TileLayer, 
    Marker, 
    Popup, 
    useMap 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { 
    Power, 
    CheckCircle2, 
    Package, 
    MapPin, 
    Navigation, 
    Clock, 
    Phone, 
    User, 
    ChevronRight,
    Bike,
    Car,
    Truck
} from 'lucide-react';

// Marker Icons
const driverIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854866.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

const pickupIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
});

const dropoffIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/565/565345.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
});

// Routing Machine Component
const RoutingMachine = ({ driverPos, targetPos }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map || !driverPos || !targetPos) return;

    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(driverPos[0], driverPos[1]),
        L.latLng(targetPos[0], targetPos[1])
      ],
      lineOptions: {
        styles: [{ color: '#3b82f6', weight: 4 }]
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false
    }).addTo(map);

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, driverPos, targetPos]);

  return null;
};

const DriverDashboard = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [isOnline, setIsOnline] = useState(localStorage.getItem('driver_online') === 'true');
    const [location, setLocation] = useState(null);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [error, setError] = useState(null);

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5003';

    // 1. Initialize Socket
    useEffect(() => {
        const newSocket = io(socketUrl);
        setSocket(newSocket);

        return () => newSocket.disconnect();
    }, [socketUrl]);

    // Derived: Current selected order object
    const selectedOrder = activeOrders.find(o => o._id === selectedOrderId) || (activeOrders.length > 0 ? activeOrders[0] : null);

    // 2. Persistent Location Tracking
    useEffect(() => {
        let watchId = null;

        if (isOnline && navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setLocation([latitude, longitude]);
                    
                    // Emit to socket
                    if (socket) {
                        socket.emit('driver_live_location', {
                            driver_id: user._id,
                            lat: latitude,
                            lng: longitude,
                            driver_status: activeOrders.length > 0 ? 'busy' : 'online',
                            active_order_ids: activeOrders.map(o => o._id)
                        });
                    }

                    // Update DB periodically
                    updateDriverLocation({
                        driver_id: user._id,
                        lat: latitude,
                        lng: longitude,
                        driver_status: activeOrders.length > 0 ? 'busy' : 'online',
                        active_order_ids: activeOrders.map(o => o._id)
                    }).catch(err => console.error("DB location update failed", err));
                },
                (err) => setError("Geolocation failed: " + err.message),
                { enableHighAccuracy: true }
            );
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [isOnline, socket, user._id, activeOrders]);

    // 3. Status Persistence
    useEffect(() => {
        localStorage.setItem('driver_online', isOnline);
        if (socket && user._id) {
            if (isOnline) {
                socket.emit('driver_go_online', { driver_id: user._id });
            } else {
                socket.emit('driver_go_offline', { driver_id: user._id });
            }
        }
    }, [isOnline, socket, user._id]);

    // 4. Fetch Available Orders
    const fetchOrders = useCallback(async () => {
        if (!isOnline) return;
        try {
            const res = await getAvailableOrders(user.vehicle_type || 'bike');
            if (res.success) {
                setAvailableOrders(res.data);
            }
        } catch (err) {
            console.error("Fetch orders failed", err);
        } finally {
            setLoading(false);
        }
    }, [isOnline, user.vehicle_type]);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [fetchOrders]);

    // 5. Check for active orders on load
    useEffect(() => {
        const checkActiveOrders = async () => {
            const savedOrders = localStorage.getItem('active_orders');
            if (savedOrders) {
                const parsed = JSON.parse(savedOrders);
                setActiveOrders(parsed);
                if (parsed.length > 0) setSelectedOrderId(parsed[0]._id);
            }
        };
        checkActiveOrders();
    }, []);

    const handleToggleStatus = () => {
        setIsOnline(prev => !prev);
    };

    const handleAcceptOrder = async (orderId) => {
        try {
            setLoading(true);
            const res = await acceptOrder({ order_id: orderId, driver_id: user._id });
            if (res.success) {
                const newOrders = [...activeOrders, res.data];
                setActiveOrders(newOrders);
                setSelectedOrderId(res.data._id);
                localStorage.setItem('active_orders', JSON.stringify(newOrders));
                fetchOrders();
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to accept order");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, status) => {
        try {
            const res = await updateOrderStatus({ order_id: orderId, status });
            if (res.success) {
                if (status === 'delivered') {
                    const filtered = activeOrders.filter(o => o._id !== orderId);
                    setActiveOrders(filtered);
                    localStorage.setItem('active_orders', JSON.stringify(filtered));
                    if (selectedOrderId === orderId) {
                        setSelectedOrderId(filtered.length > 0 ? filtered[0]._id : null);
                    }
                    fetchOrders();
                } else {
                    const updated = activeOrders.map(o => o._id === orderId ? { ...o, status } : o);
                    setActiveOrders(updated);
                    localStorage.setItem('active_orders', JSON.stringify(updated));
                }
            }
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const getVehicleIcon = (type) => {
        switch(type) {
            case 'bike': return <Bike size={18} />;
            case 'car': return <Car size={18} />;
            case 'truck': return <Truck size={18} />;
            default: return <Bike size={18} />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${isOnline ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                        <User size={32} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{user.full_name}</h1>
                        <p className="text-gray-500 flex items-center gap-1">
                            {getVehicleIcon(user.vehicle_type)}
                            <span className="capitalize">{user.vehicle_type} Driver</span>
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleToggleStatus}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg ${
                        isOnline 
                        ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-200' 
                        : 'bg-green-500 text-white hover:bg-green-600 shadow-green-200'
                    }`}
                >
                    <Power size={20} />
                    {isOnline ? 'Go Offline' : 'Go Online'}
                </button>
            </div>

            {isOnline ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Side: Orders */}
                    <div className="lg:col-span-5 space-y-6">
                        
                        {/* Assigned Orders Section */}
                        <div className="space-y-4">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                                <Package size={22} className="text-blue-500" />
                                Assigned Orders
                                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                                    {activeOrders.length}
                                </span>
                            </h2>
                            
                            {activeOrders.length > 0 ? (
                                <div className="space-y-3">
                                    {activeOrders.map(order => (
                                        <div 
                                            key={order._id} 
                                            onClick={() => setSelectedOrderId(order._id)}
                                            className={`cursor-pointer transition-all duration-300 rounded-3xl overflow-hidden border-2 ${
                                                selectedOrderId === order._id ? 'border-blue-500 shadow-md scale-[1.02]' : 'border-transparent bg-white shadow-sm'
                                            }`}
                                        >
                                            <div className={`${selectedOrderId === order._id ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-700'} p-3 px-5 flex justify-between items-center`}>
                                                <span className="font-mono text-xs font-bold">{order.order_id}</span>
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${selectedOrderId === order._id ? 'bg-white/20' : 'bg-gray-200'}`}>
                                                    {order.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <div className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <MapPin size={14} className="text-green-500" />
                                                        <span className="truncate max-w-[150px]">{order.pickup_address}</span>
                                                    </div>
                                                    <ChevronRight size={16} className="text-gray-300" />
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <Navigation size={14} className="text-red-500" />
                                                        <span className="truncate max-w-[150px]">{order.dropoff_address}</span>
                                                    </div>
                                                </div>

                                                {selectedOrderId === order._id && (
                                                    <div className="pt-3 border-t border-gray-100 flex gap-2">
                                                        {order.status === 'assigned' && (
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order._id, 'picked_up'); }}
                                                                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                                                            >
                                                                Confirm Pickup
                                                            </button>
                                                        )}
                                                        {order.status === 'picked_up' && (
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order._id, 'delivered'); }}
                                                                className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-100"
                                                            >
                                                                Mark Delivered
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-dashed border-gray-200 text-center space-y-3">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                        <Package size={32} />
                                    </div>
                                    <h3 className="font-bold text-gray-400">No assigned orders</h3>
                                    <p className="text-sm text-gray-400">Available orders will appear below</p>
                                </div>
                            )}
                        </div>

                        {/* Available Orders Section */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                    Available Orders 
                                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                                        {availableOrders.length}
                                    </span>
                                </h2>
                                <button 
                                    onClick={fetchOrders}
                                    className="text-blue-500 text-xs font-bold hover:underline"
                                >
                                    Refresh
                                </button>
                            </div>

                            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                                {availableOrders.length > 0 ? (
                                    availableOrders.map(order => (
                                        <div key={order._id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all group">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md uppercase mb-1 inline-block">
                                                        {order.vehicle_type}
                                                    </span>
                                                    <h4 className="font-bold text-gray-800">{order.package_size.charAt(0).toUpperCase() + order.package_size.slice(1)} Package</h4>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">LKR {order.total_cost}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">{order.distance_km} km</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <MapPin size={14} className="text-green-500" />
                                                    <span className="truncate">{order.pickup_address}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Navigation size={14} className="text-red-500" />
                                                    <span className="truncate">{order.dropoff_address}</span>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => handleAcceptOrder(order._id)}
                                                className="w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white group-hover:shadow-lg group-hover:shadow-blue-100"
                                            >
                                                Accept Order
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-gray-400 text-sm">Searching for nearby orders...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Map & Navigation */}
                    <div className="lg:col-span-7 h-[600px] lg:h-auto min-h-[500px] bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                        {location ? (
                            <MapContainer center={location} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                
                                {/* Driver Marker */}
                                <Marker position={location} icon={driverIcon}>
                                    <Popup>You are here</Popup>
                                </Marker>

                                {/* Navigation Logic */}
                                {selectedOrder && (
                                    <>
                                        {selectedOrder.status === 'assigned' && (
                                            <>
                                                <Marker position={[selectedOrder.pickup_lat, selectedOrder.pickup_lng]} icon={pickupIcon}>
                                                    <Popup>Pickup Location</Popup>
                                                </Marker>
                                                <RoutingMachine driverPos={location} targetPos={[selectedOrder.pickup_lat, selectedOrder.pickup_lng]} />
                                            </>
                                        )}
                                        {selectedOrder.status === 'picked_up' && (
                                            <>
                                                <Marker position={[selectedOrder.dropoff_lat, selectedOrder.dropoff_lng]} icon={dropoffIcon}>
                                                    <Popup>Drop-off Location</Popup>
                                                </Marker>
                                                <RoutingMachine driverPos={location} targetPos={[selectedOrder.dropoff_lat, selectedOrder.dropoff_lng]} />
                                            </>
                                        )}
                                    </>
                                )}
                            </MapContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center space-y-4 bg-gray-50">
                                <div className="animate-pulse bg-blue-100 p-4 rounded-full text-blue-500">
                                    <Navigation size={48} />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-gray-600">Waiting for GPS</h3>
                                    <p className="text-sm text-gray-400 px-10">Please allow location access to see the map and navigate</p>
                                </div>
                            </div>
                        )}

                        {/* Map Overlay Info */}
                        {selectedOrder && location && (
                            <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none">
                                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white max-w-sm pointer-events-auto">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Navigating Order: {selectedOrder.order_id}</p>
                                        <span className="bg-blue-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Live</span>
                                    </div>
                                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                        <MapPin size={16} className={selectedOrder.status === 'assigned' ? 'text-green-500' : 'text-red-500'} />
                                        {selectedOrder.status === 'assigned' ? 'Pickup Point' : 'Destination'}
                                    </h4>
                                    <p className="text-xs text-gray-600 mt-1 truncate">
                                        {selectedOrder.status === 'assigned' ? selectedOrder.pickup_address : selectedOrder.dropoff_address}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-[40px] p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-6 text-center">
                    <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                        <Power size={64} />
                    </div>
                    <div className="max-w-md space-y-2">
                        <h2 className="text-3xl font-black text-gray-800 italic uppercase">You are Offline</h2>
                        <p className="text-gray-500">Switch to online to start receiving orders and tracking your earnings in real-time.</p>
                    </div>
                    <button
                        onClick={handleToggleStatus}
                        className="bg-green-500 text-white px-12 py-5 rounded-3xl font-black shadow-2xl shadow-green-200 hover:bg-green-600 transition-all hover:scale-105 uppercase tracking-widest"
                    >
                        Go Online Now
                    </button>
                </div>
            )}
        </div>
    );
};

export default DriverDashboard;
