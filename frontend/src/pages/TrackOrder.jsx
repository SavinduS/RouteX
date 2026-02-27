import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";

const TrackOrder = () => {
  const { id } = useParams(); // URL එකේ තියෙන MongoDB ObjectId එක ගන්නවා
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await API.get(`/deliveries/${id}/track`);
        setData(res.data);
      } catch (err) {
        console.error("Tracking error", err);
      }
    };
    fetchTracking();
    const interval = setInterval(fetchTracking, 10000); 
    return () => clearInterval(interval);
  }, [id]);

  if (!data) return <p style={{textAlign: 'center', marginTop: '50px'}}>Loading Live Tracking...</p>;

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "auto", fontFamily: "sans-serif" }}>
      <Link to="/entrepreneur/my-deliveries" style={{textDecoration: 'none', color: '#1B5E20', fontWeight: 'bold'}}>← Back to List</Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '20px' }}>
        <div>
          <h2 style={{ color: "#1B5E20", margin: 0 }}>Order Tracking Dashboard</h2>
          {/* මෙතන අපි අලුතින් හදපු Readable Order ID එක පෙන්වනවා */}
          <p style={{ margin: "5px 0 0 0", fontSize: "16px", color: "#333" }}>
            Order ID: <span style={{ fontWeight: "bold", color: "#1B5E20" }}>{data.order.order_id || data.order._id}</span>
          </p>
        </div>
        <span style={{ 
          padding: '8px 15px', 
          background: '#E8F5E9', 
          color: '#2E7D32', 
          borderRadius: '20px', 
          fontWeight: 'bold',
          textTransform: 'uppercase',
          fontSize: '12px'
        }}>
          {data.order.status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        {/* Delivery Summary Box */}
        <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "10px", border: '1px solid #eee' }}>
          <h4 style={{marginTop: 0, borderBottom: '1px solid #ddd', paddingBottom: '10px', color: '#333'}}>Delivery Summary</h4>
          <p><strong>Order ID:</strong> {data.order.order_id || "Processing..."}</p>
          <p><strong>To:</strong> {data.order.receiver_name} ({data.order.receiver_phone})</p>
          <p><strong>Pickup:</strong> {data.order.pickup_address}</p>
          <p><strong>Dropoff:</strong> {data.order.dropoff_address}</p>
          <p><strong>Package Size:</strong> <span style={{textTransform: 'capitalize'}}>{data.order.package_size}</span></p>
          <p><strong>Total Cost:</strong> LKR {data.order.total_cost.toLocaleString()}</p>
          
          {/* පරණ MongoDB ID එක System Ref එකක් විදියට යටින් පෙන්වමු */}
          <p style={{ fontSize: '11px', color: '#999', marginTop: '15px', borderTop: '1px dashed #ddd', paddingTop: '10px' }}>
            System Ref: {data.order._id}
          </p>
        </div>

        {/* Courier Status Box */}
        <div style={{ background: "#E8F5E9", padding: "20px", borderRadius: "10px", border: '1px solid #C8E6C9' }}>
          <h4 style={{marginTop: 0, borderBottom: '1px solid #C8E6C9', paddingBottom: '10px', color: '#2E7D32'}}>Courier Status</h4>
          {data.driverLocation ? (
            <>
              <p><strong>Current Lat:</strong> {data.driverLocation.lat}</p>
              <p><strong>Current Lng:</strong> {data.driverLocation.lng}</p>
              <p><strong>Driver Status:</strong> 
                <span style={{
                  marginLeft: '10px',
                  color: data.driverLocation.driver_status === 'online' ? '#2E7D32' : '#C62828', 
                  fontWeight: 'bold'
                }}>
                  {data.driverLocation.driver_status.toUpperCase()}
                </span>
              </p>
              <p style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>
                Last Updated: {new Date(data.driverLocation.recorded_at).toLocaleTimeString()}
              </p>
            </>
          ) : (
            <div style={{textAlign: 'center', padding: '20px'}}>
              <p style={{color: '#666', fontSize: '14px'}}>Driver has not started sharing location yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Map Placeholder */}
      <div style={{ 
        height: "350px", 
        background: "#f0f0f0", 
        marginTop: "20px", 
        borderRadius: "10px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        border: '2px dashed #ccc',
        position: 'relative',
        overflow: 'hidden'
      }}>
         <div style={{textAlign: 'center', zIndex: 1}}>
            <p style={{fontSize: '50px', margin: 0}}>📍</p>
            <p style={{fontWeight: 'bold', color: '#555', margin: '5px 0'}}>Live Map View</p>
            <p style={{fontSize: '12px', color: '#888'}}>
              Tracking Driver at: {data.driverLocation?.lat || '0.0000'}, {data.driverLocation?.lng || '0.0000'}
            </p>
         </div>
         {/* Map එකක් වගේ පෙනෙන්න පොඩි background grid එකක් (Optional) */}
         <div style={{
           position: 'absolute',
           width: '100%',
           height: '100%',
           opacity: 0.1,
           backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
           backgroundSize: '20px 20px'
         }}></div>
      </div>
    </div>
  );
};

export default TrackOrder;