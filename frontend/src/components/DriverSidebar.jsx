import { Link, useLocation, useNavigate } from "react-router-dom";

const DriverSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={sidebarStyle}>
      <h2 style={{ color: "white", textAlign: "center", marginBottom: "30px" }}>RouteX Driver</h2>
      
      <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <SidebarLink 
          to="/driver/dashboard" 
          icon="📊" 
          label="Dashboard" 
          active={isActive("/driver/dashboard") || isActive("/driver")} 
        />
        <SidebarLink 
          to="/driver/earnings" 
          icon="💰" 
          label="My Earnings" 
          active={isActive("/driver/earnings")} 
        />
        <SidebarLink 
          to="/driver/profile" 
          icon="👤" 
          label="My Profile" 
          active={isActive("/driver/profile")} 
        />
      </nav>

      <div style={{ marginTop: "auto" }}>
        <button onClick={handleLogout} style={logoutBtn}>Logout</button>
      </div>
    </div>
  );
};

const SidebarLink = ({ to, icon, label, active }) => (
  <Link to={to} style={{
    ...linkStyle,
    backgroundColor: active ? "rgba(255,255,255,0.2)" : "transparent",
    fontWeight: active ? "bold" : "normal"
  }}>
    <span style={{ marginRight: "10px" }}>{icon}</span> {label}
  </Link>
);

const sidebarStyle = {
  width: "250px", 
  height: "100vh", 
  background: "#1565C0", // Different color for Driver (Blue)
  color: "white",
  padding: "20px", 
  display: "flex", 
  flexDirection: "column", 
  position: "fixed", 
  left: 0, 
  top: 0,
  zIndex: 1000
};

const linkStyle = { 
  color: "white", 
  textDecoration: "none", 
  padding: "12px", 
  borderRadius: "8px", 
  fontSize: "16px", 
  transition: "0.3s",
  display: "flex",
  alignItems: "center"
};

const logoutBtn = { 
  width: "100%", 
  padding: "10px", 
  background: "#f44336", 
  color: "white", 
  border: "none", 
  borderRadius: "5px", 
  cursor: "pointer",
  fontWeight: "bold"
};

export default DriverSidebar;
