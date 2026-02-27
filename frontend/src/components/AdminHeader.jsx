import React from 'react';
import { Bell, UserCircle } from 'lucide-react';

const AdminHeader = () => {
    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 py-5 sticky top-0 z-30">
            <div>
                <h1 className="text-sm font-black text-gray-800 uppercase tracking-[0.3em]">
                    Admin Panel
                </h1>
            </div>

            {/* Right side Actions */}
            <div className="flex items-center gap-6">
                <button className="p-2 text-gray-400 hover:text-[#1B5E20] relative transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                
                <div className="h-8 w-[1px] bg-gray-100"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-gray-800">Savindu S.</p>
                        <p className="text-[9px] text-[#1B5E20] font-bold uppercase tracking-tighter">System Admin</p>
                    </div>
                    <div className="bg-[#1B5E20] p-2 rounded-full text-white shadow-lg shadow-green-100">
                        <UserCircle size={22} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;