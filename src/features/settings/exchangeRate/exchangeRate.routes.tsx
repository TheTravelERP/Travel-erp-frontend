// src/features/settings/exchangeRate/exchangeRate.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import ExchangeRateListPage from "./pages/ExchangeRateListPage";
import ExchangeRateCreatePage from "./pages/ExchangeRateCreatePage";
import ExchangeRateEditPage from "./pages/ExchangeRateEditPage";

export default function ExchangeRateRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="settings.exchange_rate_master" action="can_view">
            <ExchangeRateListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="settings.exchange_rate_master" action="can_create">
            <ExchangeRateCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="settings.exchange_rate_master" action="can_edit">
            <ExchangeRateEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
