// src/features/settings/localizationProfile/localizationProfile.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import LocalizationProfileListPage from "./pages/LocalizationProfileListPage";
import LocalizationProfileCreatePage from "./pages/LocalizationProfileCreatePage";
import LocalizationProfileEditPage from "./pages/LocalizationProfileEditPage";
import LocalizationProfileViewPage from "./pages/LocalizationProfileViewPage";

export default function LocalizationProfileRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="settings.localization_profile" action="can_view">
            <LocalizationProfileListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="settings.localization_profile" action="can_create">
            <LocalizationProfileCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid"
        element={
          <PermissionRoute menuId="settings.localization_profile" action="can_view">
            <LocalizationProfileViewPage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="settings.localization_profile" action="can_edit">
            <LocalizationProfileEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
