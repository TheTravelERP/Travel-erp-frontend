// src/features/settings/currencyMaster/currencyMaster.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import CurrencyMasterListPage from "./pages/CurrencyMasterListPage";
import CurrencyMasterCreatePage from "./pages/CurrencyMasterCreatePage";
import CurrencyMasterEditPage from "./pages/CurrencyMasterEditPage";

export default function CurrencyMasterRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="settings.currency_master" action="can_view">
            <CurrencyMasterListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="settings.currency_master" action="can_create">
            <CurrencyMasterCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="settings.currency_master" action="can_edit">
            <CurrencyMasterEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
