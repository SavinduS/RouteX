import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  Send, 
  Plus, 
  ArrowRight, 
  HelpCircle,
  TrendingUp,
  AlertCircle,
  MapPin
} from "lucide-react";
import { getMyDeliveries, sendInquiry } from "../services/deliveryService";
import StatusModal from "../components/StatusModal";

// ── Status Config ────────────────────────────────────────────────────────────
const statusConfig = {
  delivered:  { label: "Delivered",  className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  available:  { label: "Pending",    className: "bg-amber-100  text-amber-700  border-amber-200"  },
  assigned:   { label: "Assigned",   className: "bg-blue-100   text-blue-700   border-blue-200"   },
  picked_up:  { label: "Picked Up",  className: "bg-violet-100 text-violet-700 border-violet-200" },
  in_transit: { label: "In Transit", className: "bg-cyan-100   text-cyan-700   border-cyan-200"   },
};

const EntrepreneurDashboard = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inTransit: 0, delivered: 0 });
  const [inquiry, setInquiry] = useState({ subject: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const data = await getMyDeliveries(token);
      const orders = data.orders || data;
      setStats({
        total:     orders.length,
        pending:   orders.filter(o => o.status === "available").length,
        inTransit: orders.filter(o => ["assigned", "picked_up", "in_transit"].includes(o.status)).length,
        delivered: orders.filter(o => o.status === "delivered").length,
      });
      setDeliveries(orders.slice(0, 5));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleInquiryChange = (e) => {
    const { name, value } = e.target;
    if (name === "subject") {
      const val = value.replace(/[^a-zA-Z0-9\s]/g, "");
      setInquiry({ ...inquiry, [name]: val });
    } else {
      setInquiry({ ...inquiry, [name]: value });
    }
  };

  const handleInquiry = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: "", text: "Sending…" });
    try {
      const token = localStorage.getItem("token");
      await sendInquiry(inquiry, token);
      setStatusMsg({ type: "success", text: "Inquiry sent successfully!" });
      setInquiry({ subject: "", message: "" });
    } catch (err) {
      setStatusMsg({ type: "error", text: "Failed to send message." });
    }
    setTimeout(() => setStatusMsg({ type: "", text: "" }), 5000);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F1F5F9]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Dashboard...</p>
      </div>
    </div>
  );

  const statCards = [
    { label: "Total Orders", value: stats.total,     icon: <Package size={20} />, accent: "text-slate-900", ring: "bg-slate-50" },
    { label: "Pending",      value: stats.pending,   icon: <Clock size={20} />,   accent: "text-amber-600",  ring: "bg-amber-50"      },
    { label: "In Transit",   value: stats.inTransit, icon: <Truck size={20} />,   accent: "text-slate-600",  ring: "bg-slate-100"  },
    { label: "Delivered",    value: stats.delivered, icon: <CheckCircle size={20} />,   accent: "text-emerald-600",ring: "bg-emerald-50"    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 lg:p-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <Motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Executive Overview</h1>
          <p className="text-slate-400 font-bold text-xs md:text-sm uppercase tracking-widest mt-1">Real-time logistics monitoring & partner insights</p>
        </Motion.div>

        <Motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 w-full md:w-auto">
          <Link to="/entrepreneur/create-delivery" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95">
            <Plus size={16} /> New Order
          </Link>
        </Motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((card, i) => (
          <Motion.div 
            key={card.label} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex items-center justify-between group hover:shadow-md transition-all"
          >
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{card.label}</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900">{card.value}</h3>
            </div>
            <div className={`${card.ring} ${card.accent} p-4 rounded-2xl transition-transform group-hover:scale-110`}>
              {card.icon}
            </div>
          </Motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Table Section */}
        <Motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden"
        >
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 text-slate-900 rounded-lg">
                <TrendingUp size={20} />
              </div>
              <h2 className="font-black text-slate-900 uppercase tracking-tighter text-lg">Recent Shipments</h2>
            </div>
            <Link 
              to="/entrepreneur/my-deliveries" 
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl transition-all duration-300 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 group"
            >
              Explore History 
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div className="p-2 overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right md:text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.length === 0 ? (
                  <tr><td colSpan="3" className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No active orders found</td></tr>
                ) : (
                  deliveries.map((o) => (
                    <tr key={o._id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">#{o.order_id || "N/A"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border ${statusConfig[o.status]?.className || "bg-slate-100"}`}>
                          {statusConfig[o.status]?.label || o.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end md:justify-start gap-2">
                        <button
                          onClick={() => navigate(`/entrepreneur/track/${o._id}`)}
                          className="p-2.5 inline-flex items-center justify-center bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm hover:shadow-md"
                          title="View Details & Track"
                        >
                          <ArrowRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Motion.div>

        {/* Support Section */}
        <Motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5 }}
          className="bg-[#1D4ED8] text-white rounded-[2.5rem] shadow-xl p-8 relative overflow-hidden flex flex-col"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <HelpCircle size={120} />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 rounded-xl">
                <HelpCircle size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter">Support Desk</h2>
                <p className="text-blue-200 text-xs font-medium">Direct line to system admin</p>
              </div>
            </div>
            
            <form onSubmit={handleInquiry} className="space-y-5 flex-1">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-blue-200 ml-1">Subject</label>
                <input 
                  name="subject"
                  className="w-full mt-1.5 px-5 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-blue-300 outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/20 transition-all text-sm"
                  placeholder="Order delay, pricing..."
                  value={inquiry.subject}
                  onChange={handleInquiryChange}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-blue-200 ml-1">Message</label>
                <textarea 
                  name="message"
                  className="w-full mt-1.5 px-5 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-blue-300 outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/20 transition-all resize-none text-sm"
                  rows="4"
                  placeholder="Tell us what's wrong..."
                  value={inquiry.message}
                  onChange={handleInquiryChange}
                  required
                />
              </div>
              <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95">
                <Send size={16} /> Send Message
              </button>
            </form>

            {statusMsg.text && (
              <Motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className={`mt-6 p-4 rounded-2xl text-xs font-bold border flex items-center gap-3 ${statusMsg.type === 'success' ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-100' : 'bg-red-500/20 border-red-400/50 text-red-100'}`}
              >
                {statusMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                {statusMsg.text}
              </Motion.div>
            )}
          </div>
        </Motion.div>

      </div>

      {/* Action Restricted Modal */}
      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        message="Driver has already accepted this order. You cannot edit it now."
      />
    </div>
  );
};

export default EntrepreneurDashboard;