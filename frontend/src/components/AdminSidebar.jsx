import { NavLink, useNavigate } from 'react-router-dom'; // 1. useNavigate import කරන්න
import { LayoutDashboard, ShoppingCart, Users, UserCheck, Settings, LogOut, Navigation } from 'lucide-react';

const AdminSidebar = () => {
    const navigate = useNavigate(); // 2. Navigate function එක ලෑස්ති කරගන්න

    const navLinkClasses = ({ isActive }) =>
        `flex items-center space-x-3 p-4 mx-3 rounded-2xl transition-all duration-300 group ${
            isActive
                ? 'bg-[#A5D6A7] text-[#1B5E20] shadow-lg shadow-black/10 font-bold'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`;

    // 3. Logout Function එක
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event("storage"));
        
        // සාර්ථකව Logout වුණු බව හැඟවීමට root එකට (Login page එකට) යැවීම
        navigate('/'); 
    };

    return (
        <div className="h-full w-64 bg-[#1B5E20] text-white flex flex-col shadow-2xl">
            {/* Logo Section */}
            <div className="p-8 flex items-center gap-3">
                <div className="bg-[#A5D6A7] p-2 rounded-xl">
                    <Navigation className="text-[#1B5E20]" size={20} fill="currentColor" />
                </div>
                <h1 className="text-2xl font-black tracking-tighter">RouteX</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 mt-4">
                <NavLink to="/admin" end className={navLinkClasses}>
                    <LayoutDashboard size={20} /> <span>Analytics</span>
                </NavLink>
                <NavLink to="/admin/orders" className={navLinkClasses}>
                    <ShoppingCart size={20} /> <span>Orders</span>
                </NavLink>
                <NavLink to="/admin/entrepreneurs" className={navLinkClasses}>
                    <Users size={20} /> <span>Entrepreneurs</span>
                </NavLink>
                <NavLink to="/admin/couriers" className={navLinkClasses}>
                    <UserCheck size={20} /> <span>Couriers</span>
                </NavLink>
                <NavLink to="/admin/pricing" className={navLinkClasses}>
                    <Settings size={20} /> <span>Pricing Rules</span>
                </NavLink>
            </nav>

            {/* Bottom Section - මෙතන තමයි onClick එක දාන්නේ */}
            <div className="p-6 mt-auto border-t border-white/10">
                <button 
                    onClick={handleLogout} // 4. Function එක මෙතනට ලින්ක් කරන්න
                    className="flex items-center space-x-3 p-4 w-full rounded-2xl text-red-300 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold text-sm"
                >
                    <LogOut size={18} /> <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;