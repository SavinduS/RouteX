import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="flex h-screen bg-[#F1F5F9] overflow-hidden">
            
            {/* Desktop Sidebar */}
            <aside className="w-64 h-full hidden md:block shrink-0 border-r border-gray-200">
                <AdminSidebar />
            </aside>

            {/* Mobile Sidebar Overlay (Drawer) */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        {/* Background Overlay */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        />
                        {/* Sidebar Content */}
                        <motion.aside 
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 bottom-0 w-64 z-50 md:hidden"
                        >
                            <AdminSidebar mobile onNavItemClick={() => setSidebarOpen(false)} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Scrollable Area */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
                
                {/* Fixed Header */}
                <AdminHeader toggleSidebar={toggleSidebar} />
                
                {/* Content Area */}
                <main className="flex-1 p-4 md:p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;