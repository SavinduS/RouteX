import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { 
  Package, 
  Search, 
  MapPin, 
  ArrowRight, 
  Calendar,
  CreditCard,
  User,
  Phone,
  Clock,
  History,
  CheckCircle,
  Truck
} from "lucide-react";
import { getMyDeliveries } from "../services/deliveryService";

const statusConfig = {
  delivered:  { label: "Delivered",  className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelled:  { label: "Cancelled",  className: "bg-red-100 text-red-700 border-red-200" },
};

const vehicleEmoji = { bike: "🏍", tuktuk: "🛺", van: "🚐", truck: "🚛" };

const MyHistory = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await getMyDeliveries(token);
        const orders = Array.isArray(data) ? data : (data.orders || []);
        
        // Filter only delivered orders for the history page
        const historyOrders = orders.filter(o => o.status === "delivered");
        setDeliveries(historyOrders);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch delivery history");
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = deliveries.filter(d => {
    const search = searchTerm.toLowerCase();
    const oid = (d.order_id || "").toLowerCase();
    const paddr = (d.pickup_address || "").toLowerCase();
    const daddr = (d.dropoff_address || "").toLowerCase();
    return oid.includes(search) || paddr.includes(search) || daddr.includes(search);
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-emerald-600 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Archive...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 lg:p-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <Motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <History size={24} />
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Delivery Archive</h1>
          </div>
          <p className="text-slate-400 font-bold text-xs md:text-sm uppercase tracking-widest mt-1">
            Total Completed Missions: <span className="text-emerald-600 font-black">{deliveries.length}</span>
          </p>
        </Motion.div>
        
        <Motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 w-full md:w-auto">
          <Link to="/entrepreneur/dashboard" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95">
            Back to Dashboard
          </Link>
        </Motion.div>
      </div>

      {/* Search */}
      <Motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Order ID or Address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
          />
        </div>
      </Motion.div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredHistory.length === 0 ? (
          <div className="col-span-full py-24 text-center">
            <div className="flex flex-col items-center justify-center grayscale opacity-50">
              <Package size={64} className="text-slate-200 mb-4" />
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No completed deliveries found</p>
            </div>
          </div>
        ) : (
          filteredHistory.map((d, i) => (
            <Motion.div
              key={d._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</span>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">#{d.order_id}</h3>
                </div>
                <div className="flex flex-col items-end">
                   <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                     <CheckCircle size={10} /> Delivered
                   </span>
                   <span className="text-[9px] font-bold text-slate-400 mt-2 uppercase flex items-center gap-1">
                      <Calendar size={10} /> {new Date(d.updated_at).toLocaleDateString()}
                   </span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">From</p>
                    <p className="text-xs font-bold text-slate-600 leading-relaxed truncate max-w-[200px]">{d.pickup_address}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <ArrowRight size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">To</p>
                    <p className="text-xs font-bold text-slate-600 leading-relaxed truncate max-w-[200px]">{d.dropoff_address}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                     <Truck size={18} />
                   </div>
                   <div>
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Vehicle</p>
                     <p className="text-[10px] font-black text-slate-900 uppercase">{vehicleEmoji[d.vehicle_type]} {d.vehicle_type}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                     <CreditCard size={18} />
                   </div>
                   <div>
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Cost</p>
                     <p className="text-[10px] font-black text-emerald-600 uppercase">{d.total_cost} LKR</p>
                   </div>
                </div>
              </div>

              {/* Driver Details - If exists */}
              <div className="mt-6 p-4 bg-[#F8FAFC] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 overflow-hidden">
                      <User size={14} />
                   </div>
                   <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Courier</p>
                      <p className="text-[10px] font-bold text-slate-900">{d.driver_id?.full_name || "RouteX Partner"}</p>
                   </div>
                </div>
                {d.driver_id?.phone_number && (
                  <a href={`tel:${d.driver_id.phone_number}`} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                    <Phone size={12} />
                  </a>
                )}
              </div>
            </Motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyHistory;