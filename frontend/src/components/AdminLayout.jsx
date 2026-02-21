import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const sidebarVariants = {
        open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar for Desktop */}
            <div className="hidden md:flex">
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            <AdminSidebar />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Sidebar for Mobile */}
            <div className="md:hidden">
                <AnimatePresence>
                    {isSidebarOpen && (
                        <>
                            {/* Overlay */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black z-30"
                                onClick={toggleSidebar}
                            />
                            <motion.div
                                className="fixed top-0 left-0 h-full z-40"
                                variants={sidebarVariants}
                                initial="closed"
                                animate="open"
                                exit="closed"
                            >
                                <AdminSidebar />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>


            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F9FAFB] p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
