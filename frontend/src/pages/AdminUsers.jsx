import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, Phone, Calendar, MessageSquare } from 'lucide-react';
import API from '../services/api';

const AdminUsers = () => {
    const [entrepreneurs, setEntrepreneurs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchEntrepreneurs(); }, []);

    const fetchEntrepreneurs = async () => {
        try {
            const res = await API.get('/admin/users/entrepreneurs');
            if (res.data.success) setEntrepreneurs(res.data.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const filteredUsers = entrepreneurs.filter(user => 
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center font-bold">Loading Entrepreneurs...</div>;

    return (
        <div className="p-8 bg-[#F9FAFB] min-h-screen">
            <div className="mb-8 flex justify-between items-center">
                <h2 className="text-3xl font-bold">Entrepreneur Management</h2>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 border rounded-xl w-full outline-none focus:ring-2 focus:ring-[#A5D6A7]" onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                    <div key={user._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="font-bold text-lg mb-4">{user.full_name}</div>
                        <div className="text-sm text-gray-500 space-y-2 mb-4">
                            <p className="flex items-center gap-2"><Mail size={14}/> {user.email}</p>
                            <p className="flex items-center gap-2"><Phone size={14}/> {user.phone_number}</p>
                        </div>
                        <button className="w-full bg-[#1B5E20] text-white py-2 rounded-xl text-sm font-bold">View Orders</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminUsers;