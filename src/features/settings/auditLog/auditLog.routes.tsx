// src/features/settings/auditLog/auditLog.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import AuditLogListPage from "./pages/AuditLogListPage";

export default function AuditLogRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="settings.audit_log" action="can_view">
            <AuditLogListPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
