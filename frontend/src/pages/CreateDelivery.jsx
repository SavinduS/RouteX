import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDelivery } from '../services/deliveryService';

const CreateDelivery = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    user_id: "65d4f1a2e4b0d3c1a2f1b1a1", // පසුව මෙය Auth context එකෙන් ගත හැක
    receiver_name: '',
    receiver_phone: '',
    receiver_email: '',
    pickup_address: '',
    pickup_lat: 6.9271,
    pickup_lng: 79.8612,
    dropoff_address: '',
    dropoff_lat: 6.9134,
    dropoff_lng: 79.856,
    distance_km: 12.5,
    total_cost: 1500,
    vehicle_type: 'bike',
    package_size: 'small',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token') || "YOUR_JWT_TOKEN";
      await createDelivery(formData, token);
      alert("Delivery Request Created Successfully!");
      navigate('/entrepreneur/my-deliveries');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '750px', margin: '30px auto', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#1B5E20', marginBottom: '10px', textAlign: 'center' }}>New Delivery Request</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Enter delivery details to request a courier</p>
      
      <form onSubmit={handleSubmit}>
        
        {/* Receiver Details Section */}
        <h3 style={sectionTitle}>Receiver Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>Receiver Name</label>
            <input
              type="text"
              name="receiver_name"
              placeholder="Kamal Perera"
              value={formData.receiver_name}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Receiver Phone</label>
            <input
              type="text"
              name="receiver_phone"
              placeholder="07XXXXXXXX"
              value={formData.receiver_phone}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Receiver Email</label>
          <input
            type="email"
            name="receiver_email"
            placeholder="customer@example.com"
            value={formData.receiver_email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        {/* Location Section */}
        <h3 style={sectionTitle}>Route Details</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>Pickup Address</label>
          <input
            type="text"
            name="pickup_address"
            placeholder="Address where the courier should pick up"
            value={formData.pickup_address}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Dropoff Address</label>
          <input
            type="text"
            name="dropoff_address"
            placeholder="Customer's delivery address"
            value={formData.dropoff_address}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        {/* Package & Vehicle Section */}
        <h3 style={sectionTitle}>Package Info</h3>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Vehicle Type</label>
            <select name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} style={inputStyle}>
              <option value="bike">Bike (Fastest)</option>
              <option value="tuktuk">TukTuk</option>
              <option value="van">Van</option>
              <option value="truck">Truck (Heavy)</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Package Size</label>
            <select name="package_size" value={formData.package_size} onChange={handleChange} style={inputStyle}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>

        {/* Cost Summary Box */}
        <div style={{ background: '#F1F8E9', padding: '15px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #C8E6C9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ color: '#555' }}>Estimated Distance:</span>
            <span style={{ fontWeight: 'bold' }}>{formData.distance_km} km</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', color: '#1B5E20' }}>
            <span>Total Estimated Cost:</span>
            <span style={{ fontWeight: 'bold' }}>LKR {formData.total_cost.toLocaleString()}</span>
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              onClick={() => navigate('/entrepreneur/my-deliveries')}
              style={{ flex: 1, padding: '14px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                flex: 2, padding: '14px', background: '#1B5E20', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              {loading ? 'Submitting Request...' : 'Confirm & Request Courier'}
            </button>
        </div>
      </form>

      {error && (
        <div style={{ background: '#FFEBEE', color: '#D32F2F', padding: '10px', borderRadius: '6px', marginTop: '20px', textAlign: 'center', fontWeight: 'bold' }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

// --- Styles Define කිරීම (මෙය වැදගත්) ---
const sectionTitle = { borderBottom: '2px solid #E8F5E9', paddingBottom: '10px', color: '#2E7D32', marginTop: '25px' };
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' };
const inputStyle = { 
  width: '100%', 
  padding: '12px', 
  borderRadius: '6px', 
  border: '1px solid #ccc', 
  boxSizing: 'border-box',
  fontSize: '14px'
};

export default CreateDelivery;