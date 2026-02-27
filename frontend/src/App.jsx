import { Routes, Route, Navigate } from 'react-router-dom';

import Home from "./pages/Home";
import Register from './pages/Register';
import Login from './pages/Login';

import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminPricing from './pages/AdminPricing';
import AdminCouriers from './pages/AdminCouriers';
import AdminUsers from './pages/AdminUsers';

function App() {
  return (
    <Routes>

      {/*Home*/}
      <Route path="/" element={<Home />} />

      {/* Auth Routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="pricing" element={<AdminPricing />} />
        <Route path="couriers" element={<AdminCouriers />} />
        <Route path="entrepreneurs" element={<AdminUsers />} />
      </Route> 

      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}

export default App;