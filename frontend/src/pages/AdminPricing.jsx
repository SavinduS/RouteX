import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bike, Truck, Car, Info, Edit2, Save, X, CheckCircle, Percent, Package } from 'lucide-react';
import API from '../services/api';

const AdminPricing = () => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({
        base_fare: 0,
        per_km_rate: 0,
        small_multiplier: 1,
        medium_multiplier: 1.2,
        large_multiplier: 1.5,
        driver_cut_percent: 80,
        platform_cut_percent: 20
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const res = await API.get('/admin/rules');
            if (res.data.success) setRules(res.data.data);
        } catch (err) {
            console.error("Error fetching rules", err);
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (rule) => {
        setEditingId(rule._id);
        setEditData({
            base_fare: rule.base_fare,
            per_km_rate: rule.per_km_rate,
            small_multiplier: rule.small_multiplier,
            medium_multiplier: rule.medium_multiplier,
            large_multiplier: rule.large_multiplier,
            driver_cut_percent: rule.driver_cut_percent,
            platform_cut_percent: rule.platform_cut_percent
        });
    };

    const handleUpdate = async (id) => {
        try {
            const res = await API.put(`/admin/rules/${id}`, editData);
            if (res.data.success) {
                setEditingId(null);
                setMessage("Updated successfully!");
                fetchRules();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            alert("Failed to update rules");
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'bike': return <Bike className="text-[#1D4ED8]" size={28} md:size={32} />;
            case 'tuktuk': return <Info className="text-[#1D4ED8]" size={28} md:size={32} />;
            case 'van': return <Car className="text-[#1D4ED8]" size={28} md:size={32} />;
            case 'truck': return <Truck className="text-[#1D4ED8]" size={28} md:size={32} />;
            default: return <Bike className="text-[#1D4ED8]" size={28} md:size={32} />;
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-[#1D4ED8]">Syncing...</div>;

    return (
        <div className="p-4 md:p-8 bg-[#F1F5F9] min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Business Rules</h2>
                    <p className="text-sm md:text-base text-gray-500">Control rates and revenue shares</p>
                </div>
                <AnimatePresence>
                    {message && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="bg-[#06B6D4] text-[#1D4ED8] px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-xs md:text-sm">
                            <CheckCircle size={18} /> {message}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-8">
                {rules.map((rule) => (
                    <motion.div 
                        key={rule._id} 
                        layout
                        className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 overflow-hidden"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="bg-blue-50 p-3 md:p-4 rounded-xl md:rounded-2xl">
                                    {getIcon(rule.vehicle_type)}
                                </div>
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold capitalize">{rule.vehicle_type}</h3>
                                    <p className="text-[10px] text-gray-400">Rule #{rule._id.slice(-6).toUpperCase()}</p>
                                </div>
                            </div>
                            {editingId !== rule._id && (
                                <button onClick={() => startEditing(rule)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-[#1D4ED8]">
                                    <Edit2 size={20} />
                                </button>
                            )}
                        </div>

                        {editingId === rule._id ? (
                            <div className="space-y-4 md:space-y-6">
                                <div className="grid grid-cols-2 gap-3 md:gap-4 bg-gray-50 p-3 md:p-4 rounded-xl md:rounded-2xl">
                                    <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Core Rates</div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500">Base (LKR)</label>
                                        <input type="number" className="w-full mt-1 p-2 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-[#06B6D4] text-sm" value={editData.base_fare} onChange={(e) => setEditData({...editData, base_fare: Number(e.target.value)})} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500">Per KM (LKR)</label>
                                        <input type="number" className="w-full mt-1 p-2 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-[#06B6D4] text-sm" value={editData.per_km_rate} onChange={(e) => setEditData({...editData, per_km_rate: Number(e.target.value)})} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 md:gap-4 bg-gray-50 p-3 md:p-4 rounded-xl md:rounded-2xl">
                                    <div className="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                                        <Package size={14}/> Size Multipliers
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500">S</label>
                                        <input type="number" step="0.1" className="w-full mt-1 p-2 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-[#06B6D4] text-sm" value={editData.small_multiplier} onChange={(e) => setEditData({...editData, small_multiplier: Number(e.target.value)})} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500">M</label>
                                        <input type="number" step="0.1" className="w-full mt-1 p-2 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-[#06B6D4] text-sm" value={editData.medium_multiplier} onChange={(e) => setEditData({...editData, medium_multiplier: Number(e.target.value)})} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500">L</label>
                                        <input type="number" step="0.1" className="w-full mt-1 p-2 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-[#06B6D4] text-sm" value={editData.large_multiplier} onChange={(e) => setEditData({...editData, large_multiplier: Number(e.target.value)})} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 md:gap-4 bg-blue-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-blue-100">
                                    <div className="col-span-2 text-[10px] font-bold text-[#1D4ED8] uppercase tracking-wider mb-1 flex items-center gap-2">
                                        <Percent size={14}/> Revenue Share (%)
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-600">Driver</label>
                                        <input type="number" className="w-full mt-1 p-2 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-[#1D4ED8] text-sm" value={editData.driver_cut_percent} onChange={(e) => setEditData({...editData, driver_cut_percent: Number(e.target.value)})} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-600">Admin</label>
                                        <input type="number" className="w-full mt-1 p-2 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-[#1D4ED8] text-sm" value={editData.platform_cut_percent} onChange={(e) => setEditData({...editData, platform_cut_percent: Number(e.target.value)})} />
                                    </div>
                                </div>

                                <div className="flex gap-2 md:gap-3">
                                    <button onClick={() => handleUpdate(rule._id)} className="flex-1 bg-[#1D4ED8] text-white py-3 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-blue-800 transition-all">
                                        <Save size={18} /> Save
                                    </button>
                                    <button onClick={() => setEditingId(null)} className="px-4 md:px-6 bg-white border border-gray-200 text-gray-500 rounded-xl md:rounded-2xl hover:bg-gray-50 transition-all text-xs md:text-sm">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-y-4 md:gap-y-6">
                                <div className="border-r border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Base Rates</p>
                                    <div className="text-xs md:text-sm text-gray-600">Base: <span className="font-bold text-gray-900">Rs.{rule.base_fare}</span></div>
                                    <div className="text-xs md:text-sm text-gray-600">KM: <span className="font-bold text-gray-900">Rs.{rule.per_km_rate}</span></div>
                                </div>
                                <div className="pl-4 md:pl-6">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Revenue Split</p>
                                    <div className="text-xs md:text-sm text-gray-600">Driver: <span className="font-bold text-blue-600">{rule.driver_cut_percent}%</span></div>
                                    <div className="text-xs md:text-sm text-gray-600">Admin: <span className="font-bold text-blue-600">{rule.platform_cut_percent}%</span></div>
                                </div>
                                <div className="col-span-2 bg-gray-50 p-3 md:p-4 rounded-xl md:rounded-2xl mt-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Multipliers</p>
                                    <div className="flex justify-between px-2">
                                        <div className="text-center"><p className="text-[8px] md:text-[10px] text-gray-400 uppercase">S</p><p className="font-bold text-xs md:text-sm">x{rule.small_multiplier}</p></div>
                                        <div className="text-center"><p className="text-[8px] md:text-[10px] text-gray-400 uppercase">M</p><p className="font-bold text-xs md:text-sm">x{rule.medium_multiplier}</p></div>
                                        <div className="text-center"><p className="text-[8px] md:text-[10px] text-gray-400 uppercase">L</p><p className="font-bold text-xs md:text-sm">x{rule.large_multiplier}</p></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AdminPricing;