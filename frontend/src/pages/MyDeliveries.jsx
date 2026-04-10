import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  MapPin, 
  ArrowRight, 
  Package, 
  Calendar,
  CreditCard,
  ExternalLink,
  Filter,
  Truck
} from "lucide-react";
import { getMyDeliveries } from "../services/deliveryService";
import StatusModal from "../components/StatusModal";

const statusConfig = {
  available:  { label: "Pending",    className: "bg-amber-100 text-amber-700 border-amber-200" },
  assigned:   { label: "Assigned",   className: "bg-blue-100 text-blue-700 border-blue-200" },
  picked_up:  { label: "Picked Up",  className: "bg-violet-100 text-violet-700 border-violet-200" },
  in_transit: { label: "In Transit", className: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  delivered:  { label: "Delivered",  className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};
const getStatusCfg = (status) =>
  statusConfig[status] ?? { label: status, className: "bg-slate-100 text-slate-600 border-slate-200" };

const vehicleEmoji = { bike: "🏍", tuktuk: "🛺", van: "🚐", truck: "🚛" };

const MyDeliveries = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const token = localStorage.getItem("token") || "DUMMY_TOKEN";
        const data = await getMyDeliveries(token);
        const orders = Array.isArray(data) ? data : (data.orders || []);
        setDeliveries(orders);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch deliveries");
        setLoading(false);
      }
    };
    fetchDeliveries();
  }, []);

  const filteredDeliveries = (deliveries || []).filter(d => {
    const search = searchTerm.toLowerCase();
    const oid = (d.order_id || "").toLowerCase();
    const paddr = (d.pickup_address || "").toLowerCase();
    const daddr = (d.dropoff_address || "").toLowerCase();
    
    return oid.includes(search) || paddr.includes(search) || daddr.includes(search);
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-slate-900 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching Records...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 lg:p-10">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <Motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Delivery History</h1>
          <p className="text-slate-400 font-bold text-xs md:text-sm uppercase tracking-widest mt-1">
            Reviewing <span className="text-slate-900 font-black">{filteredDeliveries.length}</span> recorded shipments
          </p>
        </Motion.div>
        
        <Motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 w-full md:w-auto">
          <Link to="/entrepreneur/create-delivery" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95">
            <Plus size={16} /> New Request
          </Link>
        </Motion.div>
      </div>

      {/* ── Search & Filter ── */}
      <Motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col md:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Order ID or Address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-100 rounded-2xl text-slate-600 font-bold text-sm shadow-sm hover:bg-slate-50 transition-all">
          <Filter size={18} /> Filters
        </button>
      </Motion.div>

      {/* ── Error ── */}
      {error && (
        <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 text-sm font-bold px-5 py-4 rounded-2xl">
          <Package size={18} /> {error}
        </Motion.div>
      )}

      {/* ── Table ── */}
      <Motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-0">
            <thead>
              <tr className="bg-slate-50/50">
                {[
                  { label: "Shipment", icon: <Package size={14} /> },
                  { label: "Pickup", icon: <MapPin size={14} /> },
                  { label: "Destination", icon: <ArrowRight size={14} /> },
                  { label: "Vehicle", icon: <Truck size={14} /> },
                  { label: "Status", icon: <div className="w-2 h-2 rounded-full bg-blue-500" /> },
                  { label: "Billing", icon: <CreditCard size={14} /> },
                  { label: "Details", icon: <ExternalLink size={14} /> }
                ].map((h) => (
                  <th
                    key={h.label}
                    className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400"
                  >
                    <div className="flex items-center gap-2">
                      {h.icon} {h.label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center grayscale opacity-50">
                      <Package size={64} className="text-slate-200 mb-4" />
                      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No matching records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((delivery, i) => {
                  const cfg = getStatusCfg(delivery.status);
                  return (
                    <Motion.tr
                      key={delivery._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group hover:bg-blue-50/30 transition-colors"
                    >
                      {/* ID & Date */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">#{delivery.order_id || "N/A"}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                            <Calendar size={10} /> {new Date(delivery.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                          </span>
                        </div>
                      </td>

                      {/* Pickup */}
                      <td className="px-6 py-5 max-w-[200px]">
                        <p className="text-xs font-bold text-slate-600 truncate" title={delivery.pickup_address}>
                          {delivery.pickup_address}
                        </p>
                      </td>

                      {/* Destination */}
                      <td className="px-6 py-5 max-w-[200px]">
                        <p className="text-xs font-bold text-slate-600 truncate" title={delivery.dropoff_address}>
                          {delivery.dropoff_address}
                        </p>
                      </td>

                      {/* Vehicle */}
                      <td className="px-6 py-5">
                        <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-[11px] font-black uppercase flex items-center gap-2 w-fit">
                          {vehicleEmoji[delivery.vehicle_type] || "🚗"} {delivery.vehicle_type}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase border ${cfg.className}`}>
                          {cfg.label}
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900">{delivery.total_cost.toLocaleString()} LKR</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Pre-paid</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-5 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/entrepreneur/track/${delivery._id}`)}
                          className="inline-flex items-center justify-center w-10 h-10 bg-white border border-slate-100 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                          title="View Details & Track"
                        >
                          <ArrowRight size={18} />
                        </button>
                      </td>
                    </Motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-8 py-5 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Logistics Record System v1.0
          </p>
          <div className="flex items-center gap-1.5 grayscale opacity-70">
            {Object.entries(statusConfig).map(([, v]) => (
              <span key={v.label} className={`px-2 py-0.5 rounded-md text-[9px] font-black border uppercase ${v.className}`}>
                {v.label}
              </span>
            ))}
          </div>
        </div>
      </Motion.div>

      {/* Action Restricted Modal */}
      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        message="Driver has already accepted this order. You cannot edit it now."
      />
    </div>
  );
};

export default MyDeliveries;
