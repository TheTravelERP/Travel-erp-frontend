// src/features/inventory/vendor/vendor.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import VendorListPage from "./pages/VendorListPage";
import VendorCreatePage from "./pages/VendorCreatePage";
import VendorEditPage from "./pages/VendorEditPage";

export default function VendorRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="inventory.vendor_master" action="can_view">
            <VendorListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="inventory.vendor_master" action="can_create">
            <VendorCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="inventory.vendor_master" action="can_edit">
            <VendorEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
