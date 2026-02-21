import React from 'react';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminHeader = ({ toggleSidebar, isSidebarOpen }) => {
    return (
        <header className="bg-white shadow-sm flex items-center justify-between p-4">
            {/* Hamburger Menu for Mobile */}
            <div className="md:hidden">
                <button onClick={toggleSidebar}>
                    <Menu size={24} />
                </button>
            </div>

            {/* Toggle for Desktop */}
            <div className="hidden md:block">
                <motion.button
                    onClick={toggleSidebar}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.button>
            </div>

            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            <div /> {/* Spacer */}
        </header>
    );
};

export default AdminHeader;
