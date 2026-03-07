import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

const UpdateDelivery = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        receiver_name: "",
        receiver_phone: "",
        receiver_email: "",
        package_size: ""
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Fetch current order details to pre-fill the form
    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const res = await API.get(`/deliveries/${id}/track`);
                const order = res.data.order;

                // Security Check: Only allow editing if status is 'available'
                if (order.status !== "available") {
                    alert("This order is already in progress and cannot be edited.");
                    navigate("/entrepreneur/my-deliveries");
                    return;
                }

                setFormData({
                    receiver_name: order.receiver_name,
                    receiver_phone: order.receiver_phone,
                    receiver_email: order.receiver_email,
                    package_size: order.package_size
                });
                setLoading(false);
            } catch (err) {
                setError("Failed to load order details.");
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [id, navigate]);

    // 2. Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. Submit updated data to Backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/deliveries/${id}`, formData);
            alert("Order updated successfully!");
            navigate(`/entrepreneur/track/${id}`); // Go back to track page
        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        }
    };

    if (loading) return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading Data...</p>;

    return (
        <div style={{ maxWidth: "600px", margin: "50px auto", padding: "30px", background: "#fff", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
            <h2 style={{ color: "#1B5E20", borderBottom: "2px solid #E8F5E9", paddingBottom: "10px" }}>Edit Order Details</h2>
            
            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
                
                <div>
                    <label>Receiver Name:</label>
                    <input 
                        type="text" name="receiver_name" value={formData.receiver_name} 
                        onChange={handleChange} required 
                        style={inputStyle} 
                    />
                </div>

                <div>
                    <label>Receiver Phone:</label>
                    <input 
                        type="text" name="receiver_phone" value={formData.receiver_phone} 
                        onChange={handleChange} required 
                        style={inputStyle} 
                    />
                </div>

                <div>
                    <label>Receiver Email:</label>
                    <input 
                        type="email" name="receiver_email" value={formData.receiver_email} 
                        onChange={handleChange} required 
                        style={inputStyle} 
                    />
                </div>

                <div>
                    <label>Package Size:</label>
                    <select name="package_size" value={formData.package_size} onChange={handleChange} style={inputStyle}>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button type="submit" style={{ flex: 1, background: "#1B5E20", color: "#fff", padding: "12px", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                        Save Changes
                    </button>
                    <button type="button" onClick={() => navigate(-1)} style={{ flex: 1, background: "#ccc", color: "#333", padding: "12px", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

const inputStyle = {
    width: "100%",
    padding: "10px",
    marginTop: "5px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    fontSize: "15px"
};

export default UpdateDelivery;