import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Search, Truck, Bike, Car, Info, CheckCircle, UserCheck, Filter, Users, Hash } from 'lucide-react';
import API from '../services/api';

const AdminCouriers = () => {
    const [drivers, setDrivers] = useState([]);
    const [filteredDrivers, setFilteredDrivers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [vehicleFilter, setVehicleFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => { fetchDrivers(); }, []);

    // Filter Logic
    useEffect(() => {
        let temp = drivers;
        if (vehicleFilter !== 'all') {
            temp = temp.filter(d => d.vehicle_type === vehicleFilter);
        }
        if (searchTerm) {
            temp = temp.filter(d => 
                d.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d._id.includes(searchTerm)
            );
        }
        setFilteredDrivers(temp);
    }, [searchTerm, vehicleFilter, drivers]);

    const fetchDrivers = async () => {
        try {
            const res = await API.get('/admin/users/drivers');
            if (res.data.success) {
                setDrivers(res.data.data);
                setFilteredDrivers(res.data.data);
            }
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    const handleVerify = async (id) => {
        try {
            const res = await API.put(`/admin/users/verify-driver/${id}`);
            if (res.data.success) {
                setMessage("Driver verified successfully!");
                fetchDrivers();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) { alert("Verification failed"); }
    };

    // Stats Calculation
    const getStats = () => {
        const counts = { total: drivers.length, bike: 0, tuktuk: 0, van: 0, truck: 0 };
        drivers.forEach(d => { if (counts[d.vehicle_type] !== undefined) counts[d.vehicle_type]++; });
        return counts;
    };

    const stats = getStats();

    const getVehicleIcon = (type, size = 24) => {
        switch (type) {
            case 'bike': return <Bike size={size} />;
            case 'tuktuk': return <Info size={size} />; // Using Info as a placeholder for Tuktuk
            case 'van': return <Car size={size} />;
            case 'truck': return <Truck size={size} />;
            default: return <Users size={size} />;
        }
    };

    if (loading) return <div className="p-10 text-center font-bold">Loading Fleet Data...</div>;

    return (
        <div className="p-4 md:p-8 bg-[#F9FAFB] min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-800 tracking-tight">Courier Fleet</h2>
                    <p className="text-gray-500 font-medium">Verification and vehicle management center</p>
                </div>
                <AnimatePresence>
                    {message && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} 
                            className="bg-[#A5D6A7] text-[#1B5E20] px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg border border-white">
                            <UserCheck size={20} /> {message}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Fleet Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Fleet</p>
                    <h3 className="text-3xl font-black text-gray-800">{stats.total}</h3>
                </div>
                <div className="bg-emerald-50 p-5 rounded-[2rem] border border-emerald-100 flex items-center justify-between">
                    <div>
                        <p className="text-emerald-600 text-[10px] font-black uppercase">Bikes</p>
                        <h3 className="text-2xl font-black text-emerald-800">{stats.bike}</h3>
                    </div>
                    <div className="text-emerald-200"><Bike size={32}/></div>
                </div>
                <div className="bg-blue-50 p-5 rounded-[2rem] border border-blue-100 flex items-center justify-between">
                    <div>
                        <p className="text-blue-600 text-[10px] font-black uppercase">Tuktuks</p>
                        <h3 className="text-2xl font-black text-blue-800">{stats.tuktuk}</h3>
                    </div>
                    <div className="text-blue-200"><Info size={32}/></div>
                </div>
                <div className="bg-orange-50 p-5 rounded-[2rem] border border-orange-100 flex items-center justify-between">
                    <div>
                        <p className="text-orange-600 text-[10px] font-black uppercase">Vans</p>
                        <h3 className="text-2xl font-black text-orange-800">{stats.van}</h3>
                    </div>
                    <div className="text-orange-200"><Car size={32}/></div>
                </div>
                <div className="bg-purple-50 p-5 rounded-[2rem] border border-purple-100 flex items-center justify-between">
                    <div>
                        <p className="text-purple-600 text-[10px] font-black uppercase">Trucks</p>
                        <h3 className="text-2xl font-black text-purple-800">{stats.truck}</h3>
                    </div>
                    <div className="text-purple-200"><Truck size={32}/></div>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="bg-white p-4 rounded-3xl shadow-sm mb-8 border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by name or Driver ID..." 
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#A5D6A7]"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Filter size={20} className="text-gray-400" />
                    <select 
                        className="bg-gray-50 border-none rounded-2xl px-6 py-3 outline-none focus:ring-2 focus:ring-[#A5D6A7] font-bold text-gray-600 cursor-pointer"
                        value={vehicleFilter}
                        onChange={(e) => setVehicleFilter(e.target.value)}
                    >
                        <option value="all">All Vehicles</option>
                        <option value="bike">Bikes Only</option>
                        <option value="tuktuk">Tuktuks Only</option>
                        <option value="van">Vans Only</option>
                        <option value="truck">Trucks Only</option>
                    </select>
                </div>
            </div>

            {/* Drivers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDrivers.map((driver) => (
                    <motion.div 
                        key={driver._id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${driver.is_verified ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'} transition-colors`}>
                                {getVehicleIcon(driver.vehicle_type, 28)}
                            </div>
                            {driver.is_verified ? (
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1">
                                    <ShieldCheck size={12}/> Verified
                                </span>
                            ) : (
                                <span className="bg-red-100 text-red-600 text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1">
                                    <ShieldAlert size={12}/> Pending
                                </span>
                            )}
                        </div>

                        <div className="mb-6">
                            <h4 className="font-black text-gray-800 text-lg group-hover:text-[#1B5E20] transition-colors">{driver.full_name}</h4>
                            <div className="flex items-center gap-1 text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                                <Hash size={10}/> ID: {driver._id.slice(-8).toUpperCase()}
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
                                <span className="text-[10px] font-black text-gray-400 uppercase">License No</span>
                                <span className="text-xs font-bold text-gray-700">{driver.license_number || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Contact</span>
                                <span className="text-xs font-bold text-gray-600">{driver.phone_number}</span>
                            </div>
                        </div>

                        {!driver.is_verified ? (
                            <button 
                                onClick={() => handleVerify(driver._id)}
                                className="w-full bg-[#1B5E20] text-white py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#144718] transition-all shadow-lg shadow-emerald-100"
                            >
                                <CheckCircle size={16} /> Verify Driver
                            </button>
                        ) : (
                            <div className="w-full py-4 rounded-[1.5rem] bg-gray-50 text-gray-400 font-black text-xs uppercase tracking-[0.2em] text-center border border-dashed border-gray-200">
                                Official Partner
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {filteredDrivers.length === 0 && (
                <div className="py-20 text-center text-gray-400 font-black uppercase tracking-[0.3em]">
                    No drivers found
                </div>
            )}
        </div>
    );
};

export default AdminCouriers;