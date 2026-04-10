import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  PlusCircle, 
  Package, 
  LogOut,
  Zap,
  History
} from "lucide-react";

const navLinks = [
  {
    to: "/entrepreneur/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    to: "/entrepreneur/create-delivery",
    label: "New Delivery",
    icon: <PlusCircle size={20} />,
  },
  {
    to: "/entrepreneur/my-deliveries",
    label: "My Deliveries",
    icon: <Package size={20} />,
  },
  {
    to: "/entrepreneur/my-history",
    label: "History",
    icon: <History size={20} />,
  },
];

const SidebarLink = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group
      ${active
        ? "bg-blue-50 text-blue-600 shadow-sm"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
  >
    <span className={`transition-colors ${active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}>
      {icon}
    </span>
    {label}
    {active && (
      <motion.span 
        layoutId="activeIndicator"
        className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" 
      />
    )}
  </Link>
);

const EntrepreneurSidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <motion.div 
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 w-[260px] h-screen bg-white flex flex-col z-30 border-r border-slate-100"
    >
      {/* Logo */}
      <div className="px-8 py-8">
        <Link to="/" className="flex items-center gap-3 no-underline group">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-200 transition-transform group-hover:scale-105 active:scale-95">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <div className="leading-none">
            <span className="text-slate-900 text-xl font-black tracking-tighter block">RouteX</span>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5 block">Entrepreneur</span>
          </div>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 px-4 mb-4">
          Main Menu
        </p>
        {navLinks.map((link) => (
          <SidebarLink
            key={link.to}
            to={link.to}
            icon={link.icon}
            label={link.label}
            active={isActive(link.to)}
          />
        ))}
      </nav>

      {/* User / Logout */}
      <div className="px-4 py-6 border-t border-slate-50 space-y-3">
        {/* User pill */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm font-black text-slate-700 shadow-sm shrink-0">
            E
          </div>
          <div className="min-w-0">
            <p className="text-slate-900 text-xs font-black truncate">Entrepreneur</p>
            <p className="text-slate-400 text-[10px] font-bold truncate">Premium Partner</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 text-xs font-black rounded-2xl transition-all duration-200 border border-transparent hover:border-red-100 group"
        >
          <LogOut size={16} className="transition-transform group-hover:translate-x-0.5" />
          LOGOUT SESSION
        </button>
      </div>
    </motion.div>
  );
};

export default EntrepreneurSidebar;