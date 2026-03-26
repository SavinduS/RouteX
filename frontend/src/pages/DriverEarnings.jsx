import React, { useEffect, useState } from "react";
import { getDriverHistory } from "../services/deliveryService";

const DriverEarnings = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Default to today's date in YYYY-MM-DD format
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getDriverHistory();
        if (response.success) {
          setHistory(response.data);
          filterDataByDate(response.data, selectedDate);
        }
      } catch (error) {
        console.error("Error fetching earnings history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Filter history when date changes or when data is first loaded
  useEffect(() => {
    filterDataByDate(history, selectedDate);
  }, [selectedDate, history]);

  const filterDataByDate = (data, date) => {
    const filtered = data.filter(item => {
      const itemDate = new Date(item.completed_at).toISOString().split('T')[0];
      return itemDate === date;
    });
    
    setFilteredHistory(filtered);
    
    // Calculate daily total
    const total = filtered.reduce((sum, item) => sum + (item.driver_earnings || 0), 0);
    setDailyTotal(total);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px" }}>My Earnings</h1>
      
      {/* Date Filter Section */}
      <div style={{ 
        background: "white", 
        padding: "20px", 
        borderRadius: "12px", 
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        maxWidth: "800px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: "15px"
      }}>
        <label htmlFor="earning-date" style={{ fontWeight: "600", color: "#444" }}>Select Date:</label>
        <input 
          type="date" 
          id="earning-date"
          value={selectedDate}
          max={new Date().toISOString().split('T')[0]}
          onChange={handleDateChange}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #ddd",
            fontSize: "16px",
            outline: "none",
            cursor: "pointer"
          }}
        />
        {selectedDate === new Date().toISOString().split('T')[0] && (
          <span style={{ fontSize: "14px", color: "#1565C0", fontWeight: "500", background: "#E3F2FD", padding: "4px 10px", borderRadius: "20px" }}>
            Today
          </span>
        )}
      </div>

      {/* Daily Total Summary Card */}
      <div style={{ 
        background: "white", 
        padding: "30px", 
        borderRadius: "12px", 
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        maxWidth: "800px",
        marginBottom: "30px"
      }}>
        <div style={{ marginBottom: "5px" }}>
          <p style={{ color: "#666", marginBottom: "5px" }}>
            Total Earnings for <strong>{new Date(selectedDate).toLocaleDateString()}</strong>
          </p>
          <h2 style={{ fontSize: "36px", color: "#1565C0", fontWeight: "bold" }}>
            LKR {dailyTotal.toFixed(2)}
          </h2>
        </div>
      </div>

      {/* Daily Order History Table */}
      <div style={{ 
        background: "white", 
        padding: "30px", 
        borderRadius: "12px", 
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        maxWidth: "800px"
      }}>
        <h3 style={{ fontSize: "18px", marginBottom: "15px", fontWeight: "bold" }}>
          Orders on {new Date(selectedDate).toLocaleDateString()}
        </h3>
        
        {loading ? (
          <p>Loading records...</p>
        ) : filteredHistory.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ color: "#888", fontStyle: "italic", marginBottom: "10px" }}>No transactions found for this date.</p>
            <button 
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              style={{
                background: "none",
                border: "none",
                color: "#1565C0",
                textDecoration: "underline",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Back to Today
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #eee", textAlign: "left" }}>
                  <th style={{ padding: "12px 8px" }}>Order ID</th>
                  <th style={{ padding: "12px 8px" }}>Status</th>
                  <th style={{ padding: "12px 8px", textAlign: "right" }}>Your Earnings</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((order) => (
                  <tr key={order._id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                    <td style={{ padding: "12px 8px" }}>{order.readable_order_id}</td>
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
