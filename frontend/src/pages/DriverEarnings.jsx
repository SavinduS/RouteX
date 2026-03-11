import React from "react";

const DriverEarnings = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px" }}>My Earnings</h1>
      <div style={{ 
        background: "white", 
        padding: "30px", 
        borderRadius: "12px", 
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        maxWidth: "600px"
      }}>
        <div style={{ marginBottom: "20px" }}>
          <p style={{ color: "#666", marginBottom: "5px" }}>Total Earnings</p>
          <h2 style={{ fontSize: "36px", color: "#1565C0", fontWeight: "bold" }}>LKR 0.00</h2>
        </div>
        
        <div style={{ borderTop: "1px solid #eee", paddingTop: "20px" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "15px" }}>Recent Transactions</h3>
          <p style={{ color: "#888", fontStyle: "italic" }}>No transactions found yet.</p>
        </div>
      </div>
    </div>
  );
};

export default DriverEarnings;
