// src/features/notifications/notificationCenter.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../app/router/PermissionRoute";

import NotificationCenterPage from "./pages/NotificationCenterPage";

export default function NotificationCenterRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="notifications.center" action="can_view">
            <NotificationCenterPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
