// src/features/package/packagePricing/packagePricing.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import PackagePricingListPage from "./pages/PackagePricingListPage";
import PackagePricingCreatePage from "./pages/PackagePricingCreatePage";
import PackagePricingEditPage from "./pages/PackagePricingEditPage";

export default function PackagePricingRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="packages.pricing" action="can_view">
            <PackagePricingListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="packages.pricing" action="can_create">
            <PackagePricingCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="packages.pricing" action="can_edit">
            <PackagePricingEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
