import React, { useEffect, useState } from "react";
import { getDriverHistory } from "../services/deliveryService";

const DriverEarnings = () => {
  const [history, setHistory] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getDriverHistory();
        if (response.success) {
          setHistory(response.data);
          
          // Calculate total earnings
          const total = response.data.reduce((sum, item) => sum + (item.driver_earnings || 0), 0);
          setTotalEarnings(total);
        }
      } catch (error) {
        console.error("Error fetching earnings history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px" }}>My Earnings</h1>
      
      <div style={{ 
        background: "white", 
        padding: "30px", 
        borderRadius: "12px", 
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        maxWidth: "800px",
        marginBottom: "30px"
      }}>
        <div style={{ marginBottom: "20px" }}>
          <p style={{ color: "#666", marginBottom: "5px" }}>Total Earnings</p>
          <h2 style={{ fontSize: "36px", color: "#1565C0", fontWeight: "bold" }}>
            LKR {totalEarnings.toFixed(2)}
          </h2>
        </div>
      </div>

      <div style={{ 
        background: "white", 
        padding: "30px", 
        borderRadius: "12px", 
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        maxWidth: "800px"
      }}>
        <h3 style={{ fontSize: "18px", marginBottom: "15px", fontWeight: "bold" }}>Order History</h3>
        
        {loading ? (
          <p>Loading history...</p>
        ) : history.length === 0 ? (
          <p style={{ color: "#888", fontStyle: "italic" }}>No transactions found yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #eee", textAlign: "left" }}>
                  <th style={{ padding: "12px 8px" }}>Order ID</th>
                  <th style={{ padding: "12px 8px" }}>Date</th>
                  <th style={{ padding: "12px 8px" }}>Status</th>
                  <th style={{ padding: "12px 8px", textAlign: "right" }}>Total Cost</th>
                  <th style={{ padding: "12px 8px", textAlign: "right" }}>Your Earnings</th>
                </tr>
              </thead>
              <tbody>
                {history.map((order) => (
                  <tr key={order._id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                    <td style={{ padding: "12px 8px" }}>{order.readable_order_id}</td>
                    <td style={{ padding: "12px 8px" }}>
                      {new Date(order.completed_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <span style={{ 
                        background: "#E8F5E9", 
                        color: "#2E7D32", 
                        padding: "4px 8px", 
                        borderRadius: "4px",
                        fontSize: "12px",
                        textTransform: "capitalize"
                      }}>
                        {order.final_status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "right" }}>LKR {order.total_cost.toFixed(2)}</td>
                    <td style={{ padding: "12px 8px", textAlign: "right", color: "#1565C0", fontWeight: "bold" }}>
                      LKR {order.driver_earnings.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverEarnings;
