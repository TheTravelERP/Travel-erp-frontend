// src/features/settings/currencyRatePolicy/currencyRatePolicy.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import CurrencyRatePolicyListPage from "./pages/CurrencyRatePolicyListPage";
import CurrencyRatePolicyCreatePage from "./pages/CurrencyRatePolicyCreatePage";
import CurrencyRatePolicyEditPage from "./pages/CurrencyRatePolicyEditPage";

export default function CurrencyRatePolicyRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="settings.currency_rate_policy" action="can_view">
            <CurrencyRatePolicyListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="settings.currency_rate_policy" action="can_create">
            <CurrencyRatePolicyCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="settings.currency_rate_policy" action="can_edit">
            <CurrencyRatePolicyEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
