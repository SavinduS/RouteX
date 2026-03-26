import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyDeliveries } from "../services/deliveryService";

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
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const token = localStorage.getItem("token") || "DUMMY_TOKEN";
        const data = await getMyDeliveries(token);
        setDeliveries(data.orders || data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch deliveries");
        setLoading(false);
      }
    };
    fetchDeliveries();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F1F5F9]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-[#1D4ED8]/20 border-t-[#1D4ED8] animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading deliveries…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6 lg:p-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Delivery Requests
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {deliveries.length} order{deliveries.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <Link to="/entrepreneur/create-delivery">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] active:scale-95 text-white text-sm font-bold rounded-xl shadow-lg shadow-[#1D4ED8]/25 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Delivery Request
          </button>
        </Link>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl">
          ⚠️ {error}
        </div>
      )}

      {/* ── Empty State ── */}
      {deliveries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-[#1D4ED8]/10 flex items-center justify-center text-3xl mb-4">📦</div>
          <p className="text-slate-700 font-bold text-lg">No delivery requests yet</p>
          <p className="text-slate-400 text-sm mt-1">Create your first request to get started.</p>
          <Link to="/entrepreneur/create-delivery">
            <button className="mt-5 px-6 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-bold rounded-xl transition-colors">
              + New Delivery Request
            </button>
          </Link>
        </div>
      ) : (
        /* ── Table ── */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-100">
                  {["Date", "Order ID", "Pickup Address", "Dropoff Address", "Vehicle", "Status", "Cost (LKR)", "Action"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deliveries.map((delivery, i) => {
                  const cfg = getStatusCfg(delivery.status);
                  return (
                    <tr
                      key={delivery._id}
                      className={`border-b border-slate-50 hover:bg-blue-50/40 transition-colors ${
                        i % 2 === 0 ? "bg-white" : "bg-[#FAFBFC]"
                      }`}
                    >
                      {/* Date */}
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                        {new Date(delivery.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric"
                        })}
                      </td>

                      {/* Order ID */}
                      <td className="px-5 py-4">
                        <span className="font-bold text-[#1D4ED8]">
                          #{delivery.order_id || "N/A"}
                        </span>
                      </td>

                      {/* Pickup */}
                      <td className="px-5 py-4 max-w-[180px]">
                        <p className="text-slate-700 truncate" title={delivery.pickup_address}>
                          {delivery.pickup_address}
                        </p>
                      </td>

                      {/* Dropoff */}
                      <td className="px-5 py-4 max-w-[180px]">
                        <p className="text-slate-700 truncate" title={delivery.dropoff_address}>
                          {delivery.dropoff_address}
                        </p>
                      </td>

                      {/* Vehicle */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="capitalize text-slate-600 font-medium">
                          {vehicleEmoji[delivery.vehicle_type] || "🚗"} {delivery.vehicle_type}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase border ${cfg.className}`}>
                          {cfg.label}
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="px-5 py-4 font-bold text-slate-800 whitespace-nowrap">
                        {delivery.total_cost.toLocaleString()}
                        <span className="text-xs font-normal text-slate-400 ml-1">LKR</span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-center">
                        <Link to={`/entrepreneur/track/${delivery._id}`}>
                          <button className="px-4 py-2 bg-[#06B6D4]/10 hover:bg-[#06B6D4] text-[#06B6D4] hover:text-white border border-[#06B6D4]/30 text-xs font-bold rounded-lg transition-all whitespace-nowrap">
                            View Details
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-5 py-3 border-t border-slate-100 bg-[#F8FAFC] flex items-center justify-between">
            <p className="text-xs text-slate-400 font-medium">
              Showing <span className="text-slate-600 font-bold">{deliveries.length}</span> order{deliveries.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-1.5">
              {Object.entries(statusConfig).map(([, v]) => (
                <span key={v.label} className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${v.className}`}>
                  {v.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDeliveries;