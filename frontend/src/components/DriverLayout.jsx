import React from 'react';
import { Outlet } from 'react-router-dom';
import DriverSidebar from './DriverSidebar';
import { motion } from 'framer-motion';

const DriverLayout = () => {
    return (
        <div className="flex h-screen bg-[#F4F7FE] overflow-hidden">
            
            {/* Sidebar */}
            <aside className="w-64 h-full hidden md:block shrink-0">
                <DriverSidebar />
            </aside>

            {/* Main Scrollable Area */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto">
                
                {/* Header can be added here if needed */}
                <header className="bg-white shadow-sm p-4 md:px-8 flex justify-between items-center shrink-0">
                   <h2 className="text-xl font-bold text-gray-800">Driver Portal</h2>
                   <div className="flex items-center gap-4">
                       {/* Profile or notifications could go here */}
                   </div>
                </header>
                
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

export default DriverLayout;
