import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, UserCheck, Settings, LogOut, Navigation, X } from 'lucide-react';

const AdminSidebar = ({ mobile, onNavItemClick }) => {
    const navigate = useNavigate();

    const navLinkClasses = ({ isActive }) =>
        `flex items-center space-x-3 p-4 mx-3 rounded-2xl transition-all duration-300 group ${
            isActive
                ? 'bg-[#06B6D4] text-white shadow-lg shadow-black/10 font-bold'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event("storage"));
        navigate('/'); 
        if (onNavItemClick) onNavItemClick();
    };

    const handleLinkClick = () => {
        if (onNavItemClick) onNavItemClick();
    };

    return (
        <div className="h-full w-full bg-[#1D4ED8] text-white flex flex-col shadow-2xl relative">
            {/* Close button for mobile */}
            {mobile && (
                <button 
                    onClick={onNavItemClick}
                    className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                    <X size={20} />
                </button>
            )}

            {/* Logo Section */}
            <div className="p-8 flex items-center gap-3">
                <div className="bg-[#06B6D4] p-2 rounded-xl">
                    <Navigation className="text-[#1D4ED8]" size={20} fill="currentColor" />
                </div>
                <h1 className="text-2xl font-black tracking-tighter text-white">RouteX</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 mt-4">
                <NavLink to="/admin" end className={navLinkClasses} onClick={handleLinkClick}>
                    <LayoutDashboard size={20} /> <span>Analytics</span>
                </NavLink>
                <NavLink to="/admin/orders" className={navLinkClasses} onClick={handleLinkClick}>
                    <ShoppingCart size={20} /> <span>Orders</span>
                </NavLink>
                <NavLink to="/admin/entrepreneurs" className={navLinkClasses} onClick={handleLinkClick}>
                    <Users size={20} /> <span>Entrepreneurs</span>
                </NavLink>
                <NavLink to="/admin/couriers" className={navLinkClasses} onClick={handleLinkClick}>
                    <UserCheck size={20} /> <span>Couriers</span>
                </NavLink>
                <NavLink to="/admin/pricing" className={navLinkClasses} onClick={handleLinkClick}>
                    <Settings size={20} /> <span>Pricing Rules</span>
                </NavLink>
            </nav>

            {/* Bottom Section - Logout */}
            <div className="p-6 mt-auto border-t border-white/10">
                <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-3 p-4 w-full rounded-2xl bg-white/10 text-white hover:bg-red-500 hover:text-white transition-all font-bold text-sm"
                >
                    <LogOut size={18} /> <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;