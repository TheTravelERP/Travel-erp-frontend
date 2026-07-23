// src/features/inventory/vendorContract/vendorContract.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import VendorContractListPage from "./pages/VendorContractListPage";
import VendorContractCreatePage from "./pages/VendorContractCreatePage";
import VendorContractEditPage from "./pages/VendorContractEditPage";
import VendorContractViewPage from "./pages/VendorContractViewPage";

export default function VendorContractRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="inventory.contracts" action="can_view">
            <VendorContractListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="inventory.contracts" action="can_create">
            <VendorContractCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid"
        element={
          <PermissionRoute menuId="inventory.contracts" action="can_view">
            <VendorContractViewPage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="inventory.contracts" action="can_edit">
            <VendorContractEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
