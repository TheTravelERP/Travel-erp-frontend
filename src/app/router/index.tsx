import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../../auth/pages/LoginPage';
import RegisterPage from '../../auth/pages/RegisterPage';
import AppLayout from '../../layout/AppLayout';
import CrmRoutes from '../../pages/crm/crm.routes';
import DashboardPage from '../../pages/dashboard/DashboardPage';
import PermissionRoute from './PermissionRoute';
import UnauthorizedPage from '../../pages/system/UnauthorizedPage';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

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

        {/* CRM */}
        <Route path="/app/crm/*" element={<CrmRoutes />} />

        {/* Unauthorized */}
        <Route path="/app/unauthorized" element={<UnauthorizedPage />} />

      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

