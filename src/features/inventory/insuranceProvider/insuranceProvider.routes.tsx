// src/features/inventory/insuranceProvider/insuranceProvider.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import InsuranceProviderListPage from "./pages/InsuranceProviderListPage";
import InsuranceProviderCreatePage from "./pages/InsuranceProviderCreatePage";
import InsuranceProviderEditPage from "./pages/InsuranceProviderEditPage";

export default function InsuranceProviderRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="inventory.insurance" action="can_view">
            <InsuranceProviderListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="inventory.insurance" action="can_create">
            <InsuranceProviderCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="inventory.insurance" action="can_edit">
            <InsuranceProviderEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
