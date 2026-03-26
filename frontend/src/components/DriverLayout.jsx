import { Outlet } from "react-router-dom";
import DriverSidebar from "./DriverSidebar";

const DriverLayout = () => {
  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar on the left */}
      <DriverSidebar />

      {/* Main content on the right */}
      <div style={{ 
        marginLeft: "250px", 
        width: "calc(100% - 250px)", 
        minHeight: "100vh", 
        background: "#f4f7f6",
        padding: "20px"
      }}>
        <Outlet /> 
      </div>
    </div>
  );
};

export default DriverLayout;
