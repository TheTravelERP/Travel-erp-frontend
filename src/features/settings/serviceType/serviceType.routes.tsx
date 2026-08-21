// src/features/settings/serviceType/serviceType.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import ServiceTypeListPage from "./pages/ServiceTypeListPage";
import ServiceTypeCreatePage from "./pages/ServiceTypeCreatePage";
import ServiceTypeEditPage from "./pages/ServiceTypeEditPage";

export default function ServiceTypeRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="settings.service_type_master" action="can_view">
            <ServiceTypeListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="settings.service_type_master" action="can_create">
            <ServiceTypeCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="settings.service_type_master" action="can_edit">
            <ServiceTypeEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
