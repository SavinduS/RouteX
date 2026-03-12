import React, { useEffect, useState, useRef } from 'react';
import { Bell, UserCircle, CheckCheck, Clock, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { getNotifications, markAsRead, markAllAsRead } from "../services/notificationService";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5003';

const AdminHeader = ({ toggleSidebar }) => {
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        setUser(parsedUser);

        // Socket setup
        const socket = io(SOCKET_URL);
        socketRef.current = socket;

        if (parsedUser && parsedUser.id) {
            socket.emit("join_admin_room", { user_id: parsedUser.id });
        }

        socket.on("new_notification", (newNotif) => {
            setNotifications(prev => [newNotif, ...prev].slice(0, 20));
            setUnreadCount(prev => prev + 1);
        });

        // Fetch initial notifications
        const fetchNotifications = async () => {
            try {
                const data = await getNotifications();
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.read).length);
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
            }
        };
        fetchNotifications();

        // Click outside to close dropdown
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        const sync = () => {
            const updatedUser = localStorage.getItem("user");
            const parsedUpdatedUser = updatedUser ? JSON.parse(updatedUser) : null;
            setUser(parsedUpdatedUser);
            if (parsedUpdatedUser && parsedUpdatedUser.id && socketRef.current) {
                socketRef.current.emit("join_admin_room", { user_id: parsedUpdatedUser.id });
            }
        };
        window.addEventListener("storage", sync);

        return () => {
            window.removeEventListener("storage", sync);
            socket.disconnect();
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleMarkAsRead = async (id, type) => {
        try {
            await markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            
            // Redirect based on type
            if (type === "new_entrepreneur") navigate("/admin/entrepreneurs");
            else if (type === "new_driver") navigate("/admin/couriers");
            else if (type === "new_inquiry") navigate("/admin/entrepreneurs"); 
            
            setShowNotifications(false);
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    const adminName = user?.full_name || user?.email || "Admin";

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 py-5 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Toggle */}
                <button 
                    onClick={toggleSidebar}
                    className="p-2 md:hidden text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                    <Menu size={24} />
                </button>
                
                <h1 className="text-xs md:text-sm font-black text-gray-800 uppercase tracking-[0.3em] truncate">
                    Admin Panel
                </h1>
            </div>

            {/* Right side Actions */}
            <div className="flex items-center gap-2 md:gap-6">
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-2 transition-colors relative ${showNotifications ? 'text-[#1D4ED8] bg-blue-50 rounded-xl' : 'text-gray-400 hover:text-[#1D4ED8]'}`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-72 md:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={handleMarkAllRead}
                                        className="text-[10px] font-bold text-[#1D4ED8] uppercase tracking-wider hover:underline"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            
                            <div className="max-h-[350px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400">
                                        <Bell className="mx-auto mb-2 opacity-20" size={32} />
                                        <p className="text-xs">No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <div 
                                            key={notification._id}
                                            onClick={() => handleMarkAsRead(notification._id, notification.type)}
                                            className={`p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 flex gap-3 ${!notification.read ? 'bg-blue-50/30' : ''}`}
                                        >
                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notification.read ? 'bg-[#1D4ED8]' : 'bg-transparent'}`}></div>
                                            <div className="flex-1">
                                                <p className={`text-xs ${!notification.read ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1 opacity-60">
                                                    <Clock size={10} />
                                                    <span className="text-[10px]">{formatTime(notification.createdAt)}</span>
                                                </div>
                                            </div>
                                            {notification.read && <CheckCheck size={14} className="text-gray-300" />}
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <div className="p-3 border-top border-gray-50 text-center bg-gray-50/30">
                                <button className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600">
                                    View all activity
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="h-8 w-[1px] bg-gray-100 hidden md:block"></div>

                <div 
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate('/profile')}
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-gray-800">{adminName}</p>
                        <p className="text-[9px] text-[#1D4ED8] font-bold uppercase tracking-tighter">System Admin</p>
                    </div>
                    <div className="bg-[#1D4ED8] p-2 rounded-full text-white shadow-lg shadow-blue-100 flex items-center justify-center">
                        <UserCircle size={22} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;