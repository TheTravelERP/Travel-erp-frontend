// src/app/router/index.tsx

import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../../auth/pages/LoginPage';
import RegisterPage from '../../auth/pages/RegisterPage';
import AppLayout from '../../layout/AppLayout';
import DashboardPage from '../../features/dashboard/pages/DashboardPage';
import PermissionRoute from './PermissionRoute';
import UnauthorizedPage from '../../pages/errors/UnauthorizedPage';
import ForgotPasswordPage from '../../auth/pages/ForgotPasswordPage';
import EnquiryRoutes from '../../features/enquiry/enquiry.routes';



export default function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected Layout */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard (permission protected) */}
        <Route
          path="/dashboard"
          element={
            <PermissionRoute menuId="dashboard">
              <DashboardPage />
            </PermissionRoute>
          }
        />

  
        <Route path="/app/enquiries/*" element={<EnquiryRoutes />} />

        {/* Unauthorized */}
        <Route path="/app/unauthorized" element={<UnauthorizedPage />} />

      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

