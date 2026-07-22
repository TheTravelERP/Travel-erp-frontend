// src/features/package/packageService/packageService.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import PackageServiceListPage from "./pages/PackageServiceListPage";
import PackageServiceCreatePage from "./pages/PackageServiceCreatePage";
import PackageServiceEditPage from "./pages/PackageServiceEditPage";

export default function PackageServiceRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="packages.services" action="can_view">
            <PackageServiceListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="packages.services" action="can_create">
            <PackageServiceCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="packages.services" action="can_edit">
            <PackageServiceEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
