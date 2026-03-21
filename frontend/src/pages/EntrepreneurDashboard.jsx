import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyDeliveries, sendInquiry } from "../services/deliveryService";

// ── Icons (Kept as is) ───────────────────────────────────────────────────────
const PackageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />
  </svg>
);
const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
  </svg>
);
const TruckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const SendIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);

// ── Status Config ────────────────────────────────────────────────────────────
const statusConfig = {
  delivered:  { label: "Delivered",  class: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  available:  { label: "Pending",    class: "bg-amber-100  text-amber-700  border-amber-200"  },
  assigned:   { label: "Assigned",   class: "bg-blue-100   text-blue-700   border-blue-200"   },
  picked_up:  { label: "Picked Up",  class: "bg-violet-100 text-violet-700 border-violet-200" },
  in_transit: { label: "In Transit", class: "bg-cyan-100   text-cyan-700   border-cyan-200"   },
};

const EntrepreneurDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inTransit: 0, delivered: 0 });
  const [inquiry, setInquiry] = useState({ subject: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  useEffect(() => { fetchData(); }, []);

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
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  const statCards = [
    { label: "Total Orders", value: stats.total,     icon: <PackageIcon />, accent: "text-[#1D4ED8]", ring: "bg-[#1D4ED8]/10" },
    { label: "Pending",      value: stats.pending,   icon: <ClockIcon />,   accent: "text-amber-500",  ring: "bg-amber-50"      },
    { label: "In Transit",   value: stats.inTransit, icon: <TruckIcon />,   accent: "text-[#06B6D4]",  ring: "bg-[#06B6D4]/10"  },
    { label: "Delivered",    value: stats.delivered, icon: <CheckIcon />,   accent: "text-emerald-500",ring: "bg-emerald-50"    },
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6 lg:p-8 font-sans">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Entrepreneur Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back! Here's your delivery overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${card.ring} ${card.accent}`}>
              {card.icon}
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{card.value}</p>
            <p className="text-sm text-slate-500 font-medium mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        
        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-900">Recent Orders</h2>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">Last 5 orders</span>
          </div>
          <div className="p-6">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-semibold text-slate-500 uppercase bg-slate-50">
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deliveries.length === 0 ? (
                  <tr><td colSpan="2" className="py-10 text-center text-slate-400">No orders found</td></tr>
                ) : (
                  deliveries.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 font-semibold text-slate-700">#{o.order_id || "N/A"}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold border ${statusConfig[o.status]?.class || "bg-slate-100"}`}>
                          {statusConfig[o.status]?.label || o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <Link to="/entrepreneur/my-deliveries">
              <button className="mt-6 w-full py-2 border border-blue-600 text-blue-600 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition-all">
                View All Deliveries →
              </button>
            </Link>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-[#1D4ED8] text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">💬 Help & Support</h2>
            <p className="text-blue-200 text-sm mb-6">Have an issue? Send a message to admin.</p>
            
            <form onSubmit={handleInquiry} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Subject</label>
                <input 
                  className="w-full mt-1 px-4 py-2 bg-white rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Issue with order..."
                  value={inquiry.subject}
                  onChange={e => setInquiry({...inquiry, subject: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Message</label>
                <textarea 
                  className="w-full mt-1 px-4 py-2 bg-white rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                  rows="4"
                  placeholder="Describe the issue..."
                  value={inquiry.message}
                  onChange={e => setInquiry({...inquiry, message: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="w-full bg-[#06B6D4] hover:bg-cyan-500 py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg transition-colors">
                <SendIcon /> Send to Admin
              </button>
            </form>

            {statusMsg.text && (
              <div className={`mt-4 p-3 rounded-lg text-sm font-medium border ${statusMsg.type === 'success' ? 'bg-emerald-500/20 border-emerald-400' : 'bg-red-500/20 border-red-400'}`}>
                {statusMsg.text}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default EntrepreneurDashboard;