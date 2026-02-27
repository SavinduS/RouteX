import { Outlet } from "react-router-dom";
import EntrepreneurSidebar from "./EntrepreneurSidebar";

const EntrepreneurLayout = () => {
  return (
    <div style={{ display: "flex" }}>
      {/* වම් පැත්තේ Sidebar එක */}
      <EntrepreneurSidebar />

      {/* දකුණු පැත්තේ පිටුවේ අන්තර්ගතය (Content) */}
      <div style={{ marginLeft: "250px", width: "calc(100% - 250px)", minHeight: "100vh", background: "#f4f7f6" }}>
        <Outlet /> 
      </div>
    </div>
  );
};

export default EntrepreneurLayout;