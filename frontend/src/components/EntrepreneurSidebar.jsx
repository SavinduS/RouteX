import { Link, useLocation } from "react-router-dom";

const EntrepreneurSidebar = () => {
  const location = useLocation();

  // Active පිටුව හඳුනා ගැනීමට ලේසියි
  const isActive = (path) => location.pathname === path;

  return (
    <div style={sidebarStyle}>
      <h2 style={{ color: "white", textAlign: "center", marginBottom: "30px" }}>RouteX</h2>
      
      <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <SidebarLink to="/entrepreneur/dashboard" icon="📊" label="Dashboard" active={isActive("/entrepreneur/dashboard")} />
        <SidebarLink to="/entrepreneur/create-delivery" icon="➕" label="New Delivery" active={isActive("/entrepreneur/create-delivery")} />
        <SidebarLink to="/entrepreneur/my-deliveries" icon="📦" label="My Deliveries" active={isActive("/entrepreneur/my-deliveries")} />
      </nav>

      <div style={{ marginTop: "auto" }}>
        <button onClick={() => {localStorage.clear(); window.location.href="/login"}} style={logoutBtn}>Logout</button>
      </div>
    </div>
  );
};

// කුඩා Helper Component එකක් ලින්ක්ස් සඳහා
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
  width: "250px", height: "100vh", background: "#1B5E20", color: "white",
  padding: "20px", display: "flex", flexDirection: "column", position: "fixed", left: 0, top: 0
};

const linkStyle = { color: "white", textDecoration: "none", padding: "12px", borderRadius: "8px", fontSize: "16px", transition: "0.3s" };
const logoutBtn = { width: "100%", padding: "10px", background: "#f44336", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" };

export default EntrepreneurSidebar;