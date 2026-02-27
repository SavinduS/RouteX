import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyDeliveries, sendInquiry } from "../services/deliveryService";

const EntrepreneurDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inTransit: 0, delivered: 0 });
  const [inquiry, setInquiry] = useState({ subject: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await getMyDeliveries(token);
      const orders = data.orders || data;

      setStats({
        total: orders.length,
        pending: orders.filter(o => o.status === 'available').length,
        inTransit: orders.filter(o => ['assigned', 'picked_up', 'in_transit'].includes(o.status)).length,
        delivered: orders.filter(o => o.status === 'delivered').length,
      });
      setDeliveries(orders.slice(0, 5));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleInquiry = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: "", text: "Sending..." });

    try {
      const token = localStorage.getItem('token');
      await sendInquiry(inquiry, token);
      
      setStatusMsg({ type: "success", text: "Inquiry sent to Admin successfully!" });
      setInquiry({ subject: "", message: "" });
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to send message.";
      setStatusMsg({ type: "error", text: errorMsg });
    }
    setTimeout(() => setStatusMsg({ type: "", text: "" }), 5000);
  };

  if (loading) return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Loading...</h2>;

  return (
    <div style={{ padding: "30px", backgroundColor: "#f4f7f6", minHeight: "100vh" }}>
      <h1 style={{ color: "#1B5E20" }}>Entrepreneur Dashboard</h1>

      {/* Stats Section */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <div style={statBox}>{stats.total} <br/> <span>Total</span></div>
        <div style={statBox}>{stats.pending} <br/> <span>Pending</span></div>
        <div style={statBox}>{stats.inTransit} <br/> <span>In Transit</span></div>
        <div style={statBox}>{stats.delivered} <br/> <span>Delivered</span></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "30px" }}>
        
        {/* Recent Orders Table */}
        <div style={{ background: "white", padding: "20px", borderRadius: "10px" }}>
          <h3>Recent Orders</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #eee", textAlign: "left" }}>
                <th style={{ padding: "10px" }}>Order ID</th>
                <th style={{ padding: "10px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map(o => (
                <tr key={o._id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                  <td style={{ padding: "10px" }}>{o.order_id || "N/A"}</td>
                  <td style={{ padding: "10px", color: "green" }}>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to="/entrepreneur/my-deliveries"><button style={{marginTop: '15px', padding: '10px 15px', cursor: 'pointer'}}>View All Deliveries</button></Link>
        </div>

        {/* Inquiry Form */}
        <div style={{ background: "#1B5E20", color: "white", padding: "25px", borderRadius: "15px" }}>
          <h3>Help & Support</h3>
          <form onSubmit={handleInquiry}>
            <input 
              style={inputStyle} 
              placeholder="Subject" 
              value={inquiry.subject}
              onChange={e => setInquiry({...inquiry, subject: e.target.value})}
              required
            />
            <textarea 
              style={{ ...inputStyle, height: "100px" }} 
              placeholder="Describe your issue..." 
              value={inquiry.message}
              onChange={e => setInquiry({...inquiry, message: e.target.value})}
              required
            />
            <button type="submit" style={btnStyle}>Send to Admin</button>
          </form>
          {statusMsg.text && (
            <div style={{ 
              marginTop: "10px", 
              padding: "10px", 
              backgroundColor: statusMsg.type === "success" ? "#4CAF50" : "#f44336",
              borderRadius: "5px",
              textAlign: "center"
            }}>
              {statusMsg.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// CSS Styles
const statBox = { background: "white", padding: "20px", borderRadius: "10px", flex: 1, textAlign: "center", fontWeight: "bold", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" };
const inputStyle = { width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "5px", border: "none",color: "#000000", // මෙතනට කළු පාට (Black) එකතු කළා
  backgroundColor: "#ffffff" };
const btnStyle = { width: "100%", padding: "12px", background: "white", color: "#1B5E20", fontWeight: "bold", border: "none", cursor: "pointer", borderRadius: "5px" };

export default EntrepreneurDashboard;