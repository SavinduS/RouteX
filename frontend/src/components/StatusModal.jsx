import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, ShieldAlert } from 'lucide-react';

const StatusModal = ({ isOpen, onClose, message, title = "Action Restricted" }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* Backdrop with intense blur */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        />

        {/* Modal Card */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
        >
          {/* Decorative Top Bar */}
          <div className="h-2 bg-amber-500 w-full" />

          <div className="p-8 flex flex-col items-center text-center">
            {/* Icon Circle */}
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6 shadow-inner">
              <ShieldAlert size={40} />
            </div>

            {/* Text Content */}
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-3">
              {title}
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
              {message}
            </p>

            {/* Action Button */}
            <button
              onClick={onClose}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Understand & Close
            </button>
          </div>

          {/* Close Icon (Optional top-right) */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StatusModal;
