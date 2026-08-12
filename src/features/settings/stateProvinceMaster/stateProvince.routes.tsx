// src/features/settings/stateProvinceMaster/stateProvince.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import StateProvinceListPage from "./pages/StateProvinceListPage";
import StateProvinceCreatePage from "./pages/StateProvinceCreatePage";
import StateProvinceEditPage from "./pages/StateProvinceEditPage";

export default function StateProvinceRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="settings.state_province_master" action="can_view">
            <StateProvinceListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="settings.state_province_master" action="can_create">
            <StateProvinceCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="settings.state_province_master" action="can_edit">
            <StateProvinceEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
