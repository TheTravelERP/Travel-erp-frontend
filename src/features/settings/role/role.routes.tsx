// src/features/settings/role/role.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import RoleListPage from "./pages/RoleListPage";
import RoleCreatePage from "./pages/RoleCreatePage";
import RoleEditPage from "./pages/RoleEditPage";
import RoleViewPage from "./pages/RoleViewPage";
import RolePermissionsPage from "./pages/RolePermissionsPage";

export default function RoleRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="settings.permissions" action="can_view">
            <RoleListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="settings.permissions" action="can_create">
            <RoleCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid"
        element={
          <PermissionRoute menuId="settings.permissions" action="can_view">
            <RoleViewPage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="settings.permissions" action="can_edit">
            <RoleEditPage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/permissions"
        element={
          <PermissionRoute menuId="settings.permissions" action="can_edit">
            <RolePermissionsPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
