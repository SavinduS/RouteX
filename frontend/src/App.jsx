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

// Entrepreneur Pages
import EntrepreneurDashboard from "./pages/EntrepreneurDashboard";
import MyDeliveries from "./pages/MyDeliveries";
import CreateDelivery from "./pages/CreateDelivery";
import TrackOrder from "./pages/TrackOrder"; 

// Sidebar එක පෙන්වීමට Layout එක (අමතක වූවා නම් import කරගන්න)
import EntrepreneurLayout from './components/EntrepreneurLayout'; 

function App() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<Home />} />

      {/* Auth Routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Routes (නිවැරදිව Comment එක වසා ඇත) */}
      {/* 
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="pricing" element={<AdminPricing />} />
        <Route path="couriers" element={<AdminCouriers />} />
        <Route path="entrepreneurs" element={<AdminUsers />} />
      </Route>
      */}
      
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