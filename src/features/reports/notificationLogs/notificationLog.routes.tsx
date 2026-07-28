// src/features/reports/notificationLogs/notificationLog.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";
import NotificationLogListPage from "./pages/NotificationLogListPage";

export default function NotificationLogRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="reports.notification_logs" action="can_view">
            <NotificationLogListPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
