import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import Footer from './Footer';
import { motion } from 'framer-motion';

const AdminLayout = () => {
    return (
        <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
            
            {/* 1. Fixed Sidebar - මෙයට Toggle logic අවශ්‍ය නැත */}
            <aside className="w-64 h-full hidden md:block shrink-0">
                <AdminSidebar />
            </aside>

            {/* 2. Main Scrollable Area */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
                
                {/* Fixed Header at the top of scroll area */}
                <AdminHeader />
                
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