import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart } from 'lucide-react';
import API from '../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalRevenue: 0, platformEarnings: 0, totalDeliveries: 0 });
    const [chartData, setChartData] = useState([]); // Real chart data state
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await API.get('/admin/analytics/revenue');
                if (response.data.success) {
                    setStats(response.data.data.stats);
                    setChartData(response.data.data.chartData);
                }
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const summaryCards = [
        { title: 'Total Revenue', value: `Rs. ${(stats.totalRevenue || 0).toFixed(2)}`, icon: <DollarSign size={24} className="text-[#1B5E20]" /> },
        { title: 'Platform Earnings', value: `Rs. ${(stats.platformEarnings || 0).toFixed(2)}`, icon: <DollarSign size={24} className="text-[#1B5E20]" /> },
        { title: 'Total Deliveries', value: stats.totalDeliveries || 0, icon: <ShoppingCart size={24} className="text-[#1B5E20]" /> },
    ];

    // Animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
    };

    if (loading) return <div className="p-8 text-center font-bold">Loading Analytics...</div>;

    return (
        <div className="p-4 md:p-8 bg-[#F9FAFB] min-h-screen">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">System Analytics</h2>

            {/* Summary Cards */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {summaryCards.map((card, index) => (
                    <motion.div key={index} className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4 border border-gray-100" variants={itemVariants}>
                        <div className="bg-[#A5D6A7] p-3 rounded-full">
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Monthly Revenue Chart - Real Data */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
                <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly Revenue Overview</h3>
                <div style={{ width: '100%', height: 350 }}>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="revenue" fill="#1B5E20" name="Revenue (Rs.)" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">No delivery data available yet.</div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;