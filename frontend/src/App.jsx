import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";

import Register from './pages/Register';
import Login from './pages/Login';
import ProtectedRoute from "./components/ProtectedRoute";
import UserProfile from "./pages/UserProfile";

// Admin Imports
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminPricing from './pages/AdminPricing';
import AdminCouriers from './pages/AdminCouriers';
import AdminUsers from './pages/AdminUsers';


// Entrepreneur Imports
import EntrepreneurLayout from './components/EntrepreneurLayout'; 
import EntrepreneurDashboard from "./pages/EntrepreneurDashboard";
import MyDeliveries from "./pages/MyDeliveries";
import CreateDelivery from "./pages/CreateDelivery";
import TrackOrder from "./pages/TrackOrder";




function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  if (!token || !storedUser) return <Navigate to="/login" replace />;
  try {
    const user = JSON.parse(storedUser);
    return user?.role === "admin" ? children : <Navigate to="/" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
}

// Entrepreneur Protection Component (අලුතින් එකතු කළා)
function EntrepreneurRoute({ children }) {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  if (!token || !storedUser) return <Navigate to="/login" replace />;
  try {
    const user = JSON.parse(storedUser);
    return user?.role === "entrepreneur" ? children : <Navigate to="/" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
}

// Entrepreneur Pages


function App() {
  return (
    <Routes>
      {/* 1. Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* 2. Logged-in User Profile */}
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
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="pricing" element={<AdminPricing />} />
        <Route path="couriers" element={<AdminCouriers />} />
        <Route path="entrepreneurs" element={<AdminUsers />} />
      </Route>


      {/* 4. Entrepreneur Routes (Protected & Layout Attached) */}
      <Route
        path="/entrepreneur"
        element={
          <EntrepreneurRoute>
            <EntrepreneurLayout />
          </EntrepreneurRoute>
        }
      >

        <Route index element={<EntrepreneurDashboard />} />
        <Route path="dashboard" element={<EntrepreneurDashboard />} />
        <Route path="my-deliveries" element={<MyDeliveries />} />
        <Route path="create-delivery" element={<CreateDelivery />} />
        <Route path="track/:id" element={<TrackOrder />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
