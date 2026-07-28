// src/features/settings/notificationTemplates/notificationTemplate.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import NotificationTemplateListPage from "./pages/NotificationTemplateListPage";
import NotificationTemplateCreatePage from "./pages/NotificationTemplateCreatePage";
import NotificationTemplateEditPage from "./pages/NotificationTemplateEditPage";

export default function NotificationTemplateRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="settings.notifications" action="can_view">
            <NotificationTemplateListPage />
          </PermissionRoute>
        }
      />
      <Route
        path="create"
        element={
          <PermissionRoute menuId="settings.notifications" action="can_create">
            <NotificationTemplateCreatePage />
          </PermissionRoute>
        }
      />
      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="settings.notifications" action="can_edit">
            <NotificationTemplateEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
