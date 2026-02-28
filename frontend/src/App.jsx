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

import EntrepreneurDashboard from "./pages/EntrepreneurDashboard";
import MyDeliveries from "./pages/MyDeliveries";
import CreateDelivery from "./pages/CreateDelivery";
import TrackOrder from "./pages/TrackOrder"; 

// Sidebar එක පෙන්වීමට Layout එක (අමතක වූවා නම් import කරගන්න)
import EntrepreneurLayout from './components/EntrepreneurLayout'; 

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
// Entrepreneur Pages


function App() {
  return (
    <Routes>
      {/* Home */}
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
      
      
      {/* 2. Entrepreneur Section - Sidebar එක සහිත Layout එක භාවිතා කර ඇත */}
      <Route path="/entrepreneur" element={<EntrepreneurLayout />}>
        {/* /entrepreneur ලෙස ආ විට Dashboard එක පෙන්වයි */}
        <Route index element={<EntrepreneurDashboard />} /> 
        <Route path="dashboard" element={<EntrepreneurDashboard />} />
        <Route path="my-deliveries" element={<MyDeliveries />} />
        <Route path="create-delivery" element={<CreateDelivery />} />
        <Route path="track/:id" element={<TrackOrder />} />
      </Route>

      {/* වැරදි URL එකක් ගැහුවොත් Home එකට Navigate කිරීම */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;