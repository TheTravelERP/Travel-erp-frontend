// src/features/package/packageType/packageType.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import PackageTypeListPage from "./pages/PackageTypeListPage";
import PackageTypeCreatePage from "./pages/PackageTypeCreatePage";
import PackageTypeEditPage from "./pages/PackageTypeEditPage";

export default function PackageTypeRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="packages.types" action="can_view">
            <PackageTypeListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="packages.types" action="can_create">
            <PackageTypeCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="packages.types" action="can_edit">
            <PackageTypeEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
