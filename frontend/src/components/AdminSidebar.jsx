import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, UserCheck, Settings, LogOut } from 'lucide-react';

const AdminSidebar = () => {
    const navLinkClasses = ({ isActive }) =>
        `flex items-center space-x-3 p-3 rounded-lg transition ${
            isActive ? 'bg-[#A5D6A7] text-black' : 'hover:bg-[#A5D6A7] hover:text-black'
        }`;

    return (
        <div className="h-screen w-64 bg-[#1B5E20] text-white flex flex-col p-5 shadow-xl">
            <h1 className="text-2xl font-bold mb-10 text-center">RouteX Admin</h1>
            <nav className="flex-1 space-y-4">
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
            <button className="flex items-center space-x-3 p-3 mt-auto text-red-400 hover:text-red-200">
                <LogOut size={20} /> <span>Logout</span>
            </button>
        </div>
    );
};

export default AdminSidebar;