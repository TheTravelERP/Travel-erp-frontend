// src/features/package/package.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../app/router/PermissionRoute";

import PackageListPage from "./pages/PackageListPage";
import PackageCreatePage from "./pages/PackageCreatePage";
import PackageEditPage from "./pages/PackageEditPage";

export default function PackageRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="packages.list" action="can_view">
            <PackageListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="packages.list" action="can_create">
            <PackageCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="packages.list" action="can_edit">
            <PackageEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
