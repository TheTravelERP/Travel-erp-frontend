import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../../auth/pages/LoginPage';
import RegisterPage from '../../auth/pages/RegisterPage';
import AppLayout from '../../layout/AppLayout';
import CrmRoutes from '../../pages/crm/crm.routes';
import DashboardPage from '../../pages/dashboard/DashboardPage';

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
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/app/crm/*" element={<CrmRoutes />} />


      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={`/app/dashboard`} replace />} />
    </Routes>
  );
}
