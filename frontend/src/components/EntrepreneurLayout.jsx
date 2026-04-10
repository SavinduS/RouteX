import { Outlet } from "react-router-dom";
import EntrepreneurSidebar from "./EntrepreneurSidebar";
import { motion } from "framer-motion";

const EntrepreneurLayout = () => {
  return (
    <div className="flex bg-[#F8FAFC] min-h-screen">
      {/* Sidebar - Fixed width of 260px */}
      <EntrepreneurSidebar />

      {/* Main Content Area */}
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 ml-[260px]"
      >
        <div className="min-h-screen">
          <Outlet /> 
        </div>
      </motion.main>
    </div>
  );
};

export default EntrepreneurLayout;