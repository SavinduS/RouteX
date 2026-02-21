import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Search, Truck, CheckCircle, UserCheck } from 'lucide-react';
import API from '../services/api';

const AdminCouriers = () => {
    const [drivers, setDrivers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => { fetchDrivers(); }, []);

    const fetchDrivers = async () => {
        try {
            const res = await API.get('/admin/users/drivers');
            if (res.data.success) setDrivers(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id) => {
        try {
            const res = await API.put(`/admin/users/verify-driver/${id}`);
            if (res.data.success) {
                setMessage("Driver verified successfully!");
                fetchDrivers(); // පේජ් එක රිෆ්‍රෙෂ් නොකර ඩේටා අප්ඩේට් කිරීම
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            alert("Verification failed");
        }
    };

    const filteredDrivers = drivers.filter(d => 
        d.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center font-bold">Loading Couriers...</div>;

    return (
        <div className="p-4 md:p-8 bg-[#F9FAFB] min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Courier Verification</h2>
                    <p className="text-gray-500">Verify and manage delivery personnel</p>
                </div>
                <AnimatePresence>
                    {message && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-100 text-green-700 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm">
                            <UserCheck size={18} /> {message}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="relative w-full md:w-80 mb-8">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search by driver name..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#A5D6A7]"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDrivers.map((driver) => (
                    <motion.div 
                        key={driver._id}
                        layout
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-gray-50 p-3 rounded-xl text-[#1B5E20]">
                                <Truck size={28} />
                            </div>
                            {driver.is_verified ? (
                                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                                    <ShieldCheck size={12} /> Verified
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 text-red-500 bg-red-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                                    <ShieldAlert size={12} /> Unverified
                                </div>
                            )}
                        </div>

                        <h4 className="font-bold text-gray-800 text-lg mb-1">{driver.full_name}</h4>
                        <p className="text-sm text-gray-400 mb-6">{driver.email}</p>

                        <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-6">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400 font-medium">Vehicle Type:</span>
                                <span className="font-bold text-gray-700 capitalize">{driver.vehicle_type}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400 font-medium">License:</span>
                                <span className="font-bold text-gray-700">{driver.license_number || 'Not Provided'}</span>
                            </div>
                        </div>

                        {!driver.is_verified ? (
                            <button 
                                onClick={() => handleVerify(driver._id)}
                                className="w-full bg-[#1B5E20] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#144718] transition-all shadow-lg shadow-green-100"
                            >
                                <CheckCircle size={18} /> Verify Agent
                            </button>
                        ) : (
                            <div className="w-full border border-gray-100 text-gray-400 py-3 rounded-xl font-bold text-center text-sm">
                                Approved Personnel
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AdminCouriers;