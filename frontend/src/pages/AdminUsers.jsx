import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mail, Phone, Calendar, MessageSquare, History, X, Send, AlertCircle, CheckCircle, User, ArrowRight } from 'lucide-react';
import API from '../services/api';

const AdminUsers = () => {
    const [entrepreneurs, setEntrepreneurs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewMode, setViewMode] = useState(null); // 'orders' or 'complains'
    const [replyText, setReplyText] = useState('');

    useEffect(() => { fetchEntrepreneurs(); }, []);

    const fetchEntrepreneurs = async () => {
        try {
            const res = await API.get('/admin/users/entrepreneurs');
            if (res.data.success) setEntrepreneurs(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = entrepreneurs.filter(user => 
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSendReply = () => {
        if (!replyText.trim()) return;
        alert(`Reply sent to ${selectedUser.full_name}: ${replyText}`);
        setReplyText('');
        setViewMode(null);
    };

    if (loading) return <div className="p-10 text-center font-black uppercase tracking-widest text-gray-400">Syncing Entrepreneur Data...</div>;

    return (
        <div className="p-4 md:p-8 bg-[#F9FAFB] min-h-screen relative">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h2 className="text-4xl font-black text-gray-800 tracking-tight">Entrepreneur Hub</h2>
                    <p className="text-gray-500 font-medium">Manage corporate clients and logistics partnerships</p>
                </div>

                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1B5E20] transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        className="w-full pl-12 pr-4 py-4 bg-white shadow-sm border-none rounded-[1.5rem] outline-none focus:ring-2 focus:ring-[#A5D6A7] transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5">
                    <div className="bg-[#E8F5E9] p-4 rounded-2xl text-[#1B5E20]"><User size={28}/></div>
                    <div>
                        <p className="text-gray-400 text-[10px] font-black uppercase">Total Clients</p>
                        <h3 className="text-2xl font-black">{entrepreneurs.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5">
                    <div className="bg-red-50 p-4 rounded-2xl text-red-500"><AlertCircle size={28}/></div>
                    <div>
                        <p className="text-gray-400 text-[10px] font-black uppercase">Active Issues</p>
                        <h3 className="text-2xl font-black text-red-600">3 Pending</h3>
                    </div>
                </div>
                <div className="bg-[#1B5E20] p-6 rounded-[2rem] shadow-xl flex items-center gap-5 text-white">
                    <div className="bg-white/20 p-4 rounded-2xl"><CheckCircle size={28}/></div>
                    <div>
                        <p className="text-white/60 text-[10px] font-black uppercase">Satisfaction</p>
                        <h3 className="text-2xl font-black">98.2%</h3>
                    </div>
                </div>
            </div>

            {/* Entrepreneur Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredUsers.map((user, index) => (
                    <motion.div 
                        key={user._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative overflow-hidden"
                    >
                        {/* Status Badge */}
                        <div className="absolute top-6 right-6 flex gap-2">
                             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        </div>

                        <div className="flex items-center gap-5 mb-8">
                            <div className="h-16 w-16 bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">
                                {user.full_name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-black text-gray-800 text-xl group-hover:text-[#1B5E20] transition-colors">{user.full_name}</h4>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Member since {new Date(user.created_at).getFullYear()}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 text-sm font-medium text-gray-500 bg-gray-50 p-3 rounded-xl">
                                <Mail size={16} className="text-[#A5D6A7]" /> {user.email}
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-gray-500 bg-gray-50 p-3 rounded-xl">
                                <Phone size={16} className="text-[#A5D6A7]" /> {user.phone_number}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => { setSelectedUser(user); setViewMode('complains'); }}
                                className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest py-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all"
                            >
                                <MessageSquare size={16} /> Issues
                            </button>
                            <button 
                                onClick={() => { setSelectedUser(user); setViewMode('orders'); }}
                                className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest py-4 bg-[#F0FDF4] text-[#1B5E20] rounded-2xl hover:bg-[#1B5E20] hover:text-white transition-all"
                            >
                                <History size={16} /> Orders
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Interaction Drawer / Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedUser(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-lg bg-white h-screen shadow-2xl p-10 flex flex-col"
                        >
                            <button onClick={() => setSelectedUser(null)} className="absolute top-10 right-10 p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={24}/>
                            </button>

                            <div className="mb-10">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A5D6A7]">Management Panel</span>
                                <h3 className="text-3xl font-black text-gray-800 mt-2">{selectedUser.full_name}</h3>
                                <p className="text-gray-400 text-sm">{selectedUser.email}</p>
                            </div>

                            {viewMode === 'complains' ? (
                                <div className="flex-1 flex flex-col">
                                    <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 mb-6">
                                        <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase mb-2">
                                            <AlertCircle size={14}/> Recent Complaint
                                        </div>
                                        <p className="text-gray-700 font-medium italic">"The order #CE4A80 was delayed by 2 hours. Driver didn't respond to calls."</p>
                                        <span className="text-[10px] text-gray-400 mt-4 block font-bold">2 Hours ago</span>
                                    </div>

                                    <div className="mt-auto">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Quick Reply</label>
                                        <div className="relative">
                                            <textarea 
                                                className="w-full h-40 bg-gray-50 border-none rounded-[2rem] p-6 outline-none focus:ring-2 focus:ring-[#1B5E20] transition-all resize-none font-medium"
                                                placeholder="Type your official response here..."
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                            />
                                            <button 
                                                onClick={handleSendReply}
                                                className="absolute bottom-4 right-4 bg-[#1B5E20] text-white p-4 rounded-2xl shadow-lg hover:bg-[#144718] transition-all"
                                            >
                                                <Send size={20}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Recent Order History</h4>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center justify-between p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100 group hover:border-[#A5D6A7] transition-all">
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">#ORD-5542{i}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">Delivered on Feb {15+i}, 2026</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-[#1B5E20] text-sm">Rs. 4,500</p>
                                                <button className="text-[9px] font-black uppercase text-[#A5D6A7] flex items-center gap-1 mt-1 group-hover:text-[#1B5E20]">
                                                    Details <ArrowRight size={10}/>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminUsers;