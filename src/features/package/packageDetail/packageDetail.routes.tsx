// src/features/package/packageDetail/packageDetail.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import PackageDetailListPage from "./pages/PackageDetailListPage";
import PackageDetailCreatePage from "./pages/PackageDetailCreatePage";
import PackageDetailEditPage from "./pages/PackageDetailEditPage";

export default function PackageDetailRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="packages.details" action="can_view">
            <PackageDetailListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="packages.details" action="can_create">
            <PackageDetailCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="packages.details" action="can_edit">
            <PackageDetailEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
