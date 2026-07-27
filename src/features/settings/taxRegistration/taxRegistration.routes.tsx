// src/features/settings/taxRegistration/taxRegistration.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import TaxRegistrationListPage from "./pages/TaxRegistrationListPage";
import TaxRegistrationCreatePage from "./pages/TaxRegistrationCreatePage";
import TaxRegistrationEditPage from "./pages/TaxRegistrationEditPage";

export default function TaxRegistrationRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="settings.tax_registration" action="can_view">
            <TaxRegistrationListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="settings.tax_registration" action="can_create">
            <TaxRegistrationCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="settings.tax_registration" action="can_edit">
            <TaxRegistrationEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
