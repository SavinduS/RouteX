import { useState } from "react";
import { Outlet } from "react-router-dom";
import EntrepreneurSidebar from "./EntrepreneurSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const EntrepreneurLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen relative">
      
      {/* --- Mobile Header --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <span className="text-white font-black text-xs">RX</span>
          </div>
          <span className="font-black text-slate-900 tracking-tighter">RouteX</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- Sidebar Overlay (Mobile) --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* --- Sidebar --- */}
      <div className={`fixed inset-y-0 left-0 z-[50] lg:z-30 transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <EntrepreneurSidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* --- Main Content Area --- */}
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 w-full lg:ml-[260px] pt-16 lg:pt-0"
      >
        <div className="min-h-screen">
          <Outlet /> 
        </div>
      </motion.main>
    </div>
  );
};

export default EntrepreneurLayout;