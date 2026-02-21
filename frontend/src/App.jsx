import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminPricing from './pages/AdminPricing';
import AdminCouriers from './pages/AdminCouriers'; 
import AdminUsers from './pages/AdminUsers'; 

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
      <Route path="/" element={<Navigate to="/admin" />} />
    </Routes>
  );
}

export default App;