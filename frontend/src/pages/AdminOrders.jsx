import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Clock, CheckCircle, Truck, AlertTriangle, ChevronRight } from 'lucide-react';
import API from '../services/api';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    // Logic to filter orders based on Search and Status
    useEffect(() => {
        let tempOrders = orders;

        if (statusFilter !== 'all') {
            tempOrders = tempOrders.filter(order => order.status === statusFilter);
        }

        if (searchTerm) {
            tempOrders = tempOrders.filter(order => 
                order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.pickup_address.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredOrders(tempOrders);
    }, [searchTerm, statusFilter, orders]);

    const fetchOrders = async () => {
        try {
            const res = await API.get('/admin/orders');
            if (res.data.success) {
                setOrders(res.data.data);
                setFilteredOrders(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching orders", err);
        } finally {
            setLoading(false);
        }
    };

    // Summary Stats Logic
    const stats = {
        total: orders.length,
        delayed: orders.filter(o => o.is_delayed).length,
        active: orders.filter(o => ['assigned', 'picked_up', 'in_transit'].includes(o.status)).length,
        available: orders.filter(o => o.status === 'available').length
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'bg-blue-100 text-blue-700';
            case 'assigned': return 'bg-yellow-100 text-yellow-700';
            case 'in_transit': return 'bg-purple-100 text-purple-700';
            case 'delivered': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) return <div className="p-10 text-center font-bold">Loading Orders...</div>;

    return (
        <div className="p-4 md:p-8 bg-[#F9FAFB] min-h-screen">
            {/* Header & Stats */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Orders Management</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-400 text-xs font-bold uppercase">Total Orders</p>
                        <h3 className="text-2xl font-bold">{stats.total}</h3>
                    </div>
                    <div className="bg-red-50 p-4 rounded-2xl shadow-sm border border-red-100">
                        <p className="text-red-400 text-xs font-bold uppercase flex items-center gap-1">
                           <AlertTriangle size={12}/> Delayed
                        </p>
                        <h3 className="text-2xl font-bold text-red-700">{stats.delayed}</h3>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl shadow-sm border border-blue-100">
                        <p className="text-blue-400 text-xs font-bold uppercase">Active</p>
                        <h3 className="text-2xl font-bold text-blue-700">{stats.active}</h3>
                    </div>
                    <div className="bg-green-50 p-4 rounded-2xl shadow-sm border border-green-100">
                        <p className="text-green-400 text-xs font-bold uppercase">Available</p>
                        <h3 className="text-2xl font-bold text-green-700">{stats.available}</h3>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between border border-gray-100">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by Order ID or Address..." 
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-[#A5D6A7]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter size={18} className="text-gray-400" />
                    <select 
                        className="bg-gray-50 border-none rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#A5D6A7] text-gray-600"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="available">Available</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                <th className="p-4">Order Details</th>
                                <th className="p-4">Route</th>
                                <th className="p-4">Vehicle/Size</th>
                                <th className="p-4">Cost</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <motion.tr 
                                    key={order._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                                >
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800 text-sm">#{order._id.slice(-6)}</div>
                                        <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                                            <Clock size={10} /> {new Date(order.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm font-medium text-gray-700 truncate w-48">{order.pickup_address}</div>
                                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                            <ChevronRight size={10} /> {order.dropoff_address}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm capitalize font-bold text-gray-700">{order.vehicle_type}</span>
                                            <span className="text-[10px] uppercase text-gray-400">{order.package_size} Pack</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-[#1B5E20]">
                                        Rs. {order.total_cost.toFixed(2)}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase text-center w-24 ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                            {order.is_delayed && (
                                                <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                                                    <AlertTriangle size={10} /> DELAYED
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button className="text-gray-400 hover:text-[#1B5E20] transition-colors p-2 hover:bg-[#F0FDF4] rounded-full">
                                            <ChevronRight size={20} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredOrders.length === 0 && (
                    <div className="p-10 text-center text-gray-400 font-medium">No orders found matching your criteria.</div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;