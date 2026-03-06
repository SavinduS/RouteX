import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Clock, AlertTriangle, Eye, X, Calendar, CheckCircle, MapPin, Truck, ChevronDown } from 'lucide-react';
import API from '../services/api';

const AdminOrders = () => {
    const [activeTab, setActiveTab] = useState('active'); 
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // Active status filter
    const [timeFilter, setTimeFilter] = useState('all'); // History time filter
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchData();
        // ටැබ් එක මාරු කරද්දී ෆිල්ටර් reset කිරීම
        setStatusFilter('all');
        setTimeFilter('all');
    }, [activeTab]);

    // Combined Filtering Logic
    useEffect(() => {
        let temp = orders;

        // 1. Search Logic
        if (searchTerm) {
    temp = temp.filter(o => 
        o._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.pickup_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.user_id?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) // යූසර් නමෙන් සර්ච් කිරීම
    );
}

        // 2. Status Logic (For Active Tab only)
        if (activeTab === 'active' && statusFilter !== 'all') {
            temp = temp.filter(o => o.status === statusFilter);
        }

        // 3. Time Filtering (For History Tab only)
        if (activeTab === 'history' && timeFilter !== 'all') {
            const now = new Date();
            temp = temp.filter(o => {
                const orderDate = new Date(o.completed_at);
                if (timeFilter === 'daily') return (now - orderDate) < 24 * 60 * 60 * 1000;
                if (timeFilter === 'weekly') return (now - orderDate) < 7 * 24 * 60 * 60 * 1000;
                if (timeFilter === 'monthly') return (now - orderDate) < 30 * 24 * 60 * 60 * 1000;
                return true;
            });
        }
        setFilteredOrders(temp);
    }, [searchTerm, statusFilter, timeFilter, orders, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'active' ? '/admin/orders' : '/admin/orders/history';
            const res = await API.get(endpoint);
            if (res.data.success) {
                setOrders(res.data.data);
                setFilteredOrders(res.data.data);
            }
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    const stats = {
        total: orders.length,
        delayed: orders.filter(o => o.is_delayed).length,
        active: orders.filter(o => ['assigned', 'picked_up', 'in_transit'].includes(o.status)).length,
        delivered: orders.filter(o => o.final_status === 'delivered').length,
    };

    return (
        <div className="p-4 md:p-8 bg-[#F9FAFB] min-h-screen">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Order Management</h2>
                <div className="flex bg-gray-200 p-1 rounded-2xl shadow-inner">
                    <button onClick={() => setActiveTab('active')} className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'active' ? 'bg-white text-[#1B5E20] shadow-md' : 'text-gray-500'}`}>Active Deliveries</button>
                    <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'history' ? 'bg-white text-[#1B5E20] shadow-md' : 'text-gray-500'}`}>Delivery History</button>
                </div>
            </div>

            {/* Dynamic Stats Cards (මෙහි Delay card එකේ Pulse animation එක ඇත) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {activeTab === 'active' ? (
                    <>
                        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                            <p className="text-gray-400 text-[10px] font-bold uppercase">Total Orders</p>
                            <h3 className="text-3xl font-black">{stats.total}</h3>
                        </div>
                        <motion.div 
                            animate={stats.delayed > 0 ? { scale: [1, 1.02, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className={`p-5 rounded-3xl border shadow-sm ${stats.delayed > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}
                        >
                            <p className={`${stats.delayed > 0 ? 'text-red-600' : 'text-gray-400'} text-[10px] font-bold uppercase flex items-center gap-1`}>
                                <AlertTriangle size={14}/> {stats.delayed > 0 ? 'Delayed Alert' : 'Delayed'}
                            </p>
                            <h3 className={`text-3xl font-black ${stats.delayed > 0 ? 'text-red-600' : ''}`}>{stats.delayed}</h3>
                        </motion.div>
                        <div className="bg-blue-50 p-5 rounded-3xl border border-blue-100">
                            <p className="text-blue-600 text-[10px] font-bold uppercase">In Progress</p>
                            <h3 className="text-3xl font-black text-blue-700">{stats.active}</h3>
                        </div>
                        <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100">
                            <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest">Available</p>
                            <h3 className="text-3xl font-black text-emerald-700">{orders.filter(o=>o.status==='available').length}</h3>
                        </div>
                    </>
                ) : (
                    <div className="col-span-1 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-2xl text-green-700"><CheckCircle /></div>
                        <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase">Successful Deliveries</p>
                            <h3 className="text-3xl font-black">{stats.delivered}</h3>
                        </div>
                    </div>
                )}
            </div>

            {/* Advanced Filter Bar */}
            <div className="bg-white p-4 rounded-3xl shadow-sm mb-6 border border-gray-100 flex flex-col lg:flex-row gap-4 justify-between items-center">
                {/* 1. Search Input */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search Order ID or Pickup Address..." 
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#A5D6A7]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* 2. Dynamic Dropdowns based on Tab */}
                <div className="flex gap-4 w-full lg:w-auto">
                    {activeTab === 'active' ? (
                        <div className="flex items-center gap-3 w-full lg:w-auto">
                            <Filter size={20} className="text-gray-400" />
                            <select 
                                className="w-full lg:w-48 bg-gray-50 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#A5D6A7] font-bold text-gray-600 appearance-none cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="available">Available</option>
                                <option value="assigned">Assigned</option>
                                <option value="picked_up">Picked Up</option>
                                <option value="in_transit">In Transit</option>
                            </select>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 w-full lg:w-auto">
                            <Calendar size={20} className="text-gray-400" />
                            <select 
                                className="w-full lg:w-48 bg-gray-50 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#A5D6A7] font-bold text-gray-600 appearance-none cursor-pointer"
                                value={timeFilter}
                                onChange={(e) => setTimeFilter(e.target.value)}
                            >
                                <option value="all">All Time</option>
                                <option value="daily">Last 24 Hours</option>
                                <option value="weekly">Last 7 Days</option>
                                <option value="monthly">Last 30 Days</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            <tr>
                                <th className="p-6">Order</th>
                                <th className="p-6">Route Info</th>
                                <th className="p-6">Cost</th>
                                <th className="p-6">Status</th>
                                <th className="p-6 text-center">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredOrders.map(order => (
                                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-6">
                                        <div className="font-black text-gray-900 text-sm">#{order._id.slice(-6).toUpperCase()}</div>
                                        <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">
                                            {new Date(order.created_at || order.completed_at).toDateString()}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-start gap-2">
                                            <MapPin size={14} className="mt-1 text-gray-300" />
                                            <div>
                                                <div className="text-xs font-bold text-gray-700 truncate w-48">{order.pickup_address}</div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">To: {order.dropoff_address}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="font-black text-[#1B5E20] text-sm">LKR {order.total_cost.toFixed(2)}</div>
                                        {activeTab === 'history' && <div className="text-[9px] font-bold text-blue-500 uppercase">Profit: {order.platform_earnings}</div>}
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col gap-1.5">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-center w-28 ${
                                                (order.status === 'delivered' || order.final_status === 'delivered') ? 'bg-green-100 text-green-700' : 
                                                (order.final_status === 'cancelled') ? 'bg-red-100 text-red-700' : 'bg-[#E8F5E9] text-[#1B5E20]'
                                            }`}>
                                                {order.status || order.final_status}
                                            </span>
                                            {order.is_delayed && <span className="text-[9px] font-black text-red-500 flex items-center gap-1"><AlertTriangle size={10} /> DELAYED</span>}
                                        </div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <button 
                                            onClick={() => setSelectedOrder(order)}
                                            className="p-3 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-[#1B5E20] group-hover:text-white transition-all shadow-sm"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredOrders.length === 0 && <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest">No matching results</div>}
            </div>

            {/* Modal මෙහි පවතී (Details පෙන්වීමට)... */}
            <AnimatePresence>
                {selectedOrder && (
                   // Modal code එක කලින් වගේමයි...
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative">
                            <button onClick={() => setSelectedOrder(null)} className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X size={24}/></button>
                            <div className="bg-[#1B5E20] p-10 text-white">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Order Summary</p>
                                <h3 className="text-3xl font-black">#{selectedOrder._id.toUpperCase()}</h3>
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Vehicle</p><p className="font-bold capitalize">{selectedOrder.vehicle_type}</p></div>
                                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Size</p><p className="font-bold capitalize">{selectedOrder.package_size} Pack</p></div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center"><div className="w-3 h-3 rounded-full bg-emerald-400"></div><div className="w-0.5 h-10 bg-gray-100"></div><div className="w-3 h-3 rounded-full bg-orange-400"></div></div>
                                    <div className="space-y-6">
                                        <div><p className="text-[9px] font-black text-gray-400 uppercase">Pickup</p><p className="text-sm font-bold text-gray-700">{selectedOrder.pickup_address}</p></div>
                                        <div><p className="text-[9px] font-black text-gray-400 uppercase">Dropoff</p><p className="text-sm font-bold text-gray-700">{selectedOrder.dropoff_address}</p></div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedOrder(null)} className="w-full bg-[#1B5E20] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-[#144718] transition-all">Close Details</button>
                            </div>
                        </motion.div>
                   </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminOrders;