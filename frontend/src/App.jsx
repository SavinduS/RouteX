import { Routes, Route, Navigate } from 'react-router-dom';

import Home from "./pages/Home";
import Register from './pages/Register';
import Login from './pages/Login';

import ProtectedRoute from "./components/ProtectedRoute";
import UserProfile from "./pages/UserProfile";

import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminPricing from './pages/AdminPricing';
import AdminCouriers from './pages/AdminCouriers';
import AdminUsers from './pages/AdminUsers';

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(storedUser);
    if (user?.role !== "admin") {
      return <Navigate to="/" replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>

      {/*Home*/}
      <Route path="/" element={<Home />} />

      {/* Auth Routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
       <Route
        path="/admin"
        element={(
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        )}
      >
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