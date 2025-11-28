import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../../auth/pages/LoginPage';
import RegisterPage from '../../auth/pages/RegisterPage';
import AppLayout from '../../layout/AppLayout';
import DashboardPage from '../../pages/dashboard/DashboardPage';
import UserList from '../../pages/UserList';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage/>} />
      <Route path="/register" element={<RegisterPage/>} />

      {/* Protected Layout */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        
        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Sales */}
        <Route path="/sales" element={<div>Sales</div>} />

        {/* Customer */}
        <Route path="/customer" element={<div>Customer</div>} />

        {/* Enquiries */}
        <Route path="/enquiries" element={<div>Enquiries</div>} />

        {/* Reports */}
        <Route path="/reports" element={<div>Reports</div>} />

        {/* Settings */}
        <Route path="/settings" element={<div>Settings</div>} />

        {/* ✅ USER MANAGEMENT PAGE */}
        <Route path="/app/settings/users" element={<UserList />} />

      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
