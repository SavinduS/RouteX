import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, Download, Calendar, TrendingUp, CheckCircle, FileText, Coins } from 'lucide-react'; // Coins icon එක ඇඩ් කළා
import API from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminDashboard = () => {
    // 1. Initial State එකට usdRate: 0 ඇතුළත් කළා
    const [stats, setStats] = useState({ totalRevenue: 0, platformEarnings: 0, driverEarnings: 0, totalDeliveries: 0, usdRate: 0 });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); 
    const [currency, setCurrency] = useState('LKR'); // මුදල් ඒකකය සඳහා state එක

    useEffect(() => {
        fetchDashboardData();
    }, [filter]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await API.get(`/admin/analytics/revenue?period=${filter}`);
            if (response.data.success) {
                // Backend එකෙන් එන stats (usdRate සහිතව) මෙතනට සෙට් වේ
                setStats(response.data.data.stats);
                setChartData(response.data.data.chartData);
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    // 2. අගයන් පෙන්වන ආකාරය තීරණය කරන Helper Function එක
    const formatValue = (val, noPrefix) => {
        if (noPrefix) return val; // ඩිලිවරි ගණනට රුපියල්/ඩොලර් ලකුණු අවශ්‍ය නැත
        
        if (currency === 'USD') {
            const converted = val * (stats.usdRate || 0.0033); // Rate එක නැත්නම් default එකක් ගනී
            return `$ ${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        return `Rs. ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handleDownloadPDF = () => {
        // ... (PDF කේතය කලින් වගේමයි - ඒක වෙනස් කරන්න ඕනේ නැහැ) ...
        try {
            const doc = new jsPDF();
            const timestamp = new Date();
            const dateStr = timestamp.toLocaleDateString();
            const timeStr = timestamp.toLocaleTimeString();
            const datePart = timestamp.toISOString().split('T')[0].replace(/-/g, ''); 
            const randomPart = Math.floor(1000 + Math.random() * 9000); 
            const reportId = `RX-REV-${filter.toUpperCase()}-${datePart}-${randomPart}`;
            doc.setFillColor(27, 94, 32); 
            doc.rect(0, 0, 210, 45, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(28); doc.setFont("helvetica", "bold"); doc.text("RouteX", 15, 25);
            doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.text("SMART LAST MILE DELIVERY SOLUTIONS", 15, 33);
            doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.text(`REPORT ID: ${reportId}`, 135, 18);
            doc.setFont("helvetica", "normal"); doc.text("Kandy Road, Colombo, Sri Lanka", 135, 25);
            doc.text("Contact: +94 91 227 6246", 135, 31); doc.text(`Generated: ${dateStr} | ${timeStr}`, 135, 37);
            doc.setTextColor(0, 0, 0); doc.setFontSize(16); doc.setFont("helvetica", "bold");
            const title = filter === 'all' ? "FULL FINANCIAL SUMMARY" : filter === 'week' ? "WEEKLY PERFORMANCE REPORT" : "MONTHLY REVENUE SUMMARY";
            doc.text(title, 15, 60);
            const tableBody = [
                ["Reference ID", reportId],
                ["Analytics Scope", filter === 'all' ? "All-Time Logistics Data" : filter === 'week' ? "Last 07 Days" : "Last 30 Days"],
                ["Gross Revenue (LKR)", `${(stats.totalRevenue || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`],
                ["Total Delivery Volume", (stats.totalDeliveries || 0).toString()],
                ["Platform Net Profit", `LKR ${(stats.platformEarnings || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`],
                ["Courier Total Payout", `LKR ${(stats.driverEarnings || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`],
            ];
            autoTable(doc, {
                startY: 70,
                head: [['Financial Metric', 'Official Data / Valuation']],
                body: tableBody,
                theme: 'grid',
                headStyles: { fillColor: [27, 94, 32], halign: 'center', fontStyle: 'bold' },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 70 }, 1: { halign: 'right' } },
                styles: { fontSize: 11, cellPadding: 5 }
            });
            const finalY = doc.lastAutoTable.finalY + 35;
            doc.setFontSize(10); doc.setTextColor(0, 0, 0); doc.text("__________________________", 15, finalY); doc.text("Authorized System Admin", 15, finalY + 7);
            doc.setFontSize(8); doc.setTextColor(150); doc.text(`This report is confidential and intended for RouteX internal management. ID: ${reportId}`, 45, 285);
            doc.save(`${reportId}.pdf`);
        } catch (err) { console.error("PDF Error:", err); }
    };

    if (loading) return <div className="p-8 text-center font-bold text-[#1B5E20]">Syncing Financial Data...</div>;

    return (
        <div className="p-4 md:p-10 bg-[#F9FAFB] min-h-screen">
            {/* Top Bar with Filter, Currency & PDF Button */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
                <div>
                    <h2 className="text-4xl font-black text-gray-800 tracking-tighter uppercase">Executive Overview</h2>
                    <p className="text-gray-500 font-medium">Real-time financial performance and logistics metrics</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-[1.5rem] shadow-sm border border-gray-100">
                    {/* Time Filter */}
                    <select 
                        className="bg-gray-50 border-none px-4 py-2 rounded-xl text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-[#A5D6A7]"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Time</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                    </select>

                    {/* 3. Currency Selector (මෙතනට ඇඩ් කළා) */}
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                        <Coins size={16} className="text-gray-400" />
                        <select 
                            className="bg-transparent border-none text-sm font-bold text-gray-600 outline-none cursor-pointer"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                        >
                            <option value="LKR">LKR (Rs)</option>
                            <option value="USD">USD ($)</option>
                        </select>
                    </div>
                    
                    <button 
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 bg-[#1B5E20] text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-[#144718] transition-all"
                    >
                        <Download size={16} /> Export PDF
                    </button>
                </div>
            </div>

            {/* Stats Grid - Updated to use formatValue */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Platform Profit', val: stats.platformEarnings, icon: <TrendingUp />, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Driver Earnings', val: stats.driverEarnings, icon: <ShoppingCart />, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Gross Revenue', val: stats.totalRevenue, icon: <DollarSign />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Deliveries', val: stats.totalDeliveries, icon: <CheckCircle />, color: 'text-purple-600', bg: 'bg-purple-50', noPrefix: true }
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                        <div>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{s.label}</p>
                            <h3 className="text-2xl font-black text-gray-800">
                                {formatValue(s.val, s.noPrefix)}
                            </h3>
                        </div>
                        <div className={`${s.bg} ${s.color} p-4 rounded-2xl`}>{s.icon}</div>
                    </motion.div>
                ))}
            </div>

            {/* Chart Area */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                    <Calendar className="text-[#A5D6A7]" />
                    <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Revenue Growth Pattern ({currency})</h3>
                </div>
                <div className="h-[400px] w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 'bold'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 'bold'}} />
                                <Tooltip 
                                    cursor={{fill: '#F8FAFC'}} 
                                    contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '10px 10px 15px rgba(0,0,0,0.05)'}} 
                                    formatter={(value) => formatValue(value)} // Tooltip එකෙත් මුදල් ඒකකය පෙන්වීමට
                                />
                                <Bar dataKey="revenue" fill="#1B5E20" radius={[10, 10, 0, 0]} barSize={50}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#A5D6A7' : '#1B5E20'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest">No data for this period</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;