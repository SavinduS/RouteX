import { Outlet } from "react-router-dom";
import DriverSidebar from "./DriverSidebar";

const DriverLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#f4f7f6]">
      {/* Sidebar on the left */}
      <DriverSidebar />

      {/* Main content on the right */}
      <main className="flex-1 transition-all duration-300 md:ml-64 p-4 md:p-8 pt-20 md:pt-8">
        <div className="max-w-7xl mx-auto">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default DriverLayout;
