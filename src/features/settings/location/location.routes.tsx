// src/features/settings/location/location.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import LocationListPage from "./pages/LocationListPage";
import LocationCreatePage from "./pages/LocationCreatePage";
import LocationEditPage from "./pages/LocationEditPage";
import LocationViewPage from "./pages/LocationViewPage";

export default function LocationRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="settings.location_master" action="can_view">
            <LocationListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="settings.location_master" action="can_create">
            <LocationCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid"
        element={
          <PermissionRoute menuId="settings.location_master" action="can_view">
            <LocationViewPage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="settings.location_master" action="can_edit">
            <LocationEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
