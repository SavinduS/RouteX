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
                setMessage("Business rules updated successfully!");
                fetchRules();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            alert("Failed to update business rules");
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'bike': return <Bike className="text-[#1B5E20]" size={32} />;
            case 'tuktuk': return <Info className="text-[#1B5E20]" size={32} />;
            case 'van': return <Car className="text-[#1B5E20]" size={32} />;
            case 'truck': return <Truck className="text-[#1B5E20]" size={32} />;
            default: return <Bike className="text-[#1B5E20]" size={32} />;
        }
    };

    if (loading) return <div className="p-10 text-center font-bold">Loading Business Rules...</div>;

    return (
        <div className="p-4 md:p-8 bg-[#F9FAFB] min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Pricing & Business Rules</h2>
                    <p className="text-gray-500">Full control over rates, multipliers, and revenue shares</p>
                </div>
                <AnimatePresence>
                    {message && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="bg-[#A5D6A7] text-[#1B5E20] px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
                            <CheckCircle size={18} /> {message}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {rules.map((rule) => (
                    <motion.div 
                        key={rule._id} 
                        layout
                        className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-[#F0FDF4] p-4 rounded-2xl">
                                    {getIcon(rule.vehicle_type)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold capitalize">{rule.vehicle_type} Rules</h3>
                                    <p className="text-xs text-gray-400">ID: {rule._id.slice(-6)}</p>
                                </div>
                            </div>
                            {editingId !== rule._id && (
                                <button onClick={() => startEditing(rule)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-[#1B5E20]">
                                    <Edit2 size={20} />
                                </button>
                            )}
                        </div>

                        {editingId === rule._id ? (
                            <div className="space-y-6">
                                {/* Base Rates Group */}
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl">
                                    <div className="col-span-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Core Rates</div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500">Base Fare (LKR)</label>
                                        <input type="number" className="w-full mt-1 p-2 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-[#A5D6A7]" value={editData.base_fare} onChange={(e) => setEditData({...editData, base_fare: Number(e.target.value)})} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500">Rate Per KM (LKR)</label>
                                        <input type="number" className="w-full mt-1 p-2 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-[#A5D6A7]" value={editData.per_km_rate} onChange={(e) => setEditData({...editData, per_km_rate: Number(e.target.value)})} />
                                    </div>
                                </div>

                                {/* Multipliers Group */}
                                <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl">
                                    <div className="col-span-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Package size={14}/> Package Multipliers
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500">Small</label>
                                        <input type="number" step="0.1" className="w-full mt-1 p-2 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-[#A5D6A7]" value={editData.small_multiplier} onChange={(e) => setEditData({...editData, small_multiplier: Number(e.target.value)})} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500">Medium</label>
                                        <input type="number" step="0.1" className="w-full mt-1 p-2 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-[#A5D6A7]" value={editData.medium_multiplier} onChange={(e) => setEditData({...editData, medium_multiplier: Number(e.target.value)})} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500">Large</label>
                                        <input type="number" step="0.1" className="w-full mt-1 p-2 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-[#A5D6A7]" value={editData.large_multiplier} onChange={(e) => setEditData({...editData, large_multiplier: Number(e.target.value)})} />
                                    </div>
                                </div>

                                {/* Revenue Split Group */}
                                <div className="grid grid-cols-2 gap-4 bg-green-50 p-4 rounded-2xl border border-green-100">
                                    <div className="col-span-2 text-xs font-bold text-[#1B5E20] uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Percent size={14}/> Revenue Share (%)
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600">Driver Share</label>
                                        <input type="number" className="w-full mt-1 p-2 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-[#1B5E20]" value={editData.driver_cut_percent} onChange={(e) => setEditData({...editData, driver_cut_percent: Number(e.target.value)})} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600">Platform Share</label>
                                        <input type="number" className="w-full mt-1 p-2 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-[#1B5E20]" value={editData.platform_cut_percent} onChange={(e) => setEditData({...editData, platform_cut_percent: Number(e.target.value)})} />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => handleUpdate(rule._id)} className="flex-1 bg-[#1B5E20] text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#144718] transition-all">
                                        <Save size={18} /> Update Business Rules
                                    </button>
                                    <button onClick={() => setEditingId(null)} className="px-6 bg-white border border-gray-200 text-gray-500 rounded-2xl hover:bg-gray-50 transition-all">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-y-6">
                                <div className="border-r border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Base Rates</p>
                                    <div className="text-sm text-gray-600">Base: <span className="font-bold text-gray-900">Rs.{rule.base_fare}</span></div>
                                    <div className="text-sm text-gray-600">Per KM: <span className="font-bold text-gray-900">Rs.{rule.per_km_rate}</span></div>
                                </div>
                                <div className="pl-6">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Revenue Split</p>
                                    <div className="text-sm text-gray-600">Driver: <span className="font-bold text-emerald-600">{rule.driver_cut_percent}%</span></div>
                                    <div className="text-sm text-gray-600">Admin: <span className="font-bold text-blue-600">{rule.platform_cut_percent}%</span></div>
                                </div>
                                <div className="col-span-2 bg-gray-50 p-4 rounded-2xl mt-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Size Multipliers</p>
                                    <div className="flex justify-between">
                                        <div className="text-center"><p className="text-[10px] text-gray-400 uppercase">Small</p><p className="font-bold text-sm">x{rule.small_multiplier}</p></div>
                                        <div className="text-center"><p className="text-[10px] text-gray-400 uppercase">Medium</p><p className="font-bold text-sm">x{rule.medium_multiplier}</p></div>
                                        <div className="text-center"><p className="text-[10px] text-gray-400 uppercase">Large</p><p className="font-bold text-sm">x{rule.large_multiplier}</p></div>
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