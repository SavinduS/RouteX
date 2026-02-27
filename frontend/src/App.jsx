import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyDeliveries, sendInquiry } from "./services/deliveryService";

const EntrepreneurDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inTransit: 0, delivered: 0 });
  const [inquiry, setInquiry] = useState({ subject: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [formStatus, setFormStatus] = useState({ type: "", msg: "" });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token') || "DUMMY_TOKEN";
      const data = await getMyDeliveries(token);
      const orders = data.orders || data;

      // Stats ගණනය කිරීම
      const summary = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'available' || o.status === 'assigned').length,
        inTransit: orders.filter(o => o.status === 'picked_up' || o.status === 'in_transit').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
      };

      setStats(summary);
      setDeliveries(orders.slice(0, 5)); // අන්තිමට දාපු ඕඩර් 5ක් පෙන්වන්න
      setLoading(false);
    } catch (err) {
      console.error("Dashboard error:", err);
      setLoading(false);
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      // API call එකක් විදියට inquiry යවනවා
      await sendInquiry(inquiry, token); 
      
      setFormStatus({ type: "success", msg: "Your message sent to Admin!" });
      setInquiry({ subject: "", message: "" });
    } catch (err) {
      setFormStatus({ type: "error", msg: "Failed to send. Try again." });
    }
    setTimeout(() => setFormStatus({ type: "", msg: "" }), 4000);
  };

  if (loading) return <h2 style={{ textAlign: "center", marginTop: "50px", color: "#1B5E20" }}>Loading Dashboard...</h2>;

  return (
    <div style={{ padding: "30px", backgroundColor: "#f4f7f6", minHeight: "100vh" }}>
      
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ color: "#1B5E20", margin: 0 }}>Business Overview</h1>
        <p style={{ color: "#666" }}>Welcome back! Here is what's happening with your deliveries.</p>
      </div>

      {/* --- 1. Statistics Cards --- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <StatCard title="Total Requests" value={stats.total} icon="📦" color="#1976D2" />
        <StatCard title="Pending" value={stats.pending} icon="⏳" color="#FBC02D" />
        <StatCard title="In Transit" value={stats.inTransit} icon="🚚" color="#7B1FA2" />
        <StatCard title="Completed" value={stats.delivered} icon="✅" color="#2E7D32" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "30px" }}>
        
        {/* --- 2. Recent Deliveries Section --- */}
        <div style={{ background: "white", padding: "25px", borderRadius: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, color: "#333" }}>Recent Activity</h3>
            <Link to="/entrepreneur/my-deliveries" style={{ color: "#1B5E20", fontWeight: "bold", textDecoration: "none", fontSize: "14px" }}>View All →</Link>
          </div>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#888", borderBottom: "1px solid #eee" }}>
                  <th style={{ padding: "12px 0" }}>Order ID</th>
                  <th style={{ padding: "12px 0" }}>To</th>
                  <th style={{ padding: "12px 0" }}>Status</th>
                  <th style={{ padding: "12px 0" }}>Track</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((order) => (
                  <tr key={order._id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                    <td style={{ padding: "15px 0", fontWeight: "bold" }}>{order.order_id || "N/A"}</td>
                    <td style={{ padding: "15px 0" }}>{order.receiver_name}</td>
                    <td style={{ padding: "15px 0" }}>
                       <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '12px', backgroundColor: '#E8F5E9', color: '#2E7D32', textTransform: 'uppercase', fontWeight: 'bold' }}>
                          {order.status}
                       </span>
                    </td>
                    <td style={{ padding: "15px 0" }}>
                      <Link to={`/entrepreneur/track/${order._id}`} style={{ color: "#1B5E20", textDecoration: "none", fontSize: "13px", fontWeight: "600" }}>Live Map</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- 3. Inquiry / Contact Admin Section --- */}
        <div style={{ background: "#1B5E20", color: "white", padding: "30px", borderRadius: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginTop: 0 }}>Help & Support</h3>
          <p style={{ fontSize: "14px", opacity: 0.8, marginBottom: "25px" }}>
            Need help with a package or have a pricing question? Message our Admin team directly.
          </p>
          
          <form onSubmit={handleInquirySubmit}>
            <input 
              type="text" 
              placeholder="Subject (e.g. Delayed Order)" 
              required
              style={inputStyle}
              value={inquiry.subject}
              onChange={(e) => setInquiry({...inquiry, subject: e.target.value})}
            />
            <textarea 
              placeholder="Explain your issue..." 
              required
              rows="5"
              style={{ ...inputStyle, resize: "none" }}
              value={inquiry.message}
              onChange={(e) => setInquiry({...inquiry, message: e.target.value})}
            ></textarea>
            
            <button type="submit" style={buttonStyle}>
              Send to Admin
            </button>
          </form>

          {formStatus.msg && (
            <div style={{ 
              marginTop: "15px", 
              padding: "10px", 
              borderRadius: "5px", 
              backgroundColor: formStatus.type === "success" ? "#4CAF50" : "#f44336",
              textAlign: "center",
              fontSize: "13px"
            }}>
              {formStatus.msg}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// Sub-component for Statistic Cards
const StatCard = ({ title, value, icon, color }) => (
  <div style={{ 
    backgroundColor: "white", 
    padding: "20px", 
    borderRadius: "12px", 
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    borderLeft: `6px solid ${color}`
  }}>
    <div style={{ fontSize: "24px", marginBottom: "10px" }}>{icon}</div>
    <div style={{ color: "#888", fontSize: "14px", fontWeight: "600" }}>{title}</div>
    <div style={{ fontSize: "28px", fontWeight: "bold", color: "#333", marginTop: "5px" }}>{value}</div>
  </div>
);

// Styles
const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  color: "white",
  outline: "none",
  fontSize: "14px",
  border: "1px solid rgba(255,255,255,0.2)"
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "white",
  color: "#1B5E20",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "0.3s",
  fontSize: "15px"
};

export default EntrepreneurDashboard;