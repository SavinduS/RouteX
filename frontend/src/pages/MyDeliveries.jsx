import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyDeliveries } from "../services/deliveryService";

const MyDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const token = localStorage.getItem('token') || "DUMMY_TOKEN"; 
        const data = await getMyDeliveries(token);
        
        // Backend එකෙන් එන response එක අනුව data.orders හෝ data ලබා ගනී
        setDeliveries(data.orders || data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch deliveries");
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  // Status එක අනුව Badge එකේ වර්ණය තීරණය කරන function එක
  const getStatusStyle = (status) => {
    switch (status) {
      case 'available': return { bg: '#FFF9C4', text: '#FBC02D' }; // කහ
      case 'assigned': return { bg: '#E3F2FD', text: '#1976D2' };  // නිල්
      case 'picked_up': return { bg: '#F3E5F5', text: '#7B1FA2' }; // දම්
      case 'in_transit': return { bg: '#E0F2F1', text: '#00796B' }; // කොළ ලා
      case 'delivered': return { bg: '#E8F5E9', text: '#2E7D32' };  // තද කොළ
      default: return { bg: '#F5F5F5', text: '#616161' };
    }
  };

  if (loading) return <h2 style={{ textAlign: "center", marginTop: "50px", color: "#1B5E20" }}>Loading Deliveries...</h2>;

  return (
    <div style={{ padding: "30px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      {/* Title සහ New Request බටන් එක */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <h1 style={{ color: "#1B5E20", fontSize: "24px", margin: 0 }}>My Delivery Requests</h1>
        <Link to="/entrepreneur/create-delivery">
          <button style={{ 
            padding: "12px 20px", 
            background: "#1B5E20", 
            color: "white", 
            border: "none", 
            borderRadius: "6px", 
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "15px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            + New Delivery Request
          </button>
        </Link>
      </div>

      {error && <p style={{ color: "red", textAlign: "center", background: "#FFEBEE", padding: "10px" }}>{error}</p>}

      {deliveries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", background: "#f9f9f9", borderRadius: "10px" }}>
           <p>No delivery requests found.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "10px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
            <thead>
              <tr style={{ background: "#E8F5E9", textAlign: "left" }}>
                <th style={{ padding: "15px", borderBottom: "2px solid #ddd" }}>Date</th>
                <th style={{ padding: "15px", borderBottom: "2px solid #ddd" }}>Order ID</th> {/* අලුත් Column එක */}
                <th style={{ padding: "15px", borderBottom: "2px solid #ddd" }}>Pickup Address</th>
                <th style={{ padding: "15px", borderBottom: "2px solid #ddd" }}>Dropoff Address</th>
                <th style={{ padding: "15px", borderBottom: "2px solid #ddd" }}>Vehicle</th>
                <th style={{ padding: "15px", borderBottom: "2px solid #ddd" }}>Status</th>
                <th style={{ padding: "15px", borderBottom: "2px solid #ddd" }}>Cost (LKR)</th>
                <th style={{ padding: "15px", borderBottom: "2px solid #ddd", textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => {
                const statusStyle = getStatusStyle(delivery.status);
                return (
                  <tr key={delivery._id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "15px" }}>{new Date(delivery.created_at).toLocaleDateString()}</td>
                    
                    {/* අලුත් Readable Order ID එක මෙතන පෙන්වයි */}
                    <td style={{ padding: "15px", fontWeight: "bold", color: "#333" }}>{delivery.order_id || "N/A"}</td>
                    
                    <td style={{ padding: "15px" }}>{delivery.pickup_address}</td>
                    <td style={{ padding: "15px" }}>{delivery.dropoff_address}</td>
                    <td style={{ padding: "15px", textTransform: "capitalize" }}>{delivery.vehicle_type}</td>
                    <td style={{ padding: "15px" }}>
                      <span style={{ 
                          padding: "5px 12px", 
                          borderRadius: "20px", 
                          fontSize: "11px", 
                          fontWeight: "bold",
                          background: statusStyle.bg, 
                          color: statusStyle.text,
                          textTransform: "uppercase",
                          display: "inline-block",
                          minWidth: "80px",
                          textAlign: "center"
                      }}>
                        {delivery.status}
                      </span>
                    </td>
                    <td style={{ padding: "15px", fontWeight: "600" }}>{delivery.total_cost.toLocaleString()} LKR</td>
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      <Link to={`/entrepreneur/track/${delivery._id}`}>
                        <button style={{ 
                          padding: "8px 14px", 
                          background: "#4CAF50", 
                          color: "white", 
                          border: "none", 
                          borderRadius: "4px", 
                          cursor: "pointer",
                          fontSize: "13px",
                          transition: "0.3s"
                        }}>
                          View Details
                        </button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyDeliveries;