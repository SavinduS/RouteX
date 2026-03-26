import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import UserProfile from "./pages/UserProfile";

// Admin Imports
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminPricing from "./pages/AdminPricing";
import AdminCouriers from "./pages/AdminCouriers";
import AdminUsers from "./pages/AdminUsers";

// Entrepreneur Imports
import EntrepreneurLayout from "./components/EntrepreneurLayout";
import EntrepreneurDashboard from "./pages/EntrepreneurDashboard";
import MyDeliveries from "./pages/MyDeliveries";
import CreateDelivery from "./pages/CreateDelivery";
import TrackOrder from "./pages/TrackOrder";

// Driver Imports (Added)
import DriverDashboard from "./pages/DriverDashboard";
import DriverLayout from "./components/DriverLayout";
import DriverEarnings from "./pages/DriverEarnings";
import AvailableOrders from "./pages/AvailableOrders";

// Admin Protection Component
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

// Entrepreneur Protection Component 
function EntrepreneurRoute({ children }) {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  if (!token || !storedUser) return <Navigate to="/login" replace />;
  try {
    const user = JSON.parse(storedUser);
    return user?.role === "entrepreneur" ? (
      children
    ) : (
      <Navigate to="/" replace />
    );
  } catch {
    return <Navigate to="/login" replace />;
  }
}

// Driver Protection Component (Added)
function DriverRoute({ children }) {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  if (!token || !storedUser) return <Navigate to="/login" replace />;
  try {
    const user = JSON.parse(storedUser);
    return user?.role === "driver" ? children : <Navigate to="/" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
}

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

      {/* 3. Admin Routes */}
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
      {/* Entrepreneur Routes (Protected & Layout Attached) */}
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

      {/* 5. Driver Routes (Added) */}
      <Route
        path="/driver"
        element={
          <DriverRoute>
            <DriverLayout />
          </DriverRoute>
        }
      >
        <Route index element={<DriverDashboard />} />
        <Route path="dashboard" element={<DriverDashboard />} />
        <Route path="available-orders" element={<AvailableOrders />} />
        <Route path="earnings" element={<DriverEarnings />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
