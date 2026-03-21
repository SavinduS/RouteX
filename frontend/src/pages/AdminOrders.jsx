import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Clock, AlertTriangle, Eye, X, Calendar, CheckCircle, MapPin, Truck, ChevronDown, User, DollarSign, Package } from 'lucide-react';
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
                (o.order_id && o.order_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (o.readable_order_id && o.readable_order_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
                o._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                o.pickup_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.user_id?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
                const orderDate = new Date(o.completed_at || o.created_at);
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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    };

    return (
        <div className="p-4 md:p-8 bg-[#F1F5F9] min-h-screen">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Order Management</h2>
                <div className="flex bg-gray-200 p-1 rounded-2xl shadow-inner w-full md:w-auto">
                    <button onClick={() => setActiveTab('active')} className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-xl font-bold text-xs md:text-sm transition-all ${activeTab === 'active' ? 'bg-white text-[#1D4ED8] shadow-md' : 'text-gray-500'}`}>Active</button>
                    <button onClick={() => setActiveTab('history')} className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-xl font-bold text-xs md:text-sm transition-all ${activeTab === 'history' ? 'bg-white text-[#1D4ED8] shadow-md' : 'text-gray-500'}`}>History</button>
                </div>
            </div>

            {/* Dynamic Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
                {activeTab === 'active' ? (
                    <>
                        <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
                            <p className="text-gray-400 text-[8px] md:text-[10px] font-bold uppercase">Total</p>
                            <h3 className="text-xl md:text-3xl font-black">{stats.total}</h3>
                        </div>
                        <motion.div 
                            animate={stats.delayed > 0 ? { scale: [1, 1.02, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className={`p-4 md:p-5 rounded-2xl md:rounded-3xl border shadow-sm ${stats.delayed > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}
                        >
                            <p className={`${stats.delayed > 0 ? 'text-red-600' : 'text-gray-400'} text-[8px] md:text-[10px] font-bold uppercase flex items-center gap-1`}>
                                <AlertTriangle size={12}/> {stats.delayed > 0 ? 'Delayed' : 'Delayed'}
                            </p>
                            <h3 className={`text-xl md:text-3xl font-black ${stats.delayed > 0 ? 'text-red-600' : ''}`}>{stats.delayed}</h3>
                        </motion.div>
                        <div className="bg-blue-50 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-blue-100">
                            <p className="text-blue-600 text-[8px] md:text-[10px] font-bold uppercase">Progress</p>
                            <h3 className="text-xl md:text-3xl font-black text-blue-700">{stats.active}</h3>
                        </div>
                        <div className="bg-cyan-50 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-cyan-100">
                            <p className="text-cyan-600 text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Available</p>
                            <h3 className="text-xl md:text-3xl font-black text-cyan-700">{orders.filter(o=>o.status==='available').length}</h3>
                        </div>
                    </>
                ) : (
                    <div className="col-span-2 bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="bg-blue-100 p-2 md:p-3 rounded-xl md:rounded-2xl text-blue-700"><CheckCircle size={20} /></div>
                        <div>
                            <p className="text-gray-400 text-[8px] md:text-[10px] font-bold uppercase">Successful Deliveries</p>
                            <h3 className="text-xl md:text-3xl font-black">{stats.delivered}</h3>
                        </div>
                    </div>
                )}
            </div>

            {/* Advanced Filter Bar */}
            <div className="bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-sm mb-6 border border-gray-100 flex flex-col gap-3 md:gap-4 lg:flex-row justify-between items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search ID or Address..." 
                        className="w-full pl-11 pr-4 py-2.5 md:py-3 bg-gray-50 border-none rounded-xl md:rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#06B6D4]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 w-full lg:w-auto">
                    {activeTab === 'active' ? (
                        <div className="flex items-center gap-2 flex-1 lg:flex-none">
                            <Filter size={18} className="text-gray-400 hidden sm:block" />
                            <select 
                                className="w-full lg:w-48 bg-gray-50 border-none rounded-xl md:rounded-2xl px-4 py-2.5 md:py-3 outline-none focus:ring-2 focus:ring-[#06B6D4] font-bold text-gray-600 text-xs md:text-sm appearance-none cursor-pointer"
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
                        <div className="flex items-center gap-2 flex-1 lg:flex-none">
                            <Calendar size={18} className="text-gray-400 hidden sm:block" />
                            <select 
                                className="w-full lg:w-48 bg-gray-50 border-none rounded-xl md:rounded-2xl px-4 py-2.5 md:py-3 outline-none focus:ring-2 focus:ring-[#06B6D4] font-bold text-gray-600 text-xs md:text-sm appearance-none cursor-pointer"
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
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left min-w-[800px] lg:min-w-0">
                        <thead className="bg-gray-50 text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                            <tr>
                                <th className="p-4 md:p-6">Order</th>
                                <th className="p-4 md:p-6">Route Info</th>
                                <th className="p-4 md:p-6">Cost</th>
                                <th className="p-4 md:p-6">Status</th>
                                <th className="p-4 md:p-6 text-center">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredOrders.map(order => (
                                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-4 md:p-6">
                                        <div className="font-black text-gray-900 text-xs md:text-sm">#{order.readable_order_id || order.order_id || order._id.slice(-6)}</div>
                                        <div className="text-[8px] md:text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">
                                            {new Date(order.created_at || order.completed_at).toDateString()}
                                        </div>
                                    </td>
                                    <td className="p-4 md:p-6">
                                        <div className="flex items-start gap-2">
                                            <MapPin size={14} className="mt-1 text-gray-300" />
                                            <div>
                                                <div className="text-[10px] md:text-xs font-bold text-gray-700 truncate w-32 md:w-48">{order.pickup_address}</div>
                                                <div className="text-[8px] md:text-[10px] text-gray-400 mt-0.5">To: {order.dropoff_address}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 md:p-6">
                                        <div className="font-black text-[#1D4ED8] text-xs md:text-sm">LKR {order.total_cost.toFixed(2)}</div>
                                        {activeTab === 'history' && <div className="text-[8px] md:text-[9px] font-bold text-blue-500 uppercase">Profit: {order.platform_earnings}</div>}
                                    </td>
                                    <td className="p-4 md:p-6">
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-3 md:px-4 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest text-center w-24 md:w-28 ${
                                                (order.status === 'delivered' || order.final_status === 'delivered') ? 'bg-blue-100 text-blue-700' : 
                                                (order.final_status === 'cancelled') ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-[#1D4ED8]'
                                            }`}>
                                                {order.status || order.final_status}
                                            </span>
                                            {order.is_delayed && <span className="text-[8px] md:text-[9px] font-black text-red-500 flex items-center gap-1"><AlertTriangle size={10} /> DELAYED</span>}
                                        </div>
                                    </td>
                                    <td className="p-4 md:p-6 text-center">
                                        <button 
                                            onClick={() => setSelectedOrder(order)}
                                            className="p-2 md:p-3 bg-gray-50 text-gray-400 rounded-xl md:rounded-2xl hover:bg-[#1D4ED8] hover:text-white transition-all shadow-sm border border-transparent"
                                        >
                                            <Eye size={16} md:size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredOrders.length === 0 && <div className="p-10 md:p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs md:text-sm">No matching results</div>}
            </div>

            {/* Detailed History Modal */}
            <AnimatePresence>
                {selectedOrder && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white w-full max-w-2xl rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden relative">
                            <button onClick={() => setSelectedOrder(null)} className="absolute right-4 top-4 md:right-6 md:top-6 p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors z-10"><X size={20} md:size={24}/></button>
                            
                            <div className="bg-[#1D4ED8] p-6 md:p-10 text-white">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1 md:mb-2">Reference</p>
                                        <h3 className="text-xl md:text-3xl font-black">#{selectedOrder.readable_order_id || selectedOrder.order_id || selectedOrder._id.slice(-6)}</h3>
                                    </div>
                                    <div className="bg-white/20 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl backdrop-blur-md">
                                        <p className="text-[8px] md:text-[10px] font-black uppercase opacity-60">Status</p>
                                        <p className="text-xs md:font-bold capitalize">{selectedOrder.status || selectedOrder.final_status}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-h-[60vh] md:max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {/* Customer & Courier Info */}
                                <div className="space-y-4 md:space-y-6">
                                    <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100">
                                        <div className="p-2 md:p-3 bg-blue-100 text-[#1D4ED8] rounded-lg md:rounded-xl"><User size={18} md:size={20}/></div>
                                        <div>
                                            <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase">Entrepreneur</p>
                                            <p className="text-xs md:text-sm font-bold text-gray-700">{selectedOrder.user_id?.full_name || 'Business Partner'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100">
                                        <div className="p-2 md:p-3 bg-cyan-100 text-[#06B6D4] rounded-lg md:rounded-xl"><Truck size={18} md:size={20}/></div>
                                        <div>
                                            <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase">Courier Info</p>
                                            <p className="text-xs md:text-sm font-bold text-gray-700">{selectedOrder.driver_id?.full_name || 'Assigning Courier...'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-orange-50 rounded-xl md:rounded-2xl border border-orange-100">
                                        <div className="p-2 md:p-3 bg-orange-100 text-orange-600 rounded-lg md:rounded-xl"><Package size={18} md:size={20}/></div>
                                        <div>
                                            <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase">Package details</p>
                                            <p className="text-xs md:text-sm font-bold text-gray-700 capitalize">{selectedOrder.package_size} Pack • {selectedOrder.vehicle_type}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Financials & Timestamps */}
                                <div className="space-y-4 md:space-y-6">
                                    <div className="p-4 md:p-6 bg-blue-50 rounded-[1.5rem] md:rounded-[2rem] border border-blue-100">
                                        <div className="flex items-center gap-2 mb-3 md:mb-4 text-[#1D4ED8]">
                                            <DollarSign size={16} md:size={18}/>
                                            <h4 className="font-black text-[10px] md:text-xs uppercase tracking-widest">Financials</h4>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs md:text-sm">
                                                <span className="text-gray-500">Gross Fare</span>
                                                <span className="font-bold">LKR {selectedOrder.total_cost.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs md:text-sm">
                                                <span className="text-gray-500">Profit</span>
                                                <span className="font-bold text-blue-600">LKR {selectedOrder.platform_earnings || '0.00'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 md:space-y-4">
                                        <div className="flex gap-3 md:gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-blue-400"></div>
                                                <div className="w-0.5 h-10 md:h-12 bg-gray-100"></div>
                                                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-cyan-400"></div>
                                            </div>
                                            <div className="space-y-3 md:space-y-4">
                                                <div>
                                                    <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase">Pickup</p>
                                                    <p className="text-[10px] md:text-xs font-bold text-gray-700 leading-tight">{selectedOrder.pickup_address}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase">Dropoff</p>
                                                    <p className="text-[10px] md:text-xs font-bold text-gray-700 leading-tight">{selectedOrder.dropoff_address}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order History Timeline */}
                                <div className="col-span-1 md:col-span-2 pt-4 md:pt-6 border-t border-gray-100">
                                    <h4 className="font-black text-[10px] md:text-xs uppercase tracking-widest text-gray-400 mb-3 md:mb-4 flex items-center gap-2">
                                        <Clock size={14}/> Delivery Timeline
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                                        <div className="bg-gray-50 p-3 md:p-4 rounded-xl md:rounded-2xl">
                                            <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase">Placed</p>
                                            <p className="text-[10px] md:text-xs font-bold">{formatDate(selectedOrder.created_at)}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 md:p-4 rounded-xl md:rounded-2xl">
                                            <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase">Closed</p>
                                            <p className="text-[10px] md:text-xs font-bold">{formatDate(selectedOrder.completed_at || selectedOrder.updated_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 bg-gray-50 flex gap-4">
                                <button onClick={() => setSelectedOrder(null)} className="flex-1 bg-[#1D4ED8] text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-800 transition-all">
                                    Close Details
                                </button>
                            </div>
                        </motion.div>
                   </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminOrders;