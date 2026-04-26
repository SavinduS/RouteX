import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Coins,
  User,
  LogOut,
  Navigation,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DriverSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => {
    if (path === "/driver/dashboard" && (location.pathname === "/driver" || location.pathname === "/driver/dashboard")) return true;
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navLinks = [
    { to: "/driver/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/driver/available-orders", icon: Package, label: "Available Orders" },
    { to: "/driver/earnings", icon: Coins, label: "My Earnings" },
    { to: "/driver/profile", icon: User, label: "My Profile" },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-[1100] p-2 bg-[#1D4ED8] text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 z-[1001] backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 w-64 h-screen bg-[#1D4ED8] text-white flex flex-col z-[1002] shadow-2xl transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo Section */}
        <div className="p-8 flex items-center gap-3 border-b border-white/10">
          <div className="bg-[#06B6D4] p-2 rounded-xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <Navigation className="text-white" size={20} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white">RouteX</h1>
            <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest opacity-80">Driver Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative
                  ${active
                    ? "bg-white/10 text-white"
                    : "text-blue-100 hover:bg-white/5 hover:text-white"
                  }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-white rounded-xl z-0"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <link.icon
                  size={20}
                  className={`relative z-10 transition-colors duration-300 ${active ? "text-[#1D4ED8]" : "text-blue-200 group-hover:text-white"}`}
                />
                <span className={`relative z-10 transition-colors duration-300 ${active ? "text-[#1D4ED8]" : ""}`}>
                  {link.label}
                </span>
                {active && (
                  <span className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-[#1D4ED8]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Pill & Logout */}
        <div className="p-6 mt-auto border-t border-white/10 space-y-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 group cursor-default">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#1D4ED8] border-2 border-white/20 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
              D
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <p className="text-blue-200 text-[10px] truncate">Available</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-sm font-bold rounded-xl transition-all duration-300 group shadow-lg"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default DriverSidebar;
