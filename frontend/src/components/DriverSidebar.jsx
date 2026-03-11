import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, List, MapPin, LogOut, Navigation, User } from 'lucide-react';

const DriverSidebar = () => {
    const navigate = useNavigate();

    const navLinkClasses = ({ isActive }) =>
        `flex items-center space-x-3 p-4 mx-3 rounded-2xl transition-all duration-300 group ${
            isActive
                ? 'bg-[#E3F2FD] text-[#0D47A1] shadow-lg shadow-black/10 font-bold'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event("storage"));
        navigate('/'); 
    };

    return (
        <div className="h-full w-64 bg-[#0D47A1] text-white flex flex-col shadow-2xl">
            {/* Logo Section */}
            <div className="p-8 flex items-center gap-3">
                <div className="bg-[#E3F2FD] p-2 rounded-xl">
                    <Navigation className="text-[#0D47A1]" size={20} fill="currentColor" />
                </div>
                <h1 className="text-2xl font-black tracking-tighter">RouteX</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 mt-4">
                <NavLink to="/driver" end className={navLinkClasses}>
                    <LayoutDashboard size={20} /> <span>Dashboard</span>
                </NavLink>
                <NavLink to="/driver/profile" className={navLinkClasses}>
                    <User size={20} /> <span>Profile</span>
                </NavLink>
            </nav>

            {/* Bottom Section */}
            <div className="p-6 mt-auto border-t border-white/10">
                <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-3 p-4 w-full rounded-2xl text-red-300 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold text-sm"
                >
                    <LogOut size={18} /> <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default DriverSidebar;
