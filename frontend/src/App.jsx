import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminPricing from './pages/AdminPricing';
import AdminCouriers from './pages/AdminCouriers'; 
import AdminUsers from './pages/AdminUsers'; 

// Entrepreneur Pages (ඔයාගේ - Member 2)
import MyDeliveries from "./pages/MyDeliveries";
import CreateDelivery from "./pages/CreateDelivery";
import TrackOrder from "./pages/TrackOrder"; 

function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="pricing" element={<AdminPricing />} />
        <Route path="couriers" element={<AdminCouriers />} />
        <Route path="entrepreneurs" element={<AdminUsers />} />
      </Route>
      
       {/* 2. Entrepreneur Section - මේක Admin එකෙන් එළියේ තියෙන්නේ */}
      <Route path="/entrepreneur">
        <Route path="my-deliveries" element={<MyDeliveries />} />
        <Route path="create-delivery" element={<CreateDelivery />} />
        <Route path="track/:id" element={<TrackOrder />} />
      </Route>
      
      <Route path="/" element={<Navigate to="/admin" />} />
     
    </Routes>
  );
}

export default App;