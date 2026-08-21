// src/features/settings/taxCode/taxCode.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import TaxCodeListPage from "./pages/TaxCodeListPage";
import TaxCodeCreatePage from "./pages/TaxCodeCreatePage";
import TaxCodeEditPage from "./pages/TaxCodeEditPage";
import TaxCodeViewPage from "./pages/TaxCodeViewPage";

export default function TaxCodeRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="settings.tax_code_master" action="can_view">
            <TaxCodeListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="settings.tax_code_master" action="can_create">
            <TaxCodeCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid"
        element={
          <PermissionRoute menuId="settings.tax_code_master" action="can_view">
            <TaxCodeViewPage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="settings.tax_code_master" action="can_edit">
            <TaxCodeEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
