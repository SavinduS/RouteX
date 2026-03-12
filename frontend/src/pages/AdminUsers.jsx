import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mail, Phone, MessageSquare, History, X, Send, AlertCircle, User, ArrowRight, Clock, Package, Edit, Trash2 } from 'lucide-react';
import API from '../services/api';

const AdminUsers = () => {
    const [entrepreneurs, setEntrepreneurs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewMode, setViewMode] = useState(null); 
    const [detailData, setDetailData] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [activeInquiryId, setActiveInquiryId] = useState(null);

    useEffect(() => { fetchEntrepreneurs(); }, []);

    const fetchEntrepreneurs = async () => {
        try {
            const res = await API.get('/admin/users/entrepreneurs');
            if (res.data.success) setEntrepreneurs(res.data.data);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    const handleOpenPanel = async (user, mode) => {
        setSelectedUser(user);
        setViewMode(mode);
        setDetailLoading(true);
        setDetailData([]);
        try {
            const endpoint = mode === 'orders' 
                ? `/admin/users/entrepreneur/${user._id}/orders` 
                : `/admin/users/entrepreneur/${user._id}/inquiries`;
            const res = await API.get(endpoint);
            if (res.data.success) setDetailData(res.data.data);
        } catch (err) { console.error(err); } 
        finally { setDetailLoading(false); }
    };

    const handleSendReply = async (inquiryId) => {
        if (!replyText.trim()) return;
        try {
            const res = await API.put(`/admin/inquiries/reply/${inquiryId}`, { reply: replyText });
            if (res.data.success) {
                setReplyText('');
                setActiveInquiryId(null);
                handleOpenPanel(selectedUser, 'complains'); // Refresh live data
            }
        } catch (err) { alert("Failed to send reply"); }
    };

    const handleDeleteReply = async (inquiryId) => {
        if (!window.confirm("Are you sure you want to delete this reply?")) return;
        try {
            const res = await API.delete(`/admin/inquiries/reply/${inquiryId}`);
            if (res.data.success) {
                handleOpenPanel(selectedUser, 'complains'); // Refresh live data
            }
        } catch (err) { alert("Failed to delete reply"); }
    };

    const handleEditReply = (item) => {
        setReplyText(item.admin_reply);
        setActiveInquiryId(item._id);
    };

    const filteredUsers = entrepreneurs.filter(user => 
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center font-black uppercase tracking-widest text-gray-300">Syncing...</div>;

    return (
        <div className="p-4 md:p-8 bg-[#F1F5F9] min-h-screen relative font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10 gap-4 md:gap-6">
                <div>
                    <h2 className="text-2xl md:text-4xl font-black text-gray-800 tracking-tight">Entrepreneurs</h2>
                    <p className="text-sm md:text-base text-gray-500 font-medium italic">Monitoring {entrepreneurs.length} active corporate partners</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" placeholder="Search partners..." 
                        className="w-full pl-11 pr-4 py-3 md:py-4 bg-white shadow-sm border-none rounded-xl md:rounded-[1.5rem] outline-none focus:ring-2 focus:ring-[#06B6D4] text-sm md:text-base"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {filteredUsers.map((user) => (
                    <motion.div key={user._id} layout className="bg-white rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
                        <div className="flex items-center gap-4 md:gap-5 mb-6 md:mb-8">
                            <div className="h-12 w-12 md:h-16 md:w-16 bg-[#1D4ED8] text-[#06B6D4] rounded-xl md:rounded-2xl flex items-center justify-center font-black text-xl md:text-2xl shadow-lg">
                                {user.full_name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-black text-gray-800 text-lg md:text-xl group-hover:text-[#1D4ED8] transition-colors">{user.full_name}</h4>
                                <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Partner ID: {user._id.slice(-6).toUpperCase()}</p>
                            </div>
                        </div>

                        <div className="space-y-2 md:space-y-3 mb-6 md:mb-8 text-xs md:text-sm">
                            <div className="flex items-center gap-3 font-medium text-gray-500 bg-gray-100/50 p-2.5 md:p-3 rounded-lg md:rounded-xl truncate">
                                <Mail size={14} md:size={16} className="text-[#06B6D4] shrink-0" /> {user.email}
                            </div>
                            <div className="flex items-center gap-3 font-medium text-gray-500 bg-gray-100/50 p-2.5 md:p-3 rounded-lg md:rounded-xl">
                                <Phone size={14} md:size={16} className="text-[#06B6D4] shrink-0" /> {user.phone_number}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                            <button onClick={() => handleOpenPanel(user, 'complains')} className="flex items-center justify-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest py-3 md:py-4 bg-red-50 text-red-600 rounded-xl md:rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                                <MessageSquare size={14} md:size={16} /> Issues
                            </button>
                            <button onClick={() => handleOpenPanel(user, 'orders')} className="flex items-center justify-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest py-3 md:py-4 bg-blue-50 text-[#1D4ED8] rounded-xl md:rounded-2xl hover:bg-[#1D4ED8] hover:text-white transition-all shadow-sm">
                                <History size={14} md:size={16} /> Orders
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Sliding Panel */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUser(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="relative w-full max-w-lg bg-white h-screen shadow-2xl p-6 md:p-10 flex flex-col">
                            <button onClick={() => setSelectedUser(null)} className="absolute top-6 right-6 md:top-10 md:right-10 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-red-500"><X size={20} md:size={24}/></button>

                            <div className="mb-6 md:mb-10 pr-8">
                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-[#06B6D4]">Management Panel</span>
                                <h3 className="text-xl md:text-3xl font-black text-gray-800 mt-1 md:mt-2 truncate">{selectedUser.full_name}</h3>
                                <p className="text-gray-400 text-xs md:text-sm font-medium">{viewMode === 'orders' ? 'Order History' : 'Inquiries & Support'}</p>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 md:space-y-6 pr-1 md:pr-2 custom-scrollbar">
                                {detailLoading ? (
                                    <div className="p-10 md:p-20 text-center font-bold text-gray-300 italic animate-pulse text-sm">Syncing live data...</div>
                                ) : detailData.length === 0 ? (
                                    <div className="p-10 md:p-20 text-center text-gray-300 font-black uppercase tracking-widest border-2 border-dashed border-gray-100 rounded-2xl md:rounded-[2.5rem] text-xs md:text-base">No {viewMode} found</div>
                                ) : (
                                    detailData.map((item) => (
                                        <div key={item._id} className="p-4 md:p-6 bg-gray-50 rounded-2xl md:rounded-[2.5rem] border border-gray-100 shadow-sm hover:border-[#06B6D4] transition-all">
                                            {viewMode === 'orders' ? (
                                                <div className="space-y-3 md:space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <span className="bg-blue-100 text-blue-700 px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-tighter">#{item._id.slice(-6).toUpperCase()}</span>
                                                        <span className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase">{item.status}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase mb-1">Deliver To</p>
                                                        <p className="text-xs md:text-sm font-bold text-gray-700">{item.receiver_name}</p>
                                                        <p className="text-[8px] md:text-[10px] text-gray-400 truncate mt-1">{item.dropoff_address}</p>
                                                    </div>
                                                    <div className="flex justify-between items-end pt-2 border-t border-gray-200/50">
                                                        <div className="text-[8px] md:text-[10px] text-gray-400 font-bold">{new Date(item.created_at).toLocaleDateString()}</div>
                                                        <div className="text-base md:text-lg font-black text-[#1D4ED8]">Rs.{item.total_cost.toFixed(2)}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-3 md:space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className={`px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase ${item.status === 'pending' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'}`}>{item.status}</div>
                                                        <div className="text-[8px] md:text-[9px] text-gray-400 font-bold"><Clock size={10} className="inline mr-1 mb-0.5"/> {new Date(item.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                    <h5 className="font-black text-gray-800 text-xs md:text-sm uppercase tracking-tight">{item.subject}</h5>
                                                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed font-medium italic truncate line-clamp-3">"{item.message}"</p>
                                                    
                                                    {item.admin_reply && activeInquiryId !== item._id ? (
                                                        <div className="mt-3 md:mt-4 p-4 md:p-5 bg-white rounded-xl md:rounded-2xl border-l-4 border-[#1D4ED8] shadow-sm group/reply">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <p className="text-[8px] md:text-[10px] font-black text-[#1D4ED8] uppercase">Response</p>
                                                                <div className="flex gap-2 lg:opacity-0 group-hover/reply:opacity-100 transition-opacity">
                                                                    <button onClick={() => handleEditReply(item)} className="p-1.5 bg-gray-50 text-gray-400 hover:text-[#1D4ED8] rounded-lg transition-colors"><Edit size={12}/></button>
                                                                    <button onClick={() => handleDeleteReply(item._id)} className="p-1.5 bg-gray-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={12}/></button>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs md:text-sm font-bold text-gray-700">{item.admin_reply}</p>
                                                        </div>
                                                    ) : (
                                                        <div className="pt-3 md:pt-4 border-t border-gray-200">
                                                            {activeInquiryId === item._id ? (
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex gap-2">
                                                                        <input 
                                                                            className="flex-1 bg-white border border-gray-200 text-xs md:text-sm p-2.5 md:p-3 rounded-lg md:rounded-xl outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                                                                            placeholder="Type reply..."
                                                                            value={replyText}
                                                                            onChange={(e) => setReplyText(e.target.value)}
                                                                            autoFocus
                                                                        />
                                                                        <button onClick={() => handleSendReply(item._id)} className="bg-[#1D4ED8] text-white p-2.5 md:p-3 rounded-lg md:rounded-xl hover:bg-blue-800 transition-all shadow-lg shadow-blue-50 flex items-center justify-center shrink-0"><Send size={16} md:size={18}/></button>
                                                                        {item.admin_reply && (
                                                                            <button onClick={() => { setActiveInquiryId(null); setReplyText(''); }} className="p-2.5 md:p-3 bg-gray-100 text-gray-500 rounded-lg md:rounded-xl hover:bg-gray-200 transition-all shrink-0"><X size={16} md:size={18}/></button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button onClick={() => setActiveInquiryId(item._id)} className="text-[8px] md:text-[10px] font-black text-[#1D4ED8] uppercase flex items-center gap-1 hover:gap-2 transition-all">Reply <ArrowRight size={12}/></button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminUsers;